# ZENTI CONTEXTO

## Registro de sesión — 2026-04-01

Se realizó una revisión integral del repositorio y no se detectaron modificaciones locales pendientes al inicio. Se identificó como bloqueo principal que `scripts/zenti-deploy.sh` depende de `scripts/apply-zenti-premium-design.py`, archivo que no existe en el árbol actual; además, la documentación aún referencia ese flujo. Pendiente recomendado: restaurar o reemplazar la ruta real de deploy y alinear scripts + documentación.

## Registro de sesión — 2026-04-01 (iteración 2)

Se atendió feedback del QA: se aplicaron mejoras concretas para el problema de enlaces de consultoría/pago (centralización en `ZENTI_PAY_LINKS` de la landing y sincronización robusta desde `scripts/payment-links.json` hacia landing, email premium y ambos renders premium). Además, se creó `docs/QA-GAP-PLAN-2026-04-01.md` con comparación punto a punto de 16 hallazgos QA, estado real y plan de priorización por semanas. Pendiente operativo clave: validar E2E real en n8n cloud para confirmar pagos, agenda, Drive y registros.
