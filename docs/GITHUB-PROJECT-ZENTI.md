# ZENTI — Proyecto en GitHub (tablero, hitos, issues)

Sí conviene llevar **pipeline de tareas** y **fechas** en GitHub: un **Project** (vista Kanban o tabla), **Milestones** con fecha objetivo, e **issues** enlazados a PRs y al checklist del repo. Así el equipo ve el mismo estado sin depender solo del markdown local.

Antes de usar las plantillas del repo **zenti-landing**, creá en GitHub los labels **`landing`** (y en tu fork de n8n, **`zenti`**) si no existen; si no, GitHub puede ignorar la etiqueta en el issue nuevo.

## Qué usar en GitHub

| Pieza | Para qué |
|--------|----------|
| **Projects (nuevo)** | Tablero con columnas *Backlog → En curso → En revisión → Hecho*; campos personalizados *Prioridad*, *Módulo*, *Fecha objetivo*. |
| **Milestones** | Agrupar por sprint o por entrega (*p. ej.* “E2E verde”, “Premium en Cloud”, “Sheets dashboard”). Cada issue puede tener un hito + fecha. |
| **Labels** | Filtrado rápido: `zenti`, `P0`, `P1`, `modulo-n8n`, `modulo-landing`, `bloqueado`, `FLOW`, `GA4`. |
| **Issues + PRs** | Una issue por tarea concreta; el PR la cierra con `Fixes #123`. |

## Cómo enlazar con este repo

- Kanban en markdown (detalle operativo): [`docs/KANBAN-ZENTI.md`](./KANBAN-ZENTI.md).
- Checklist E2E: [`docs/E2E-ZENTI-CHECKLIST.md`](./E2E-ZENTI-CHECKLIST.md).
- Contexto largo: [`ZENTI-CONTEXTO.md`](../ZENTI-CONTEXTO.md).

Sugerencia: **al crear una issue**, pegá el criterio de “hecho” del Kanban en el cuerpo; **al cerrar**, tachá la fila correspondiente en el markdown (o hacé un PR solo de doc).

## Si tu trabajo ZENTI vive en un fork propio de n8n-mcp

El remoto puede apuntar al repo upstream; las plantillas de issues de GitHub solo se activan en **el repo donde están** `.github/ISSUE_TEMPLATE/`.

- Copiá el archivo [`docs/github/issue-template-zenti-tarea.yml`](./github/issue-template-zenti-tarea.yml) a **`.github/ISSUE_TEMPLATE/zenti-tarea.yml`** en tu fork (misma estructura de carpetas).
- Opcional: `.github/ISSUE_TEMPLATE/config.yml` desde [`docs/github/issue-template-config.yml`](./github/issue-template-config.yml) (ajustá URLs a tu fork y rama).

## Repo landing (público)

En **`diborque2733/zenti-landing`** ya podés usar issues solo de UX/copy/deploy Pages; el tablero puede ser **un solo Project** que incluya issues de ambos repos solo si usás **organización** o enlaces manuales entre issues (“Ver también org/repo#n”).

## Primeros hitos sugeridos (ejemplo)

1. **Hito A — Operación eval** — Deploy n8n + E2E correo/PDF según checklist.  
2. **Hito B — Datos** — Google Sheets cableado (Evaluaciones / Matches / KPIs).  
3. **Hito C — Premium** — Segundo LLM + ramal post-pago en Cloud.  
4. **Hito D — Comercial** — FLOW + GA4 + CTAs coherentes (alineado a tu columna “mañana AM” del Kanban).

Las fechas las ponés en cada **Milestone** en GitHub; el Project puede ordenar por *Fecha objetivo* o por prioridad.

## Automatización (opcional, después)

- **Project workflow:** “auto-add” issues con label `zenti`.  
- **Actions:** solo si necesitás CI; no es obligatorio para el tablero.

---

Resumen: **GitHub = fuente de verdad operativa**; **markdown del repo = especificación y criterios**. Los dos juntos suelen ir más rápido y ordenados que solo uno.
