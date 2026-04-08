# Design Handoff — ZENTI Landing Page
**Archivo:** `index.html` · **Generado:** 2026-04-07
**Stack:** HTML + CSS + Vanilla JS · **Fuente:** Inter (Google Fonts)

---

## Design Tokens (actuales)

| Token | Valor | Uso |
|-------|-------|-----|
| `--z-orange` | `#F26C22` | CTAs, acentos, marcas |
| `--z-black` | `#111111` | Textos principales, nav, hero bg |
| `--z-white` | `#FFFFFF` | Fondos de secciones |
| `--z-gray-400` | `#9CA3AF` | Labels secundarios |
| `--z-gray-500` | `#6B7280` | Textos de apoyo |
| `--z-gray-700` | `#374151` | Textos de cuerpo |
| `--z-border` | `#E5E7EB` | Bordes de cards |
| `--z-font` | `'Inter', ui-sans-serif` | Toda la tipografía |
| `--z-max-w` | `1080px` | Max-width de contenedores |
| `--z-radius` | `16px` | Border-radius de cards |

---

## Problemas críticos — implementación exacta

### 1. 🔴 Pricing card Premium sin diferenciación visual

**Estado actual (línea 1024):**
```css
/* El card Premium solo tiene borde naranja — sin sombra, sin bg diferenciado */
border-color: var(--z-orange);
/* box-shadow: none (heredado de .step) */
```

**Fix:**
```css
/* Agregar al div.step que tiene border-color:var(--z-orange) */
box-shadow: 0 20px 60px rgba(242, 108, 34, 0.18);
background: #FFFBF8;           /* fondo levemente cálido — no blanco puro */
transform: translateY(-4px);  /* elevación visual */
```

**Estados:**
| State | Behavior |
|-------|----------|
| Default | `box-shadow: 0 20px 60px rgba(242,108,34,0.18)`, `transform: translateY(-4px)` |
| Hover | `box-shadow: 0 28px 70px rgba(242,108,34,0.25)`, `transform: translateY(-6px)` |

---

### 2. 🔴 Disclaimer testimonios mal ubicado

**Estado actual (línea 982):**
```html
<!-- ANTES del grid de quotes — siembra duda primero -->
<p style="...font-size:13px;color:var(--z-gray-400)">
  Testimonios de la fase beta; resultados varían…
</p>
<div class="quote-grid">...</div>
```

**Fix:** mover el `<p>` del disclaimer al final del `quote-grid`, después del último `quote-card`. Sin cambio de estilos.

---

### 3. 🟠 Separador `○` entre CTAs del hero

**Estado actual (línea 792):**
```html
<span class="hero-sep">o</span>
```
```css
.hero-sep { color: rgba(255,255,255,.25); font-size: 13px; }
```

**Fix:** cambiar el texto de `o` a una barra vertical:
```html
<span class="hero-sep" aria-hidden="true">|</span>
```
```css
/* o simplemente usar gap en el flex container y ocultar el separador */
.hero-sep {
  color: rgba(255,255,255,.12);
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
}
```

---

### 4. 🟠 Stats bar — jerarquía tipográfica

**Estado actual (líneas 156–165):**
```css
.stat-num   { font-size: 24px; font-weight: 800; color: #FFFFFF; }
.stat-label { font-size: 11px; color: rgba(255,255,255,.35); font-weight: 500; }
```

**Fix:**
```css
.stat-num   { font-size: 2.5rem; /* 40px */ font-weight: 800; color: #FFFFFF; line-height: 1; }
.stat-label { font-size: 0.8rem; color: rgba(255,255,255,.45); font-weight: 600; letter-spacing: .04em; text-transform: uppercase; margin-top: 4px; }
.stat-item  { padding: 24px 16px; gap: 6px; } /* más aire vertical */
```

---

### 5. 🟠 Ritmo visual entre secciones blancas

**Estado actual:** `#how`, `#pricing`, `#faq` usan todos `background: white` — sin separación.

**Fix:** alternar con gris muy sutil:
```css
/* Secciones que cambian a gris */
#pricing { background: #F9FAFB; }  /* gray-50 */
/* #how y #faq se quedan en white */
```
No usar `--z-gray-100` (#F3F4F6) — es demasiado evidente.

---

### 6. 🟡 Nav logo mark — border-radius

**Estado actual (línea 72):**
```css
.nav-mark { width: 32px; height: 32px; border-radius: 8px; /* ya tiene radius */ }
```
> **Nota:** el logo ya tiene `border-radius: 8px`. El informe de diseño mencionaba bordes rectos pero el código ya los tiene redondeados. **No requiere cambio.**

---

### 7. 🟡 Quote cards — visibilidad sobre fondo blanco

**Estado actual (línea 730):**
```css
.quote-card { border: 1px solid var(--z-border); background: var(--z-white); }
/* var(--z-border) = #E5E7EB — casi invisible sobre blanco */
```

**Fix:**
```css
.quote-card {
  border: 1px solid #E5E7EB;
  background: #F9FAFB;           /* fondo levemente gris */
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
}
/* Si la sección de testimonios se mueve a bg #F9FAFB,
   las cards deben ir a background: #FFFFFF */
```

---

## Mejoras pendientes (no bloqueantes)

### Hero — mockup visual
No hay ningún `<img>` en la página. La mejora de mayor impacto: agregar al hero un mockup estilizado del informe PDF como elemento flotante (HTML/CSS, no imagen).

**Placeholder structure:**
```html
<div class="hero-mockup" aria-hidden="true">
  <!-- Replica estilizada del informe — ver ZENTI-ejemplo-mejorado.html -->
  <!-- Usar transform: perspective(800px) rotateY(-8deg) rotateX(4deg) -->
</div>
```

```css
.hero { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
@media (max-width: 768px) { .hero { grid-template-columns: 1fr; } .hero-mockup { display: none; } }
```

> ⚠ Implica refactorizar el hero de bloque centrado a 2 columnas — cambio mayor. Priorizar después de los fixes urgentes.

### Módulo evaluador — progreso visual

El evaluador (`#evaluator`) en `.step-form` usa solo texto `"Paso X de 8"`.

**Mejora:** agregar barra de progreso CSS:
```html
<div class="eval-progress" style="--pct: 25%">
  <div class="eval-progress-fill"></div>
</div>
```
```css
.eval-progress { height: 3px; background: #E5E7EB; border-radius: 2px; margin-bottom: 20px; }
.eval-progress-fill { height: 100%; width: var(--pct); background: var(--z-orange); border-radius: 2px; transition: width .3s ease; }
```

### Footer — señales de confianza
Agregar después de los links del footer:
```html
<div class="footer-trust">
  <span>Fondos cubiertos:</span>
  <!-- logo-marks en versión gris/blanco al 30% de opacidad -->
</div>
```

---

## Responsive breakpoints (actuales)

| Breakpoint | Comportamiento |
|------------|---------------|
| `> 900px` | Layout completo, nav-links visible |
| `768–900px` | nav-links ocultos |
| `< 640px` | stats-bar vertical, hero CTAs en columna, hero-sep oculto |
| `< 480px` | hero h1 clamped a `28px` |

---

## Accesibilidad — gaps detectados

| Elemento | Problema | Fix |
|----------|----------|-----|
| `.ticker-logo` | No tiene `aria-label` ni `role` | Agregar `aria-hidden="true"` al ticker completo (decorativo) |
| `.hero-sep` | El `○` no tiene `aria-hidden` | Agregar `aria-hidden="true"` |
| Pricing cards | Sin `role="article"` ni heading | Agregar `<h3>` dentro de cada card |
| Quote cards | `<cite>` no referencia el `<blockquote>` | Envolver cada quote en `<blockquote>` |

---

## Orden de implementación recomendado

```
Sprint 1 (30 min):
  ✅ Pricing Premium — box-shadow + bg
  ✅ Disclaimer testimonios — mover al final
  ✅ Separador hero CTAs — cambiar a |
  ✅ Stats bar — aumentar font-size num a 2.5rem

Sprint 2 (1h):
  ○ Ritmo secciones — alternar #F9FAFB
  ○ Quote cards — bg #F9FAFB + sombra sutil
  ○ Barra de progreso evaluador

Sprint 3 (2-4h):
  ○ Hero mockup — layout 2 columnas + componente informe
  ○ Footer trust signals
```
