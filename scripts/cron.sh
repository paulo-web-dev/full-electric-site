#!/bin/sh
# Instala (ou reinstala) as tarefas agendadas deste site no crontab do usuário
# da VPS. Idempotente: roda quantas vezes quiser, nunca duplica a linha.
# Uso: scripts/cron.sh          (na VPS, em /srv/full-electric)
#
#   3h  todo dia          backup do Postgres        docs/DEPLOY.md §6
#   4h  segunda-feira     expurgo LGPD (--confirmar) docs/DEPLOY.md §9
#
# O expurgo roda depois do backup para o dump da semana ainda conter o que foi
# apagado. Testa antes com scripts/expurgo.sh (simulação).
set -eu

cd "$(dirname "$0")/.."
RAIZ="$(pwd)"
mkdir -p backups

LINHAS="0 3 * * * $RAIZ/scripts/backup.sh >> $RAIZ/backups/backup.log 2>&1
0 4 * * 1 $RAIZ/scripts/expurgo.sh --confirmar >> $RAIZ/backups/expurgo.log 2>&1"

ATUAL="$(crontab -l 2>/dev/null || true)"
# Remove as linhas antigas deste site e acrescenta as atuais
NOVO="$(printf '%s\n' "$ATUAL" | grep -v -e "$RAIZ/scripts/backup.sh" -e "$RAIZ/scripts/expurgo.sh" || true)"
printf '%s\n%s\n' "$NOVO" "$LINHAS" | sed '/^$/d' | crontab -

echo "crontab atualizado:"
crontab -l | grep "$RAIZ/scripts/"
