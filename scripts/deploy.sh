#!/bin/sh
# Deploy: git pull → docker compose build → up -d → espera o healthcheck.
# Uso: scripts/deploy.sh [branch]   (padrão: main)
# A imagem que sobe é marcada com o SHA do commit, para rollback (docs/DEPLOY.md).
set -eu

cd "$(dirname "$0")/.."
BRANCH="${1:-main}"
IMAGEM="full-electric-site"
CONTAINER="full-electric-app"

[ -f .env ] || { echo "ERRO: .env não existe. Copie de .env.example." >&2; exit 1; }

echo "== git pull origin $BRANCH"
git fetch --quiet origin "$BRANCH"
git checkout --quiet "$BRANCH"
git pull --ff-only --quiet origin "$BRANCH"
SHA="$(git rev-parse --short HEAD)"

echo "== build $SHA"
docker compose build --pull
docker tag "$IMAGEM:latest" "$IMAGEM:$SHA"

echo "== up"
docker compose up -d

echo "== aguardando healthcheck"
i=0
while [ "$i" -lt 45 ]; do
  estado="$(docker inspect --format '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo starting)"
  if [ "$estado" = "healthy" ]; then
    echo "OK: $SHA no ar."
    docker image prune -f >/dev/null
    exit 0
  fi
  if [ "$estado" = "unhealthy" ]; then
    break
  fi
  i=$((i + 1))
  sleep 2
done

echo "FALHOU: container não ficou saudável. Últimas linhas do log:" >&2
docker compose logs --tail 60 app >&2
echo "Para voltar à versão anterior: ver 'Rollback' em docs/DEPLOY.md" >&2
exit 1
