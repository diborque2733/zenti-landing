#!/usr/bin/env bash
# Construye la carpeta qa-premium-informes/ para revisión manual (sin n8n).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: se necesita Node.js."
  exit 1
fi
node scripts/qa-premium-informes-build.mjs
echo ""
echo "Abrir en el navegador (ejemplos):"
echo "  file://$ROOT/qa-premium-informes/01-informe-premium-completo-geo-sentinel.html"
echo "  file://$ROOT/qa-premium-informes/04-informe-premium-secciones-parciales-qa.html"
