# QA — informes premium (artefactos locales)

Aquí viven **HTML y texto generados en tu máquina** a partir del mismo código que usa n8n (`render-html-premium.js`, `render-premium-report.js`, `prompt-premium-report.js`), **sin llamar al LLM**. Sirven para revisar maquetación, secciones y prompt antes de que el ramal premium esté cableado en Cloud.

## Regenerar

Desde la raíz del repo:

```bash
./scripts/qa-premium-informes.sh
```

O:

```bash
node scripts/qa-premium-informes-build.mjs
```

## Qué abrir mañana

| Archivo | Uso |
|--------|-----|
| `00-metadata-qa.json` | Resumen: qué archivos hay y `premium_sections_found` / `premium_missing_sections` |
| `01-informe-premium-completo-geo-sentinel.html` | **Informe premium detallado** (muestra larga en `scripts/zenti-premium-sample.md`) |
| `02-informe-gratuito-solo-scorecard.html` | Misma evaluación sin capas premium extendidas |
| `03-prompt-llm-premium-para-anthropic.txt` | Texto del prompt para el segundo LLM en producción |
| `04-informe-premium-secciones-parciales-qa.html` | Caso con pocas secciones: validar secciones faltantes |

En macOS puedes abrir el HTML con:

```bash
open qa-premium-informes/01-informe-premium-completo-geo-sentinel.html
```

## Nota de producto

El **pipeline end-to-end** (pago → segundo LLM → este render en correo) sigue dependiendo del deploy en n8n Cloud. Esta carpeta es la **prueba visual y de contenido** del diseño premium en repo.
