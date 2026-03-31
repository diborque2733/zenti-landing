#!/usr/bin/env bash
# Simula “cliente pagó y debe recibir entrega” disparando el mismo pipeline ZENTI.eval
# vía webhook JSON (no pasa por pasarela real; es para demo/soporte hasta Stripe/Lemon → n8n).
#
# Uso:
#   ./scripts/simulate-zenti-premium-paid.sh [email]
# El informe generado es el del flujo estándar (HTML premium + CTAs en doc); el ramal LLM
# de 8 capítulos exclusivos post-pago sigue siendo hit separado si no está en Cloud.
#
set -euo pipefail
EMAIL="${1:-diego@zentigrants.com}"
URL="https://zenti.app.n8n.cloud/webhook/zenti-eval-test"
STAMP="$(date -u +%Y-%m-%dT%H:%MZ)"

payload=$(python3 -c "import json,sys; print(json.dumps({
  'field-0': f'[SIM PAGO] Premium {sys.argv[1]}',
  'field-1': 'ZentiGrants',
  'field-2': 'CORFO Crea y Valida',
  'field-3': 'TRL 5 - Validado en entorno relevante',
  'field-4': 'Simulación post-pago: entrega de informe tras checkout (demo operativa).',
  'field-5': sys.argv[2],
}))" "$STAMP" "$EMAIL")

echo "POST $URL → $EMAIL …"
curl --noproxy '*' -sS --max-time 180 -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "$payload" | python3 -m json.tool 2>/dev/null || cat
echo ""
