#!/usr/bin/env bash
# Ciclo operativo CTO: sync -> deploy -> smoke tests -> dominio.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

EVAL_EMAIL="${1:-zenti_e2e_eval_cycle@mailinator.com}"
START_EMAIL="${2:-zenti_e2e_start_cycle@mailinator.com}"

echo "[1/6] Sincronizando links (pago/GA/consultoría)..."
python3 scripts/sync-payment-links.py

echo "[2/6] Deploy workflow ZENTI.eval en n8n Cloud..."
./scripts/zenti-deploy.sh

echo "[3/6] Smoke E2E formulario eval..."
./scripts/e2e-zenti-eval-form.sh "$EVAL_EMAIL"

echo "[4/6] Smoke E2E formulario start..."
./scripts/e2e-zenti-start-form.sh "$START_EMAIL"

echo "[5/6] Preview premium local (si Node está disponible)..."
if command -v node >/dev/null 2>&1; then
  ./scripts/premium-smoke.sh
else
  echo "Node no encontrado; se omite premium-smoke (instala Node 18+)."
fi

echo "[6/6] Chequeo dominio..."
if [[ -x ./scripts/check-zenti-domain.sh ]]; then
  ./scripts/check-zenti-domain.sh || true
else
  echo "No existe scripts/check-zenti-domain.sh o no es ejecutable."
fi

echo ""
echo "Estado final:"
echo "- Si cambiaste landing: publicar y push del repo GitHub Pages."
echo "- Si tienes links reales Lemon/Flow: actualiza scripts/payment-links.json y repite el ciclo."
echo "- Verifica en n8n dos ejecuciones nuevas (start + eval) y llegada de correos."
