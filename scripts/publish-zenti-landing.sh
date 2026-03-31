#!/usr/bin/env bash
# Copia la landing al clon del repo GitHub Pages (dominio zentigrants.com).
# Uso:
#   ./scripts/publish-zenti-landing.sh /ruta/al/clon/de/zenti-landing
# Luego en ese repo: git add -A && git commit -m "Landing + CNAME" && git push
set -euo pipefail
DEST="${1:?Ruta al repo zenti-landing (clon local). Ej: $0 ~/code/zenti-landing}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/workflows/zenti-landing"
if [[ ! -d "$DEST" ]]; then
  echo "No existe el directorio: $DEST" >&2
  exit 1
fi
cp "$SRC/zenti-eval-chat.html" "$DEST/index.html"
cp "$SRC/CNAME" "$DEST/CNAME"
echo "OK: $DEST/index.html y $DEST/CNAME actualizados."
echo "Siguiente: cd \"$DEST\" && git status"
echo "GitHub: Settings → Pages → Custom domain: zentigrants.com (HTTPS)"
echo "DNS: CNAME www → diborque2733.github.io ; apex según GitHub docs (A o ALIAS)"
