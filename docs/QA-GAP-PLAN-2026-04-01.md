# QA Gap Plan acumulado — 2026-04-01

Este documento compara el backlog QA compartido por negocio con el estado actual del repo.

## Resumen ejecutivo

- **Resueltos o parcialmente cubiertos en el repo:** 1, 10, 12 (MVP parcial), 15.
- **Críticos pendientes (P0):** 3, 4, 7, 11, 14.
- **Evolutivos (P1/P2):** 2, 5, 6, 8, 9, 13, 16.

## Matriz de comparación (QA vs. estado)

| # | Solicitud QA | Estado | Evidencia repo | Próxima acción sugerida |
|---|---|---|---|---|
| 1 | Mini roadmap + motivar HH asesoría | **Parcialmente cubierto** | `render-start-report.js` ya genera sección `roadmap` y CTA a asesoría. | Ajustar prompt para que siempre entregue 3 niveles de roadmap (7/30/90 días) y CTA contextual por score. |
| 2 | Más alternativas de institución/instrumento | **Pendiente** | Se entrega principal + alternativa, no ranking extendido. | Cambiar salida start para top-3 instrumentos con porcentaje de match. |
| 3 | Pago consultoría premium no funciona | **En progreso (fix aplicado en este ciclo)** | Se unifican links a `consultCal` y sincronización automática en landing/reportes/emails. | Validar E2E real en producción con una compra/prueba. |
| 4 | Documento en Drive sin formato | **Pendiente crítico** | Reportado por operación; requiere revisar nodo de subida/conversión. | Auditar pipeline HTML→PDF→Drive y MIME type en n8n. |
| 5 | Crear cupones promo | **Pendiente** | No hay módulo de cupones en repo. | Definir proveedor (Flow/Lemon/Stripe) y tabla de códigos/redención. |
| 6 | Ver informe online en página | **Parcial** | Existe `link_vista_previa_get` en consolidación, pero no como producto final UX. | Exponer endpoint firmado y pantalla de visualización post-submit. |
| 7 | Carpeta de evaluaciones/match no se llena | **Pendiente crítico** | Requiere revisar nodos Drive/Sheets en n8n cloud. | Ejecutar corrida controlada y validar permisos/IDs de carpeta. |
| 8 | Protocolo de pruebas/checklist operativo | **Parcial** | Ya hay scripts E2E/checklist. | Consolidar checklist único con evidencia automática por corrida. |
| 9 | Orquestar Codex/Claude/Gemini para costos | **Pendiente** | No hay orquestador multi-modelo en repo. | Hacer benchmark costo/calidad por tipo de tarea. |
| 10 | Programas en landing como botones activos | **Cubierto** | `index.html` contiene tags con links de programas. | Verificar que cada link corresponda al instrumento exacto. |
| 11 | Agendar consultoría sin link/caída | **En progreso (fix aplicado)** | Se quitan enlaces hardcoded inconsistentes y se centraliza `consultCal`. | Validar disponibilidad del destino final y fallback. |
| 12 | Bot soporte conectado a base de fondos | **Parcial (MVP ya existente)** | Flujo chat eval/start + contexto por fondo; no bot soporte dedicado. | Diseñar flujo soporte separado con límites de costo. |
| 13 | Revisar repo zentiapp para reciclar componentes | **Pendiente** | No hay evidencia de sync entre repos. | Hacer inventario reusable (UI + taxonomía de fondos + scoring). |
| 14 | Probar todo E2E con informes reales (agent QA) | **Pendiente crítico** | Hay scripts smoke, falta suite robusta con casos reales y asserts. | Crear `qa/e2e-real-cases/` + reporte pass/fail persistente. |
| 15 | Instancia para comentarios + wishlist de pago | **Cubierto** | `index.html` incluye formulario wishlist + comentarios + disposición a pago. | Conectar salida a tablero trazable (Sheets/DB). |
| 16 | Scraping continuo de fondos (Grantwatch/Funding portal) | **Pendiente** | No existe pipeline scraping continuo en repo. | Prototipo incremental: job diario + normalización + dedupe. |

## Priorización propuesta (2 semanas)

### Semana 1 (estabilización operativa)
1. Cerrar #3/#11 con validación real de links/pago/agenda.
2. Resolver #4 y #7 (formatos en Drive y registros).
3. Ejecutar #14 con 5 casos reales y checklist firmado.

### Semana 2 (producto/comercial)
1. Implementar #2 (top-3 alternativas).
2. Implementar #6 (viewer online).
3. Diseñar MVP #5 (cupones) y plan #16 (scraping).

