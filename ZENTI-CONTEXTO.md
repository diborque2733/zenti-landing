# ZENTI CONTEXTO

## Registro de sesión — 2026-04-01

Se realizó una revisión integral del repositorio y no se detectaron modificaciones locales pendientes al inicio. Se identificó como bloqueo principal que `scripts/zenti-deploy.sh` depende de `scripts/apply-zenti-premium-design.py`, archivo que no existe en el árbol actual; además, la documentación aún referencia ese flujo. Pendiente recomendado: restaurar o reemplazar la ruta real de deploy y alinear scripts + documentación.
