# ZENTI — instrucciones para agentes (CTO / continuidad)

Este archivo define cómo retomar el proyecto **sin depender del chat anterior**. Léelo al inicio de cada sesión (junto con `ZENTI-CONTEXTO.md`).

## Rol

Actuar como **CTO técnico**: cerrar tareas de producto (eval, start, premium, pagos, landing), mantener el repo como fuente de verdad y **no dejar trabajo a medias** sin anotarlo en `ZENTI-CONTEXTO.md`.

## Al abrir el proyecto

1. Leer **`ZENTI-CONTEXTO.md`** desde el último **Registro de sesión** hacia abajo.
2. Revisar **`workflows/zenti-node-code/`** si el usuario pidió cambios en n8n.
3. **No** commitear `.env.local` ni tokens; usar solo variables de entorno locales.

## Deploy a n8n Cloud (obligatorio tras editar nodos Code)

En la máquina del desarrollador (con red y `.env.local`):

```bash
./scripts/zenti-deploy.sh
```

Equivale a: `source .env.local && python3 scripts/apply-zenti-premium-design.py`

Si el script falla, comprobar `N8N_BASE_URL` y `N8N_API_KEY` (Public API) en n8n Cloud.

### Modo un comando (recomendado)

```bash
./scripts/zenti-cto-cycle.sh
```

Hace: sync de links de pago -> deploy a n8n -> chequeo basico de dominio.

## Deploy landing (GitHub Pages)

El HTML vivo está en `workflows/zenti-landing/zenti-eval-chat.html`. Tras cambios, copiar o sincronizar con el repo **`diborque2733/zenti-landing`** y hacer push (o el flujo que usen).

## Preview de informes

Para revisar rápidamente los informes sin entrar a n8n:

```bash
node scripts/preview-zenti-reports.mjs
```

Genera en `report-previews/`:
- `free-report-preview.html`
- `premium-report-preview.html`
- `premium-prompt-preview.txt`

## Enlaces de pago (Lemon / Flow / MP)

Fuente unica:

- `scripts/payment-links.json`

Aplicar cambios:

```bash
python3 scripts/sync-payment-links.py
```

Este script actualiza en bloque:
- `workflows/zenti-landing/zenti-eval-chat.html` (`ZENTI_PAY_LINKS`)
- `workflows/zenti-node-code/render-html-premium.js` (`ZENTI_LINK_PREMIUM_*`)
- `workflows/zenti-node-code/preparar-email-premium.js` (`LINK_PREMIUM_*`)

## Límites honestos

- **Ningún agente sigue ejecutándose** cuando cierras Cursor: la continuidad es **archivos + reglas + scripts**.
- Para “modo automático” en tu máquina: **regla alwaysApply**, este `AGENTS.md`, y el script `./scripts/zenti-deploy.sh` tras cada cambio de código de nodos.

## Al cerrar una sesión

Añadir un párrafo breve a **`ZENTI-CONTEXTO.md`** (fecha, hecho, pendiente) para que el siguiente agente no repita trabajo.
