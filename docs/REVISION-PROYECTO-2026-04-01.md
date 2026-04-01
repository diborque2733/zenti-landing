# Revisión integral del proyecto — 2026-04-01

## Estado de modificaciones locales

- Se revisó el estado del repositorio y **no había cambios locales sin commitear** al iniciar esta revisión (`git status --short --branch` mostraba solo `## work`).

## Hallazgos principales

1. **Bloqueador de deploy n8n:**
   - `scripts/zenti-deploy.sh` ejecuta `python3 scripts/apply-zenti-premium-design.py`.
   - Ese archivo **no existe actualmente** en `scripts/`, por lo que el flujo de deploy no puede completarse como está documentado.

2. **Desalineación de documentación operativa:**
   - `AGENTS.md` y `docs/KANBAN-ZENTI.md` siguen indicando el flujo `zenti-deploy.sh` + `apply-zenti-premium-design.py`.
   - Al faltar el script, la guía actual puede hacer perder tiempo o generar confusión en continuidad operativa.

3. **Dependencia crítica sin verificación previa en ciclo CTO:**
   - `scripts/zenti-cto-cycle.sh` invoca `./scripts/zenti-deploy.sh` en el paso 2/6.
   - Si deploy falla por script faltante, toda la automatización se corta temprano.

## Oportunidades de mejora (priorizadas)

### P0 — Restaurar ruta de deploy real

- Opción A: recuperar `scripts/apply-zenti-premium-design.py` (desde historial o backup) y validar con dry-run.
- Opción B: si fue reemplazado por otro mecanismo, actualizar `scripts/zenti-deploy.sh` y toda la documentación para usar la ruta vigente.

### P1 — Añadir preflight checks explícitos

- En `scripts/zenti-deploy.sh`, validar existencia del script objetivo antes de ejecutar:
  - `[[ -f "$ROOT/scripts/apply-zenti-premium-design.py" ]] || { echo "..."; exit 1; }`
- En `scripts/zenti-cto-cycle.sh`, agregar mensaje de error orientado a resolución (archivo faltante / cómo regenerarlo).

### P1 — Runbook mínimo de recuperación

- Crear `docs/DEPLOY-N8N-RUNBOOK.md` con:
  - prerequisitos (`.env.local`, `N8N_BASE_URL`, `N8N_API_KEY`),
  - comando de deploy vigente,
  - síntomas comunes y solución rápida.

### P2 — Check automatizado en CI/local

- Añadir script de sanity (`scripts/check-required-files.sh`) que falle si faltan artefactos críticos de operación.
- Integrarlo en una tarea previa a publish/deploy.

## Recomendación ejecutiva

Corregir primero la **ruta de deploy n8n** (P0). Mientras exista la referencia a un archivo inexistente, el ciclo recomendado por el proyecto no es reproducible de forma confiable.
