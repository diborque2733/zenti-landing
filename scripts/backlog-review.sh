#!/usr/bin/env bash
# Revisión automática de backlog/P0 con evidencia ejecutable.
# Uso:
#   ./scripts/backlog-review.sh
#   ./scripts/backlog-review.sh --run-live

set -u
set -o pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RUN_LIVE=0
if [[ "${1:-}" == "--run-live" ]]; then
  RUN_LIVE=1
fi

TS_UTC="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
DATE_UTC="$(date -u +"%Y-%m-%d")"
OUT_PRIMARY="docs/BACKLOG-REVISION-AUTOMATICA.md"
OUT_FALLBACK="./BACKLOG-REVISION-AUTOMATICA.md"
OUT="$OUT_PRIMARY"

ok(){ printf "✅ %s\n" "$*"; }
warn(){ printf "⚠️ %s\n" "$*"; }
fail(){ printf "❌ %s\n" "$*"; }

run_check() {
  local id="$1"
  local cmd="$2"
  local required="${3:-0}" # 1 => falla bloquea

  if bash -lc "$cmd" >/tmp/zenti-backlog-${id}.log 2>&1; then
    ok "$id :: $cmd"
    STATUS["$id"]="PASS"
  else
    if [[ "$required" == "1" ]]; then
      fail "$id :: $cmd"
      STATUS["$id"]="FAIL"
    else
      warn "$id :: $cmd"
      STATUS["$id"]="WARN"
    fi
  fi
}

declare -A STATUS

run_check "P0-SHELL" "bash -n scripts/zenti-cto-cycle.sh scripts/zenti-deploy.sh scripts/e2e-zenti-checklist-run.sh" 1
run_check "P0-LINKS" "python3 scripts/sync-payment-links.py" 1
run_check "P0-NODE" "node --check workflows/zenti-node-code/render-premium-report.js" 0

if [[ "$RUN_LIVE" == "1" ]]; then
  run_check "P0-E2E" "./scripts/e2e-zenti-checklist-run.sh" 0
  run_check "P0-DOMAIN" "./scripts/check-zenti-domain.sh" 0
else
  STATUS["P0-E2E"]="SKIPPED"
  STATUS["P0-DOMAIN"]="SKIPPED"
  warn "P0-E2E :: omitido (usa --run-live)"
  warn "P0-DOMAIN :: omitido (usa --run-live)"
fi

if [[ -f .env.local ]]; then
  run_check "P0-DEPLOY" "./scripts/zenti-deploy.sh" 0
else
  STATUS["P0-DEPLOY"]="SKIPPED"
  warn "P0-DEPLOY :: .env.local no presente en este entorno"
fi

write_report() {
  cat > "$1" <<MD
# Revisión automática backlog ZENTI

- **Fecha (UTC):** $TS_UTC
- **Modo live:** $( [[ "$RUN_LIVE" == "1" ]] && echo "sí" || echo "no" )

## Estado P0

| Check | Estado |
|---|---|
| P0-SHELL | ${STATUS[P0-SHELL]} |
| P0-LINKS | ${STATUS[P0-LINKS]} |
| P0-NODE | ${STATUS[P0-NODE]} |
| P0-DEPLOY | ${STATUS[P0-DEPLOY]} |
| P0-E2E | ${STATUS[P0-E2E]} |
| P0-DOMAIN | ${STATUS[P0-DOMAIN]} |

## Evidencia local

- Logs temporales en `/tmp/zenti-backlog-*.log` (sesión actual).

## Próxima acción sugerida

1. Ejecutar en máquina con conectividad real a n8n Cloud: \
   `./scripts/backlog-review.sh --run-live`
2. Completar checklist manual de correo/Drive/Sheets en \
   `docs/E2E-ZENTI-CHECKLIST.md`
3. Actualizar \
   `docs/KANBAN-ZENTI.md`

_Archivo regenerable. Última corrida: $DATE_UTC._
MD
}

if ! write_report "$OUT_PRIMARY"; then
  OUT="$OUT_FALLBACK"
  if write_report "$OUT_FALLBACK"; then
    warn "Sin permisos para escribir $OUT_PRIMARY; se generó reporte en $OUT_FALLBACK"
  else
    OUT="stdout"
    warn "Sin permisos de escritura; se imprime reporte en consola."
    write_report /dev/stdout >/dev/null
  fi
fi

echo "OK revisión generada en: $OUT"
