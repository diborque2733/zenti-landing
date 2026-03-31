# Kanban ZENTI — tareas abiertas

Tablero vivo. **FLOW (Flow.cl)** y **GA4** quedan explícitamente para **mañana AM** (no bloquean el resto).

**GitHub:** para tablero con fechas e issues, ver [`GITHUB-PROJECT-ZENTI.md`](./GITHUB-PROJECT-ZENTI.md).

---

## Mañana AM — FLOW + GA

| Tarjeta | Detalle |
|--------|---------|
| **FLOW — links de pago CLP** | Crear/actualizar enlaces en Flow.cl; volcar URLs en `scripts/payment-links.json` → `python3 scripts/sync-payment-links.py` → publicar landing si aplica. |
| **FLOW — coherencia CTAs** | Revisar que correo, informe HTML y `zentigrants.com/#pricing` apunten a los mismos checkouts. |
| **GA4 — propiedad + stream** | Crear propiedad con URL `https://zentigrants.com`; poner `G-xxxxxxxx` en `payment-links.json` → `sync-payment-links.py` → push landing. |
| **GA4 — verificación** | DebugView o informe en tiempo real tras un evento de prueba (sin exigir dashboard perfecto el día 1). |

---

## Por hacer — producto / n8n

| Prioridad | Tarjeta | Criterio de hecho |
|-----------|---------|-------------------|
| P0 | **Deploy código repo → n8n Cloud** | Ejecutar `./scripts/zenti-deploy.sh` desde máquina con `.env.local`; workflow `oabhou5V20poYB55` con `preparar-datos` (webhook body), Drive carpeta Evaluaciones, PDFShift `jsonBody` objeto, Gmail resource/send. |
| P0 | **E2E eval + start + correo** | Correr `e2e-zenti-checklist-run.sh`; tachar `docs/E2E-ZENTI-CHECKLIST.md`; anotar IDs ejecución. |
| P1 | **Google Sheets dashboard** | Credencial OAuth2 en n8n; nodos Append a hoja `1cm1-DkAaH8pPm6H3UrVRfv4d1t049kFQgU4HcXshfHw` (Evaluaciones, Matches, KPIs). |
| P1 | **PDFShift** | Revisar créditos/plan; si se agota, fallback HTML OK pero documentar. |
| P2 | **Error workflow** | Workflow dedicado + notificación con link a ejecución fallida (ID en contexto: `YSEWKL9bL0GSzW0Y`). |
| P2 | **ZENTI.diag** | Import/activo en Cloud; E2E un caso; opcional: landing diag. |
| P2 | **Ramal premium (2.º LLM)** | Nodos en Cloud: prompt premium → LLM → render premium → misma cadena PDF/Drive/correo o post-pago. |
| P3 | **Rotar API key n8n** | Si hubo exposición en algún canal. |
| P3 | **Async / cola** | Diseño documentado antes de escala (no urgente). |

---

## Por hacer — UX / contenido

| Tarjeta | Notas |
|--------|--------|
| Alinear **ZENTI-CONTEXTO** con landing pública | La landing “oficial” hoy es `zenti-landing` (GitHub Pages); `workflows/zenti-landing/index.html` en repo es espejo para deploy/scripts. |
| Copy **tiempos de espera** | Si el pipeline supera con frecuencia 1–2 min, ajustar textos en landing y confirmación. |
| **zenti-eval-chat.html** (oscuro) vs landing blanca | Decidir SSOT o redirigir una a la otra. |

---

## En curso

*(Vacío — mover aquí lo que tomes activamente.)*

---

## Hecho (referencia reciente)

- Landing: progreso chat, resumen pre-envío, FAQ, testimonios, borrador `localStorage`, scroll suave, copy “¿Cuándo pagás?”, disclaimer cobertura, footer asesoría.
- Repo: `preparar-datos` webhook string `body`, `preparar-email` enlaces Drive + fallback adjunto, `apply-zenti-premium-design` Drive + PDFShift + Gmail.
- Scripts: `e2e-zenti-checklist-run.sh`, `simulate-zenti-premium-paid.sh`, `docs/E2E-ZENTI-CHECKLIST.md`, `qa-premium-informes.sh` (HTML premium locales para QA).
- GitHub Pages: `diborque2733.github.io/zenti-landing/` al día con rama publicada.

---

## Ritual rápido

1. Cada mañana: mirar columna **Mañana AM** si toca FLOW/GA.  
2. Cada deploy n8n: anotar fecha en esta tabla o en `ZENTI-CONTEXTO.md`.  
3. Cierre de sprint: mover tarjetas **Hecho** y vaciar bloqueos.
