# ZENTI — Proceso E2E con checklist y diagnóstico

**Objetivo:** validar de punta a punta que los procesos vivos (n8n Cloud + landing + entregables) cumplen el criterio de éxito acordado.

**Criterio de éxito (definición operativa):**

| ID | Requisito | Cómo se verifica |
|----|-----------|------------------|
| E1 | Correo al usuario | Bandeja (o Mailinator) con HTML ZENTI + adjunto PDF o HTML + enlace Drive |
| E2 | Informe básico + capas premium en diseño | Adjunto/ Drive: secciones de producto (consolidado, juicio, diagnóstico, etc. según `ZENTI-CONTEXTO.md`) |
| E3 | Proyecto fase **idea** | Envío por **ZENTI.start** (form “tengo una idea”) → fila en **Matches** (cuando Sheets esté cableado) |
| E4 | Proyecto **listo** (propuesta) | Envío por **ZENTI.eval** → fila en **Evaluaciones** (cuando Sheets esté cableado) |
| E5 | **3 filas** en dashboard Sheets | Tras las pruebas: al menos **una** fila nueva en cada pestaña objetivo **Evaluaciones**, **Matches**, **KPIs** (o 3 apends explícitos si el workflow solo escribe en dos hojas — anotar desviación) |
| E6 | Simulación **no paga** | Usuario **no** completa checkout → **no** recibe flujo de “informe premium desbloqueado” por ese canal (solo entrega gratuita / CTA) |
| E7 | Simulación **paga y abre** | Usuario paga (test mode o real) y abre correo/enlace → accede al **premium** según lo cableado (hoy puede ser CTA + proceso manual hasta ramal post-pago en n8n) |

> **Nota (marzo 2026):** En `ZENTI-CONTEXTO.md` los nodos Google Sheets se retiraron por falta de credencial OAuth2. Hasta reconectarlos, E3–E5 en Sheets quedan como **bloqueantes para “verde total”** aunque el formulario y el correo funcionen.

---

## 0. Pre-requisitos (antes de tachar nada)

- [ ] **P0** Instancia: `https://zenti.app.n8n.cloud` accesible.
- [ ] **P1** Workflows **ZENTI.eval** y **ZENTI.start** activos en Cloud.
- [ ] **P2** Credenciales: Anthropic, PDFShift (o fallback HTML), Drive, Gmail operativas.
- [ ] **P3** (Opcional éxito completo dashboard) Credencial **Google Sheets OAuth2** + nodos Append cableados a hoja `1cm1-DkAaH8pPm6H3UrVRfv4d1t049kFQgU4HcXshfHw` (pestañas Evaluaciones, Matches, KPIs).
- [ ] **P4** URLs de formulario vigentes (si cambia el Form Trigger, actualizar landing y scripts):
  - Eval: `https://zenti.app.n8n.cloud/form/7c2e685a-2439-4afa-889d-35168e65d856`
  - Start: `https://zenti.app.n8n.cloud/form/cff65159-a00b-423f-a02d-3ebac9ce30bd`

**Ejecución rápida de smokes (repo):**

```bash
cd "/Users/diborque/n8n-mcp"
./scripts/e2e-zenti-checklist-run.sh tu_correo+idea@ejemplo.com tu_correo+eval@ejemplo.com
```

Si `curl` devuelve `CONNECT tunnel failed, response 403`, suele ser **proxy corporativo** (`HTTPS_PROXY`). Prueba `env -u HTTPS_PROXY -u HTTP_PROXY ./scripts/e2e-zenti-eval-form.sh …` o ejecuta desde una red sin proxy.

---

## 1. Checklist — automatizable (HTTP / repo)

Marca `[x]` cuando pase en **tu** entorno (no en sandbox de CI si devuelve 403).

- [ ] **A1** `e2e-zenti-eval-form.sh` → HTTP 200 y cuerpo de cierre del formulario.
- [ ] **A2** `e2e-zenti-start-form.sh` → HTTP 200.
- [ ] **A3** `premium-smoke.sh` → genera `report-previews/premium-report-preview.html` y `free-report-preview.html` sin error.
- [ ] **A3b** (opcional QA diseño) `./scripts/qa-premium-informes.sh` → llena `qa-premium-informes/` con HTML detallado + `00-metadata-qa.json` (mismo render que n8n, markdown de muestra).
- [ ] **A4** (Opcional) `zenti-cto-cycle.sh` si también despliegas workflow por API en la misma sesión.

**IDs de ejecución n8n (anotar):** Eval `________` · Start `________`

---

## 2. Checklist — caso “proyecto listo” (ZENTI.eval)

Usar email **distinguible**, p. ej. `qa+zenti-eval-20260327@tudominio.com`.

- [ ] **B1** Formulario enviado (landing o POST script) con TRL alto / texto de propuesta madura.
- [ ] **B2** Ejecución en n8n **sin error** en nodos LLM → Consolidar → Render → Drive → Gmail.
- [ ] **B3** **Correo** recibido: asunto y cuerpo coherentes con plantilla premium (cabecera, CTA, sin tablas técnicas en cuerpo).
- [ ] **B4** **Adjunto** abre en navegador (Edge/Chrome): informe con estructura premium (portada, secciones nombradas en contexto).
- [ ] **B5** **Drive:** archivo subido y enlace del correo válido.
- [ ] **B6** **Fila Evaluaciones** en Sheet (si aplica): timestamp + email + proyecto coinciden con el envío.

---

## 3. Checklist — caso “fase idea” (ZENTI.start)

Email distinto, p. ej. `qa+zenti-start-20260327@tudominio.com`.

- [ ] **C1** Formulario start enviado con etapa tipo **idea / prototipo inicial** (alineado a `e2e-zenti-start-form.sh`).
- [ ] **C2** Pipeline completo OK en ejecuciones n8n (workflow start correspondiente).
- [ ] **C3** Correo o respuesta prometida por ese flujo recibida (según diseño actual del workflow start).
- [ ] **C4** **Fila Matches** en Sheet (si aplica).

---

## 4. Checklist — Google Sheet “Dashboard” (3 registros)

Objetivo: **tres apariciones** trazables (una por pestaña o tres filas KPI según tu implementación).

- [ ] **D1** Pestaña **Evaluaciones**: fila del caso B.
- [ ] **D2** Pestaña **Matches**: fila del caso C.
- [ ] **D3** Pestaña **KPIs**: fila o evento agregado (ej. contador/fecha de corrida E2E).

Si solo hay 2 pestañas cableadas, documentar en diagnóstico como **gap** explícito.

---

## 5. Checklist — pago y apertura (E6 / E7)

Estas pruebas son **manuales** hasta que el ramal post-pago esté en n8n.

### E6 — No paga / no abre “primer” correo

- [ ] **F1** Tras recibir solo entrega **gratuita** (o preview), **no** iniciar pago en Lemon/Flow/MercadoPago.
- [ ] **F2** Confirmar que **no** llega segundo correo con informe premium completo **ni** enlace exclusivo post-pago (comportamiento esperado).
- [ ] **F3** (Opcional) No abrir el correo inicial y verificar que no hay side effects (GA/eventos) que confundan métricas — anotar herramienta usada.

### E7 — Paga y sí abre

- [ ] **G1** Completar pago en **modo test** o monto mínimo según pasarela configurada en `scripts/payment-links.json` + `sync-payment-links.py`.
- [ ] **G2** Abrir correo post-compra o enlace de entrega premium.
- [ ] **G3** Verificar acceso al **informe premium** (HTML/PDF o proceso acordado). Si hoy el premium es solo CTA hacia la misma landing, marcar **parcial** y enlazar issue/backlog.

---

## 6. Resumen de funcionalidades (rellenar al cierre)

| Funcionalidad | Estado | Nota breve |
|---------------|--------|------------|
| Form Eval | ☐ OK ☐ Falla | |
| Form Start | ☐ OK ☐ Falla | |
| LLM + consolidación | ☐ OK ☐ Falla | |
| Render HTML premium | ☐ OK ☐ Falla | |
| PDFShift / PDF | ☐ OK ☐ Fallback HTML | |
| Drive | ☐ OK ☐ Falla | |
| Gmail | ☐ OK ☐ Falla | |
| Sheets Evaluaciones | ☐ OK ☐ N/C | |
| Sheets Matches | ☐ OK ☐ N/C | |
| Sheets KPIs | ☐ OK ☐ N/C | |
| Flujo pago → premium | ☐ OK ☐ Parcial ☐ N/C | |

**Leyenda N/C:** no cableado o fuera de alcance en esta corrida.

---

## 7. Plantilla de diagnóstico (copiar al finalizar la sesión)

```markdown
## Diagnóstico E2E ZENTI — YYYY-MM-DD

**Ejecutado por:** …
**Entorno:** n8n Cloud zenti.app.n8n.cloud

### Resultado global
- [ ] PASS criterio E1–E7 completo
- [ ] PASS parcial (detallar gaps)
- [ ] FAIL

### Hallazgos
1. …
2. …

### Evidencias
- IDs ejecución n8n: …
- Capturas / enlaces Drive (sin datos sensibles): …

### Acciones siguientes
- …
```

---

## Referencias en repo

| Recurso | Ruta |
|---------|------|
| Contexto producto / URLs | `ZENTI-CONTEXTO.md` |
| Smoke eval | `scripts/e2e-zenti-eval-form.sh` |
| Smoke start | `scripts/e2e-zenti-start-form.sh` |
| Previews premium locales | `scripts/premium-smoke.sh` |
| Ciclo CTO | `scripts/zenti-cto-cycle.sh` |
| Orquestador checklist | `scripts/e2e-zenti-checklist-run.sh` |
