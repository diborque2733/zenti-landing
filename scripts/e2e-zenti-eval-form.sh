#!/usr/bin/env bash
# Smoke test: mismo POST que la landing (GitHub Pages) hace al formulario ZENTI.eval.
# Uso: ./scripts/e2e-zenti-eval-form.sh [email]
# Nota: la respuesta de n8n Cloud puede tardar 30–90 s; curl usa --max-time 180.

set -euo pipefail
EMAIL="${1:-zenti_e2e_smoke@mailinator.com}"
URL="https://zenti.app.n8n.cloud/form/7c2e685a-2439-4afa-889d-35168e65d856"

echo "POST $URL (email=$EMAIL) …"
code="$(curl --noproxy '*' -sS --max-time 180 -o /tmp/zenti-e2e-form-body.txt -w '%{http_code}' -X POST "$URL" \
  -F "field-0=E2E script $(date -u +%Y-%m-%dT%H:%MZ)" \
  -F "field-1=QA SpA" \
  -F "field-2=CORFO Crea y Valida" \
  -F "field-3=TRL 4 - Validado en laboratorio" \
  -F "field-4=Prueba automatizada scripts/e2e-zenti-eval-form.sh" \
  -F "field-5=$EMAIL")"

echo "HTTP $code"
if [[ -s /tmp/zenti-e2e-form-body.txt ]]; then
  head -c 800 /tmp/zenti-e2e-form-body.txt
  echo
fi
[[ "$code" == "200" ]] || exit 1
