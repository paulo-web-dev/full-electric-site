# Full Electric — Site

Site de conversão da Full Electric Motos Elétricas (Curitiba/PR), com CRM de
leads em `/admin`. As regras do projeto (negócio, legal, visual, código) estão
em `CLAUDE.md` — leitura obrigatória antes de alterar qualquer coisa.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma + Postgres
(só para o CRM) · Docker em VPS compartilhada, atrás do Traefik já existente.

Conteúdo do site público em `content/*.json`, sem CMS.

## Desenvolvimento local

```bash
cp .env.example .env     # preencher DATABASE_URL/DIRECT_URL para usar o /admin
npm install              # roda `prisma generate`
npm run dev              # http://localhost:3000
```

Sem banco configurado, o site público funciona normalmente; só o `/admin` e a
gravação de leads ficam inativos.

Alterou `prisma/schema.prisma`? Gere a migration e versione-a junto:

```bash
npx prisma migrate dev --name descricao_curta
```

## Variáveis de ambiente

Todas em `.env.example`, com comentários. Há dois grupos, e a diferença importa:

> ### ⚠️ `NEXT_PUBLIC_*` são fixadas no **build**, não no `docker run`
>
> `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_GA4_ID` e
> `NEXT_PUBLIC_META_PIXEL_ID` são embutidas no JavaScript do navegador durante
> o `next build`. Elas entram na imagem como `ARG` do Dockerfile — o
> `docker-compose.yml` já as passa a partir do `.env` em `build.args`.
>
> Consequências práticas:
>
> - Passar essas variáveis só em `docker run -e`, `env_file` ou no painel de
>   um orquestrador **não tem efeito nenhum**.
> - Mudou o valor no `.env`? Precisa de **`docker compose build`** e depois
>   `up -d`. Só reiniciar o container mantém o valor antigo.
> - Uma imagem construída para um domínio não serve para outro.
>
> As demais variáveis (`DATABASE_URL`, `ADMIN_PASSWORD`, `TRUST_PROXY_HOPS`…)
> são lidas em runtime e aplicam com um simples `docker compose up -d`.

## Deploy

Passo a passo completo, labels do Traefik, rollback e backup: **`docs/DEPLOY.md`**.

Resumo:

```bash
scripts/deploy.sh       # git pull → docker compose build → up -d → healthcheck
scripts/backup.sh       # pg_dump para backups/
```

## Estrutura

```
app/                  rotas (home, modelos, contato, política, admin, api)
components/           ui/ (Button, Card…) e sections/ (Hero, Modelos, FAQ…)
content/              site.json · modelos.json · faq.json
lib/                  whatsapp.ts · content.ts · crm.ts · db.ts · rateLimit.ts
prisma/               schema.prisma + migrations/
docs/                 DEPLOY.md · PENDENCIAS.md · marca, catálogo, legislação
Dockerfile            multi-stage (deps → builder → runner), Node 22 slim
docker-compose.yml    serviço app + healthcheck + volume do cache de imagens
scripts/              deploy.sh · backup.sh
```

## Antes de publicar

Leia `docs/PENDENCIAS.md`. Os itens em vermelho bloqueiam o lançamento — em
especial a medição de largura e entre-eixos das motos, que define se o discurso
"sem CNH" do site se sustenta.
