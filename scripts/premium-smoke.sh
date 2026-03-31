#!/usr/bin/env bash
# Smoke test rápido para previews del informe premium.
# Uso:
#   ./scripts/premium-smoke.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node no está instalado en esta máquina."
  echo "Instala Node 18+ y vuelve a correr: ./scripts/premium-smoke.sh"
  exit 1
fi

echo "[1/3] Generando previews premium/free..."
node scripts/preview-zenti-reports.mjs

echo "[2/3] Verificando archivos esperados..."
test -s report-previews/premium-prompt-preview.txt
test -s report-previews/free-report-preview.html
test -s report-previews/premium-report-preview.html

echo "[3/3] OK smoke premium."
echo "Abrir en navegador:"
echo "  file://$ROOT/report-previews/free-report-preview.html"
echo "  file://$ROOT/report-previews/premium-report-preview.html"
