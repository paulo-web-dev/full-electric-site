#!/bin/sh
# Aplica as migrations pendentes ANTES de subir o servidor.
# Se a migration falhar, o container morre com exit 1 e o Docker (restart:
# unless-stopped) tenta de novo — o site nunca sobe com schema desatualizado.
set -eu

PRISMA="/opt/prisma/node_modules/prisma/build/index.js"

if [ "${SKIP_MIGRATIONS:-0}" = "1" ]; then
  echo "[entrypoint] SKIP_MIGRATIONS=1 — pulando prisma migrate deploy"
else
  echo "[entrypoint] prisma migrate deploy"
  if ! node "$PRISMA" migrate deploy --schema /app/prisma/schema.prisma; then
    echo "[entrypoint] ERRO: migration não aplicada. Servidor NÃO iniciado." >&2
    echo "[entrypoint] Confira DIRECT_URL no .env e docs/DEPLOY.md (seção Migrations)." >&2
    exit 1
  fi
fi

exec "$@"
