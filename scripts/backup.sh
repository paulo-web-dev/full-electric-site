#!/bin/sh
# Backup do Postgres (leads do CRM) com pg_dump, via imagem oficial — não
# precisa instalar cliente Postgres no servidor.
# Uso: scripts/backup.sh          → backups/leads-AAAAMMDD-HHMMSS.dump
# Mantém os 30 mais recentes. Restauração: docs/DEPLOY.md.
set -eu

cd "$(dirname "$0")/.."

URL="$(grep -E '^DIRECT_URL=' .env | cut -d= -f2- | tr -d "\"'")"
[ -n "$URL" ] || { echo "ERRO: DIRECT_URL vazio no .env" >&2; exit 1; }

mkdir -p backups
ARQUIVO="backups/leads-$(date +%Y%m%d-%H%M%S).dump"

docker run --rm postgres:17 \
  pg_dump --format=custom --no-owner --no-privileges "$URL" > "$ARQUIVO"

# Só guarda os 30 últimos
ls -1 backups/leads-*.dump 2>/dev/null | sort | head -n -30 | xargs -r rm -f

echo "backup em $ARQUIVO ($(du -h "$ARQUIVO" | cut -f1))"
