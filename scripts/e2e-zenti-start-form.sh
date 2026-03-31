#!/usr/bin/env bash
# Smoke test: mismo POST que la landing hace al formulario ZENTI.start.
# Uso: ./scripts/e2e-zenti-start-form.sh [email]

set -euo pipefail
EMAIL="${1:-zenti_e2e_start@mailinator.com}"
URL="https://zenti.app.n8n.cloud/form/cff65159-a00b-423f-a02d-3ebac9ce30bd"

echo "POST $URL (email=$EMAIL) ..."
code="$(curl --noproxy '*' -sS --max-time 180 -o /tmp/zenti-e2e-start-body.txt -w '%{http_code}' -X POST "$URL" \
  -F "field-0=E2E start $(date -u +%Y-%m-%dT%H:%MZ): IA para fortalecer postulaciones" \
  -F "field-1=Tecnología" \
  -F "field-2=Prototipo inicial" \
  -F "field-3=Equipo fundador técnico/comercial" \
  -F "field-4=$EMAIL")"

echo "HTTP $code"
if [[ -s /tmp/zenti-e2e-start-body.txt ]]; then
  python3 - <<'PY'
from pathlib import Path
p = Path("/tmp/zenti-e2e-start-body.txt")
text = p.read_text(encoding="utf-8", errors="replace")
print(text[:800])
PY
fi
[[ "$code" == "200" ]] || exit 1
