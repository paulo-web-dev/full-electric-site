# Imagem de produção — servidor próprio (docs/DEPLOY.md).
#
# Debian slim, não Alpine: o engine do Prisma é compilado para glibc/OpenSSL 3
# (debian-openssl-3.0.x); em musl exigiria binaryTargets extra e engine maior.
ARG NODE_IMAGE=node:22-bookworm-slim

# ---------- deps: node_modules completo (inclui devDeps para o build) ----------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
# O postinstall roda `prisma generate`, que precisa do schema
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

# ---------- prisma-cli: só o CLI, para `migrate deploy` no runner ----------
# Instalado à parte porque o standalone do Next não carrega o CLI, e copiar o
# node_modules inteiro para o runner triplicaria a imagem.
FROM deps AS prisma-cli
WORKDIR /opt/prisma
RUN npm install --omit=dev --no-audit --no-fund --no-package-lock \
    "prisma@$(node -p "require('/app/node_modules/prisma/package.json').version")"

# ---------- builder: next build ----------
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ⚠️ NEXT_PUBLIC_* entram no bundle do navegador DURANTE o build.
# Passar só no `docker run`/env_file não tem efeito. Ver README.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_WHATSAPP
ARG NEXT_PUBLIC_GA4_ID
ARG NEXT_PUBLIC_META_PIXEL_ID
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_WHATSAPP=${NEXT_PUBLIC_WHATSAPP} \
    NEXT_PUBLIC_GA4_ID=${NEXT_PUBLIC_GA4_ID} \
    NEXT_PUBLIC_META_PIXEL_ID=${NEXT_PUBLIC_META_PIXEL_ID} \
    NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate
RUN npm run build

# ---------- runner: imagem final ----------
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# openssl: exigido pelo engine do Prisma. ca-certificates: TLS para o Postgres.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs --home /app nextjs

# Standalone: server.js + só os node_modules rastreados (Prisma engine e sharp
# vão junto porque são dependências de runtime declaradas no package.json).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Migrations + CLI do Prisma para o entrypoint
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=prisma-cli --chown=nextjs:nodejs /opt/prisma/node_modules /opt/prisma/node_modules

# Enriquecimento de leads por IA, sob demanda (usa o @prisma/client que o
# standalone já rastreia): docker compose exec app node scripts/enriquecer-leads.mjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/enriquecer-leads.mjs ./scripts/enriquecer-leads.mjs

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
# Cache de imagens otimizadas: montado como volume nomeado (docker-compose.yml);
# criar aqui com o dono certo faz o volume nascer gravável pelo usuário nextjs.
RUN sed -i 's/\r$//' docker-entrypoint.sh \
 && chmod +x docker-entrypoint.sh \
 && mkdir -p .next/cache \
 && chown -R nextjs:nodejs .next/cache

USER nextjs
EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
