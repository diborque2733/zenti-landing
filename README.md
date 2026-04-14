# zenti-landing (GitHub Pages)

**Sitio en producción:** https://zentigrants.com/

## Rama que publica GitHub Pages

La rama **`CODEX`** es la que alimenta **Deployments → github-pages** (ver el último deploy activo en este repo).

## Fuente canónica (no editar solo aquí)

El HTML y assets que deben mantenerse viven en el monorepo **`n8n-mcp`**:

- Ruta: `workflows/zenti-landing/`
- Publicar hacia este repo: `./scripts/publish-and-push-zenti-landing.sh` (desde la raíz de `n8n-mcp`)

En el monorepo `n8n-mcp`, ver `docs/ZENTI-INFORMATION-AND-RELEASE-PROTOCOL.md` y `docs/ZENTI-LANDING-CONSOLIDATION.md`.

## Rama `main`

Tiene **historial independiente** de `CODEX` (sin merge-base). No usar `main` como referencia de “qué está en producción” salvo que **Settings → Pages** apunte explícitamente a `main`. Los archivos del sitio estático deben coincidir con la fuente en `n8n-mcp` y con la rama que Pages construye.

## Enlaces de pago y cupones

Reglas y URLs centralizadas en `n8n-mcp`: `scripts/payment-links.json` → `sync-payment-links.py`.
