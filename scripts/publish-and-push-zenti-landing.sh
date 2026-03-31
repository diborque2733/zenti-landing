#!/usr/bin/env bash
# Publica la landing desde n8n-mcp al clon local y hace commit + push (un solo comando).
# Requisitos:
#   1) brew install gh && gh auth login   (una vez; guarda credenciales para git push)
#   2) Ruta al clon del repo zenti-landing (ej. ~/zenti-landing-temp)
#
# Uso:
#   ./scripts/publish-and-push-zenti-landing.sh ~/zenti-landing-temp
set -euo pipefail
DEST="${1:?Pasa la ruta del clon. Ej: $0 ~/zenti-landing-temp}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
./scripts/publish-zenti-landing.sh "$DEST"
cd "$DEST"
git fetch origin
git pull --rebase origin CODEX || { echo "Conflicto en pull --rebase. Resuélvelo en Desktop o Terminal." >&2; exit 1; }
git add index.html CNAME privacidad.html
if git diff --staged --quiet; then
  echo "Nada nuevo que commitear (ya estaba todo igual)."
else
  git commit -m "Sync landing desde n8n-mcp ($(date -u +%Y-%m-%dT%H:%MZ))"
fi
git push origin CODEX
echo "OK: push a origin CODEX completado."
