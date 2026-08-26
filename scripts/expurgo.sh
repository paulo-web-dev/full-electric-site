#!/bin/sh
# Expurgo LGPD — apaga leads sem contato há mais de 12 meses (nunca VENDIDO).
# Chamado pelo cron semanal da VPS; ver docs/DEPLOY.md §9.
#
# Roda DENTRO do container (docker exec), porque o app não publica porta e a
# imagem não tem curl. O CRON_SECRET já está no ambiente do container (.env).
#
# Uso:
#   scripts/expurgo.sh            # simulação: lista quantos seriam apagados
#   scripts/expurgo.sh --confirmar  # apaga de verdade
set -eu

CONTAINER="${CONTAINER:-full-electric-app}"
QUERY=""
[ "${1:-}" = "--confirmar" ] && QUERY="?confirmar=true"

docker exec "$CONTAINER" node -e "
  const url = 'http://127.0.0.1:3000/api/admin/expurgo$QUERY';
  fetch(url, { headers: { authorization: 'Bearer ' + (process.env.CRON_SECRET || '') } })
    .then(async (r) => {
      const corpo = await r.text();
      console.log(new Date().toISOString(), r.status, corpo);
      process.exit(r.ok ? 0 : 1);
    })
    .catch((e) => { console.error(new Date().toISOString(), 'ERRO', e.message); process.exit(1); });
"
