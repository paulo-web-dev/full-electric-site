# Deploy — VPS compartilhada, atrás do Traefik existente

O site roda em **um container Docker** (Next.js standalone) numa VPS que **já
está em produção** com outros serviços. O proxy reverso e o TLS são do
**Traefik v2.11 que já existe lá** — ele ocupa as portas 80/443 e atende
n8n, lps-unyflex, seminarios, jonias e video-assembler. **Não se instala
proxy nenhum** (nem Caddy, nem Nginx, nem outro Traefik): o nosso container
apenas entra na rede do Traefik e se anuncia por labels.

O banco é **Postgres gerenciado no Neon** (externo) — nada de banco na VPS.

```
internet ──80/443──▶ Traefik (já existente) ──rede n8n_default──▶ full-electric-app:3000 ──▶ Neon (Postgres, externo)
                         │
                         ├──▶ n8n
                         ├──▶ lps-unyflex
                         └──▶ ... (outros sites da VPS)
```

Fluxo de cada deploy: `git pull → docker compose build → docker compose up -d`.
O container aplica as migrations do Prisma **antes** de subir o servidor; se
uma migration falhar, ele não sobe.

---

## 1. O que a VPS já tem (não instalar de novo)

| Item | Estado | Como confirmar |
|---|---|---|
| Docker Engine + Compose plugin | Instalado | `docker compose version` |
| Traefik v2.11 | Container em produção, portas 80 e 443 | `docker ps --filter name=traefik` |
| Rede do Traefik | `n8n_default` (bridge, criada pelo compose do n8n) | `docker network ls \| grep n8n_default` |
| Entrypoints | `web` (:80) e `websecure` (:443) | `docker inspect <traefik> \| grep -i entrypoints` |
| Resolver de certificado | `le` (Let's Encrypt, httpChallenge no entrypoint `web`) | `docker inspect <traefik> \| grep -i certificatesresolvers` |
| Descoberta de serviços | `providers.docker.exposedbydefault=false` — **só sobe quem tem `traefik.enable=true`** | idem |
| Git | Instalado | `git --version` |

Se algum desses nomes for diferente do que está no `docker-compose.yml`
(rede, entrypoints, resolver), **ajuste as labels**, não o Traefik — os
outros sites dependem dele.

O que **precisa existir fora da VPS**:

- **DNS:** registro A de `fulleletric.unysystens.com.br` apontando para o IP
  da VPS. O Traefik só emite o certificado com o DNS resolvendo e a porta 80
  alcançável (é por ali que o httpChallenge passa).
- **Neon:** projeto criado, com as duas connection strings copiadas para o
  `.env` (seção 3).

Não precisa instalar Node, npm, Postgres client nem Prisma na VPS — tudo roda
dentro das imagens.

---

## 2. Como o Traefik descobre o site

Tudo está nas `labels` do serviço em `docker-compose.yml`, seguindo o mesmo
padrão que o `lps-unyflex` já usa:

| Label | Função |
|---|---|
| `traefik.enable=true` | Obrigatória — o Traefik ignora containers sem ela |
| `traefik.docker.network=n8n_default` | Em qual rede o Traefik deve procurar o IP do container |
| `routers.full-electric-web.rule=Host(...)` + `entrypoints=web` | Router HTTP (:80) |
| `routers.full-electric-web.middlewares=full-electric-redirect` + `middlewares.full-electric-redirect.redirectscheme.scheme=https` | HTTP → HTTPS |
| `routers.full-electric.rule=Host(...)` + `entrypoints=websecure` | Router HTTPS (:443) |
| `routers.full-electric.tls=true` + `tls.certresolver=le` | Certificado Let's Encrypt automático |
| `services.full-electric.loadbalancer.server.port=3000` | **Porta do Next dentro do container.** É 3000, não 80 como no lps-unyflex |

Duas consequências:

- **Nenhuma porta é publicada no host** (`ports:` não existe no compose). O
  Traefik fala com o container direto pela rede interna. Publicar `3000:3000`
  não é necessário e só exporia o app sem TLS.
- O serviço está na rede **`n8n_default`, declarada como `external: true`** —
  o compose não cria a rede, só se conecta a ela. Se ela não existir, o `up`
  falha (seção 8).

O redirecionamento HTTP → HTTPS não atrapalha a emissão do certificado: o
Traefik responde ao desafio ACME em `/.well-known/acme-challenge/` antes de
consultar os routers.

---

## 3. Primeira instalação

```bash
sudo mkdir -p /srv/full-electric && sudo chown $USER /srv/full-electric
git clone https://github.com/paulo-web-dev/full-electric-site.git /srv/full-electric
cd /srv/full-electric

cp .env.example .env
nano .env          # preencher tudo — ver README, seção "Variáveis de ambiente"
chmod 600 .env
chmod +x scripts/*.sh
```

No `.env`, para este ambiente:

- `NEXT_PUBLIC_SITE_URL=https://fulleletric.unysystens.com.br` (sem barra final)
- `TRUST_PROXY_HOPS=1` (seção 7)
- `DATABASE_URL` = string **com pooler** do Neon; `DIRECT_URL` = string **sem
  pooler**. As duas com `sslmode=require`. O `migrate deploy` do entrypoint usa
  a `DIRECT_URL` porque o pooler não suporta as sessões que a migration exige.
- `ADMIN_PASSWORD` e `SESSION_SECRET` (`openssl rand -base64 48`)
- `CRON_SECRET` (`openssl rand -hex 32`) — token do expurgo LGPD, ver §9
- `API_TOKEN` (`openssl rand -hex 32`, outro valor, mínimo 32 caracteres) —
  token do agente do WhatsApp nas rotas `/api/agent/*`, ver
  `docs/INTEGRACAO-WHATSAPP.md`

Confira que a rede do Traefik está lá antes de subir:

```bash
docker network ls | grep n8n_default
```

### Banco já existente (criado com `prisma db push` antes das migrations)

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
espera o healthcheck ficar `healthy`. O certificado leva mais alguns segundos
depois disso (o Traefik só pede quando vê o router novo).

Testes, nesta ordem:

```bash
docker compose ps                                   # State: Up (healthy)
docker logs traefik --tail 30 | grep -i full-electric   # router carregado? erro de ACME?
curl -sI http://fulleletric.unysystens.com.br       # 308/301 → https
curl -s https://fulleletric.unysystens.com.br/api/health   # {"ok":true,...}
```

(O nome do container do Traefik pode não ser `traefik` — `docker ps` mostra.)

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

O Traefik percebe o container novo sozinho — não precisa reiniciar nem
recarregar nada nele. **Nunca** faça `docker compose down`/`restart` na pasta
do Traefik ou do n8n por causa deste site.

**Mudou uma variável `NEXT_PUBLIC_*` no `.env`?** É obrigatório o
`docker compose build` — só `up -d` não aplica (o valor está dentro do bundle).
Variáveis de runtime (`DATABASE_URL`, `ADMIN_PASSWORD`, etc.) precisam só de
`docker compose up -d`.

**Mudou o domínio?** Dois lugares: as labels `Host(...)` no compose **e**
`NEXT_PUBLIC_SITE_URL` no `.env` (com rebuild). O DNS do domínio novo precisa
apontar para a VPS antes do `up`, senão o Traefik falha ao pedir o certificado
e fica tentando de novo.

Logs: `docker compose logs -f app`.

Memória: o `next build` roda na VPS e passa de 2 GB em pico, **junto com tudo
o que já está rodando lá**. Se o build morrer com `Killed`, ver seção 8.

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

Diário às 3h, via cron. `scripts/cron.sh` instala esta linha e a do expurgo
(§9) de uma vez, sem duplicar se rodar de novo:

```bash
scripts/cron.sh
```

Equivale a, no `crontab -e`:

```cron
0 3 * * * /srv/full-electric/scripts/backup.sh >> /srv/full-electric/backups/backup.log 2>&1
```

Faça também um backup **manual antes de cada deploy que traga migration**.

Os dumps contêm dados pessoais de leads (LGPD). Mantenha `backups/` com
permissão restrita e copie para fora da VPS (rclone/S3/Backblaze) com
criptografia — um servidor só não é backup, e este é compartilhado.

### Restaurar

```bash
docker run --rm -i postgres:17 \
  pg_restore --clean --if-exists --no-owner --no-privileges \
  --dbname "$(grep -E '^DIRECT_URL=' .env | cut -d= -f2-)" \
  < backups/leads-AAAAMMDD-HHMMSS.dump
```

Alternativa sem dump: o Neon guarda histórico do banco e permite restaurar
para um ponto no tempo pelo painel (branch/restore).

---

## 7. IP real do visitante (`TRUST_PROXY_HOPS`)

O rate limit do formulário (`lib/rateLimit.ts`) é por IP, lido do
`X-Forwarded-For`. Cada proxy acrescenta ao **fim** dessa lista o IP de quem
falou com ele; com `TRUST_PROXY_HOPS=N`, o app pega o N-ésimo a contar do fim.

**Neste ambiente, `TRUST_PROXY_HOPS=1`.** O que o Traefik entrega ao
container:

| Configuração do Traefik | `X-Forwarded-For` que chega ao app | Último item |
|---|---|---|
| Padrão (`forwardedHeaders` sem `trustedIPs`) — o caso da VPS | `<IP do visitante>` — o Traefik **descarta** qualquer XFF que o cliente mande e escreve só o IP real | visitante ✓ |
| Com `trustedIPs` contendo um proxy à frente | `<o que o proxy mandou>, <IP do proxy>` | esse proxy — aí seria N=2 |

Detalhe que confunde: o Traefik **não coloca o próprio IP** no
`X-Forwarded-For`. Ele acrescenta o IP de quem se conectou a ele, e quem se
conecta a ele é o visitante. O IP do Traefik só apareceria na lista se
houvesse *outro* proxy atrás dele — não é o caso.

Quando mudar para 2: se um dia entrar Cloudflare (modo proxy) na frente da VPS
**e** o Traefik for configurado com `forwardedHeaders.trustedIPs` para os
ranges da Cloudflare. Só Cloudflare sem essa configuração no Traefik dá o
sintoma da seção 8 ("formulário some para todo mundo") — porque o Traefik
descarta o XFF da Cloudflare e todo visitante chega com o IP dela.

Como conferir na prática, com o site no ar:

```bash
docker compose exec app node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>r.text()).then(console.log)"
docker compose logs app | grep -i "rate"          # se houver bloqueio, mostra a chave
```

Ou, temporariamente, `curl -H 'X-Forwarded-For: 1.2.3.4' https://fulleletric.unysystens.com.br/api/health`
de fora: com o Traefik padrão, esse header forjado **não** chega ao app.

---

## 8. Erros comuns

### `bind: address already in use` nas portas 80/443

```
Error response from daemon: driver failed programming external connectivity on endpoint ...:
Bind for 0.0.0.0:80 failed: port is already allocated
```

ou, em serviço instalado no host (Caddy, Nginx):

```
listen tcp :443: bind: address already in use
```

**Foi o que aconteceu aqui:** a primeira versão deste deploy previa instalar o
Caddy na VPS, mas as portas 80 e 443 já eram do Traefik que serve os outros
sites. **Não existe "subir um segundo proxy"** — duas coisas não escutam a
mesma porta. A solução foi a deste documento: apagar o Caddy, publicar porta
nenhuma e deixar o Traefik existente rotear pelas labels.

Como identificar quem está nas portas, antes de tentar qualquer coisa:

```bash
# Quem escuta 80 e 443 (processo, PID)
sudo ss -tlnp | grep -E ':80 |:443 '
#   LISTEN 0 4096 *:80  *:*  users:(("docker-proxy",pid=1234,fd=4))   ← é um container
#   LISTEN 0 4096 *:443 *:*  users:(("caddy",pid=5678,fd=7))          ← é um serviço do host

# Se for docker-proxy: qual container publica as portas
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}' | grep -E '(:80|:443)->'
#   traefik   traefik:v2.11   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp

# Se for serviço do host
systemctl status caddy nginx apache2 2>/dev/null | grep -E 'Loaded|Active'
```

Achou um proxy em produção? **Use-o.** Descubra a rede, os entrypoints e o
resolver dele e ajuste as labels no compose:

```bash
docker inspect traefik --format '{{json .Args}}' | tr ',' '\n' | grep -iE 'entrypoints|certificatesresolvers|exposedbydefault'
docker inspect traefik --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{"\n"}}{{end}}'
```

### Outros

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| `network n8n_default declared as external, but could not be found` | A rede do Traefik tem outro nome, ou o compose do n8n não está de pé | `docker network ls`; ajustar o nome no compose (em `networks:` **e** na label `traefik.docker.network`) |
| Domínio responde `404 page not found` (página do Traefik) | Router não carregou: falta `traefik.enable=true`, `Host()` com domínio errado, ou container em outra rede | `docker logs traefik \| grep -i full-electric`; `docker inspect full-electric-app` → `Networks` deve ter `n8n_default` |
| `Gateway Timeout` / `Bad Gateway` | Traefik acha o container mas não fala com a porta: label `loadbalancer.server.port` errada (tem que ser **3000**) ou app ainda subindo/migrando | `docker compose ps` (healthy?), `docker compose logs app` |
| Certificado inválido / "TRAEFIK DEFAULT CERT" | ACME falhou: DNS ainda não aponta para a VPS, ou porta 80 bloqueada, ou resolver com outro nome | `dig +short fulleletric.unysystens.com.br`; `docker logs traefik \| grep -iE 'acme\|certificate'`; conferir o nome do resolver no Traefik |
| Site abre em HTTP sem redirecionar | Router `-web` sem o middleware, ou middleware com nome diferente nos dois lados | Conferir as labels `routers.full-electric-web.middlewares` e `middlewares.full-electric-redirect.*` |
| Container reinicia em loop, log diz `migration não aplicada` | `DIRECT_URL` vazio/errado, ou banco já tinha tabelas sem baseline | Conferir `.env`; ver "Banco já existente" na seção 3 |
| Formulário some de vez em quando para todo mundo | Rate limit lendo o IP do proxy em vez do cliente | `TRUST_PROXY_HOPS=1` no `.env` e `up -d`; se houver Cloudflare, ver seção 7 |
| Sitemap/robots/OG com `localhost:3000` | `NEXT_PUBLIC_SITE_URL` vazio no build | Preencher no `.env` e **rebuildar** |
| Build morre com `Killed` | Falta de memória — a VPS é compartilhada e o `next build` passa de 2 GB | Criar swap (`fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`) ou buildar em outra máquina e enviar a imagem (`docker save`/`docker load`) |
| Outro site da VPS parou depois do nosso deploy | Alguém rodou `docker compose down` na pasta errada, ou `docker system prune` apagou rede/volume alheio | Nunca usar `prune` com `-a`/`--volumes` nesta VPS; `deploy.sh` só usa `image prune -f` (imagens sem tag) |
| Imagens do site lentas após deploy | Cache de otimização vazio | Normal na primeira visita; o volume `next-cache` preserva entre deploys |

---

## 9. Expurgo LGPD (retenção de 12 meses)

A Política de Privacidade promete apagar os dados de um lead **12 meses após
o último contato**. Quem cumpre isso é a rota `GET /api/admin/expurgo`:

- apaga leads cujo último sinal de vida — a data mais recente entre
  `atualizadoEm` e a última nota — tem mais de 12 meses;
- **lead VENDIDO nunca é apagado** (registro comercial: nota fiscal, garantia);
- notas caem em cascata;
- **simulação por padrão**: só apaga com `?confirmar=true`;
- cada execução (real ou simulada) grava uma linha em `ExpurgoLog`
  (data, limite usado, candidatos, apagados). O painel `/admin` mostra a última.

A rota não usa a sessão do admin: exige `Authorization: Bearer <CRON_SECRET>`.
Gere o token e coloque no `.env` (o container lê no próximo `up -d`):

```bash
openssl rand -hex 32          # → CRON_SECRET=... no .env
docker compose up -d          # recria o container com a variável
```

`scripts/expurgo.sh` chama a rota **de dentro do container** (`docker exec`),
porque o app não publica porta e a imagem não tem curl. Teste à mão antes de
agendar:

```bash
scripts/expurgo.sh              # simulação: {"simulacao":true,"candidatos":N,"apagados":0,...}
scripts/expurgo.sh --confirmar  # apaga de verdade
```

Semanal, segunda-feira às 4h, via cron — depois do backup das 3h, para o
dump da semana ainda conter o que foi apagado. `scripts/cron.sh` (§6)
instala as duas linhas; a do expurgo é:

```cron
0 4 * * 1 /srv/full-electric/scripts/expurgo.sh --confirmar >> /srv/full-electric/backups/expurgo.log 2>&1
```

Conferir que ficou agendado: `crontab -l | grep full-electric`.

Cada linha do `expurgo.log` traz data ISO, status HTTP e o JSON de resumo.
Para conferir o histórico direto no banco:

```bash
docker run --rm postgres:17 psql "$(grep -E '^DIRECT_URL=' .env | cut -d= -f2-)" \
  -c 'SELECT "executadoEm", simulacao, candidatos, apagados FROM "ExpurgoLog" ORDER BY "executadoEm" DESC LIMIT 10;'
```

Alternativa sem `docker exec` (por exemplo, de outra máquina): a mesma rota
pelo domínio público, que passa pelo Traefik —
`curl -fsS -H "Authorization: Bearer $CRON_SECRET" "https://fulleletric.unysystens.com.br/api/admin/expurgo?confirmar=true"`.
