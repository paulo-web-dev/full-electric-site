# Deploy — servidor próprio

O site roda em **um container Docker** (Next.js standalone) atrás do **Caddy**
(TLS automático + proxy reverso) instalado direto no servidor. O banco é
**Postgres gerenciado no Neon** (serviço externo) — nada de banco no servidor.

```
internet ──443──▶ Caddy (host) ──127.0.0.1:3000──▶ container full-electric-app ──▶ Neon (Postgres, externo)
```

Fluxo de cada deploy: `git pull → docker compose build → docker compose up -d`.
O container aplica as migrations do Prisma **antes** de subir o servidor; se
uma migration falhar, ele não sobe.

---

## 1. Pré-requisitos do servidor

| Item | Mínimo | Observação |
|---|---|---|
| SO | Ubuntu 22.04 ou 24.04 LTS | Debian 12 também serve |
| CPU / RAM | 2 vCPU / **4 GB** | O `next build` roda no servidor e passa de 2 GB em pico. Com 2 GB, crie 2 GB de swap |
| Disco | 20 GB | Imagens antigas são podadas a cada deploy |
| Rede | Portas **80** e **443** abertas | 3000 fica só em localhost |
| DNS | Registro A do domínio (e do `www`) apontando para o IP | Caddy só emite o certificado com o DNS resolvendo |
| Banco | Projeto no [Neon](https://neon.tech) | Gerenciado, fora do servidor. Copie as duas connection strings (com e sem pooler) para o `.env` |

Pacotes:

```bash
# Docker Engine + Compose plugin (script oficial)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # relogar depois

# Git
sudo apt-get install -y git

# Caddy (repositório oficial)
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy

# Firewall
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
```

Não precisa instalar Node, npm, Postgres client nem Prisma no servidor — tudo
roda dentro das imagens.

### Banco de dados: Neon, gerenciado

O Postgres **não roda neste servidor**. Ele é um projeto no Neon, com backups,
atualizações e disponibilidade por conta deles. O que o servidor precisa é só
das duas connection strings no `.env`:

- `DATABASE_URL` — a string **com pooler** (host `*-pooler.*.neon.tech`), usada
  pelo app em runtime;
- `DIRECT_URL` — a string **sem pooler**, usada pelo `prisma migrate deploy` no
  entrypoint (o pooler do Neon não suporta as sessões que a migration exige).

As duas aparecem no painel do Neon em *Connection Details* (alternar o toggle
"Pooled connection"). Use `sslmode=require` nas duas. Se o projeto for
recriado ou trocar de região, basta atualizar o `.env` e `docker compose up -d`
— não é variável de build.

---

## 2. Caddy

`/etc/caddy/Caddyfile` (troque `fullelectric.com.br` pelo domínio real):

```caddyfile
fullelectric.com.br {
	encode zstd gzip

	# Segurança básica
	header {
		Strict-Transport-Security "max-age=31536000; includeSubDomains"
		X-Content-Type-Options nosniff
		Referrer-Policy strict-origin-when-cross-origin
		-Server
	}

	# Assets com hash no nome: cache longo na borda
	@estaticos path /_next/static/*
	header @estaticos Cache-Control "public, max-age=31536000, immutable"

	reverse_proxy 127.0.0.1:3000
}

# www → sem www
www.fullelectric.com.br {
	redir https://fullelectric.com.br{uri} permanent
}
```

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

O Caddy obtém e renova o certificado Let's Encrypt sozinho. O `reverse_proxy`
acrescenta o IP do visitante ao fim do `X-Forwarded-For`; é por isso que o
`.env` leva `TRUST_PROXY_HOPS=1`. Se um dia colocar Cloudflare na frente, vira 2.

---

## 3. Primeira instalação

```bash
sudo mkdir -p /srv/full-electric && sudo chown $USER /srv/full-electric
git clone <URL_DO_REPOSITORIO> /srv/full-electric
cd /srv/full-electric

cp .env.example .env
nano .env          # preencher tudo — ver README, seção "Variáveis de ambiente"
chmod 600 .env
chmod +x scripts/*.sh
```

### Banco já existente (criado com `prisma db push` na fase Vercel)

Se o banco **já tem as tabelas**, o `migrate deploy` vai tentar criá-las de
novo e falhar. Registre o baseline uma única vez, antes do primeiro deploy:

```bash
docker run --rm -it --env-file .env -v "$PWD/prisma:/prisma" node:22-bookworm-slim \
  sh -c "apt-get update -qq && apt-get install -y -qq openssl >/dev/null && npx -y prisma@6 migrate resolve --applied 20260824000000_init --schema /prisma/schema.prisma"
```

Banco vazio: não faça nada — o entrypoint aplica o baseline sozinho.

### Subir

```bash
scripts/deploy.sh
```

O script faz `git pull`, build, marca a imagem com o SHA do commit, `up -d` e
espera o healthcheck ficar `healthy`. Teste: `curl -s https://SEU_DOMINIO/api/health`.

---

## 4. Deploy de uma nova versão

```bash
cd /srv/full-electric
scripts/deploy.sh          # ou scripts/deploy.sh <branch>
```

Equivale a:

```bash
git pull --ff-only origin main
docker compose build --pull          # NEXT_PUBLIC_* do .env entram aqui
docker tag full-electric-site:latest full-electric-site:$(git rev-parse --short HEAD)
docker compose up -d                 # recria o container; ~5 s de indisponibilidade
docker image prune -f
```

**Mudou uma variável `NEXT_PUBLIC_*` no `.env`?** É obrigatório o
`docker compose build` — só `up -d` não aplica (o valor está dentro do bundle).
Variáveis de runtime (`DATABASE_URL`, `ADMIN_PASSWORD`, etc.) precisam só de
`docker compose up -d`.

Logs: `docker compose logs -f app`.

---

## 5. Rollback

Cada deploy deixa a imagem anterior marcada com o SHA do commit:

```bash
docker images full-electric-site        # lista as versões disponíveis
```

Voltar para uma versão específica **sem rebuild**:

```bash
docker tag full-electric-site:<SHA_ANTERIOR> full-electric-site:latest
docker compose up -d --no-build
```

Ou pelo código: `git checkout <SHA_ANTERIOR> && docker compose build && docker compose up -d`.

**Atenção com migrations.** O Prisma não tem "migrate down". Se a versão nova
aplicou uma migration e você voltar para a imagem antiga:

- Migration que só **adicionou** coluna/tabela: a versão antiga ignora e
  funciona. O entrypoint antigo verá uma migration aplicada que não conhece —
  ele apenas avisa e segue.
- Migration que **renomeou/removeu** algo: a versão antiga quebra. Restaure o
  backup feito antes do deploy (seção 6) e só depois suba a imagem antiga.

Para subir uma imagem pulando o `migrate deploy` em emergência, acrescente
`SKIP_MIGRATIONS=1` ao `.env`, faça `up -d`, e **remova depois**.

---

## 6. Backup do Postgres

`scripts/backup.sh` roda `pg_dump` pela imagem oficial `postgres:17`, grava em
`backups/leads-AAAAMMDD-HHMMSS.dump` (formato custom, comprimido) e mantém os
30 mais recentes. Usa `DIRECT_URL` do `.env`.

```bash
scripts/backup.sh
```

Diário às 3h, via cron (`crontab -e`):

```cron
0 3 * * * /srv/full-electric/scripts/backup.sh >> /srv/full-electric/backups/backup.log 2>&1
```

Faça também um backup **manual antes de cada deploy que traga migration**.

Os dumps contêm dados pessoais de leads (LGPD). Mantenha `backups/` com
permissão restrita e copie para fora do servidor (rclone/S3/Backblaze) com
criptografia — um servidor só não é backup.

### Restaurar

```bash
docker run --rm -i postgres:17 \
  pg_restore --clean --if-exists --no-owner --no-privileges \
  --dbname "$(grep -E '^DIRECT_URL=' .env | cut -d= -f2-)" \
  < backups/leads-AAAAMMDD-HHMMSS.dump
```

Alternativa sem dump: o Neon guarda histórico do banco e
permite restaurar para um ponto no tempo pelo painel (branch/restore).


---

## 7. Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Container reinicia em loop, log diz `migration não aplicada` | `DIRECT_URL` vazio/errado, ou banco já tinha tabelas sem baseline | Conferir `.env`; ver "Banco já existente" na seção 3 |
| Formulário some de vez em quando para todo mundo | Rate limit lendo o IP do proxy em vez do cliente | `TRUST_PROXY_HOPS=1` no `.env` e `up -d` |
| Sitemap/robots com `localhost:3000` | `NEXT_PUBLIC_SITE_URL` vazio no build | Preencher no `.env` e **rebuildar** |
| Certificado não emite | DNS ainda não aponta para o servidor, ou porta 80 fechada | `dig SEU_DOMINIO`, `sudo ufw status`, `journalctl -u caddy` |
| Build morre com `Killed` | Falta de memória | Criar swap: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile` |
| Imagens do site lentas após deploy | Cache de otimização vazio | Normal na primeira visita; o volume `next-cache` preserva entre deploys |
