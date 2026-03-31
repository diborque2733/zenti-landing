#!/usr/bin/env bash
# Aplica código de nodos ZENTI.eval al workflow en n8n Cloud (Public API).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
else
  echo "Falta .env.local en $ROOT (N8N_BASE_URL, N8N_API_KEY)." >&2
  exit 1
fi
export N8N_BASE_URL="${N8N_BASE_URL:-}"
export N8N_API_KEY="${N8N_API_KEY:-}"
if [[ -z "$N8N_BASE_URL" || -z "$N8N_API_KEY" ]]; then
  echo "Definir N8N_BASE_URL y N8N_API_KEY en .env.local" >&2
  exit 1
fi
exec python3 "$ROOT/scripts/apply-zenti-premium-design.py"
