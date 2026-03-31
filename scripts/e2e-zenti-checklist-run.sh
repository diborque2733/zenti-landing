#!/usr/bin/env bash
# Orquesta smokes del checklist E2E (ver docs/E2E-ZENTI-CHECKLIST.md).
# Uso:
#   ./scripts/e2e-zenti-checklist-run.sh [email_eval] [email_start]
# Por defecto usa sufijos +eval / +start en mailinator de smoke.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

EMAIL_EVAL="${1:-zenti_e2e_checklist_eval@mailinator.com}"
EMAIL_START="${2:-zenti_e2e_checklist_start@mailinator.com}"

echo "=== ZENTI E2E checklist run ==="
echo "Eval email:  $EMAIL_EVAL"
echo "Start email: $EMAIL_START"
echo ""
echo "Tacha en docs/E2E-ZENTI-CHECKLIST.md: A1–A3 tras verificar correo + n8n."
echo ""

echo "[A1] e2e-zenti-eval-form.sh …"
./scripts/e2e-zenti-eval-form.sh "$EMAIL_EVAL"

echo ""
echo "[A2] e2e-zenti-start-form.sh …"
./scripts/e2e-zenti-start-form.sh "$EMAIL_START"

echo ""
echo "[A3] premium-smoke.sh …"
if command -v node >/dev/null 2>&1; then
  ./scripts/premium-smoke.sh
else
  echo "OMITIDO: instala Node 18+ para premium-smoke (checklist A3)."
fi

echo ""
echo "=== Smokes terminados ==="
echo "Siguiente: n8n → Ejecuciones (2 nuevas), Gmail, Sheet si está cableado."
echo "Doc: docs/E2E-ZENTI-CHECKLIST.md"
