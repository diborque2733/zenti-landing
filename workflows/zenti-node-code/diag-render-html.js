/**
 * Nodo: 🖥️ Render HTML Diagnóstico
 *
 * Template ZENTI premium para el reporte de diagnóstico.
 * Lee datos pre-extraídos de 📦 Consolidar Diagnóstico.
 * Palette: --z-black #111 · --z-orange #F26C22 · grises.
 */
const d = $input.first().json;

/* ═══════════════════════════════════════════════════════════
   1. DATA
   ═══════════════════════════════════════════════════════════ */

const diagnostico     = d.diagnostico     || [];
const fortalezas      = d.fortalezas      || [];
const brechas         = d.brechas         || [];
const recomendaciones = d.recomendaciones || [];
const completitud     = d.completitud     || 0;

const fecha    = (d.generado_en || d.timestamp || new Date().toISOString()).slice(0, 10);
const proyecto = d.nombre  || 'Proyecto';
const empresa  = d.empresa || '';
const sector   = d.sector  || '';
const fondo    = d.fondo   || '';
const trl      = d.trl     || '';

/* ═══════════════════════════════════════════════════════════
   2. UTILITIES
   ═══════════════════════════════════════════════════════════ */

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function boldify(html) {
  return html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function mdToHtml(text) {
  if (!text) return '';
  const lines = text.split('\n');
  const out = [];
  let inUl = false, inOl = false, inP = false;
  const closeP = () => { if (inP) { out.push('</p>'); inP = false; } };
  const closeLists = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { closeP(); closeLists(); continue; }
    let hm;
    if ((hm = line.match(/^###\s+(.+)/))) { closeP(); closeLists(); out.push(`<h4>${boldify(esc(hm[1]))}</h4>`); continue; }
    if ((hm = line.match(/^##\s+(.+)/)))  { closeP(); closeLists(); out.push(`<h3>${boldify(esc(hm[1]))}</h3>`); continue; }
    if ((hm = line.match(/^#\s+(.+)/)))   { closeP(); closeLists(); out.push(`<h3>${boldify(esc(hm[1]))}</h3>`); continue; }
    if (/^[-*]\s+/.test(line)) {
      closeP();
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${boldify(esc(line.replace(/^[-*]\s+/, '')))}</li>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      closeP();
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push(`<li>${boldify(esc(line.replace(/^\d+\.\s+/, '')))}</li>`);
      continue;
    }
    closeLists();
    if (!inP) { out.push('<p>'); inP = true; } else { out.push(' '); }
    out.push(boldify(esc(line)));
  }
  closeP(); closeLists();
  return out.join('\n');
}

/* ═══════════════════════════════════════════════════════════
   3. HTML FRAGMENTS
   ═══════════════════════════════════════════════════════════ */

// Diagnostic scorecard
let diagBlock = '';
if (diagnostico.length) {
  const trs = diagnostico.map(r => {
    const cls = r.status === 'completo' ? 'hi' : 'lo';
    const label = r.status === 'completo' ? '✓ Completo' : '⚠ Débil';
    return `<tr>
      <td class="sc-name">${esc(r.area)}</td>
      <td class="sc-score"><span class="pill ${cls}">${label}</span></td>
      <td class="sc-read">${boldify(esc(r.content.slice(0, 200) + (r.content.length > 200 ? '...' : '')))}</td>
    </tr>`;
  }).join('');
  diagBlock = `<table class="scorecard">
    <thead><tr><th>Área diagnóstica</th><th>Estado</th><th>Síntesis</th></tr></thead>
    <tbody>${trs}</tbody>
  </table>`;
}

// Brechas
let brechasBlock = '';
if (brechas.length) {
  brechasBlock = '<ul class="finding-list">'
    + brechas.map(h => `<li>${boldify(esc(h))}</li>`).join('')
    + '</ul>';
}

// Fortalezas
let fortalezasBlock = '';
if (fortalezas.length) {
  fortalezasBlock = '<ul class="strength-list">'
    + fortalezas.map(f => `<li>${boldify(esc(f))}</li>`).join('')
    + '</ul>';
}

// Recomendaciones
let recoBlock = '';
if (recomendaciones.length) {
  recoBlock = '<ol class="reco-list">'
    + recomendaciones.map(r => `<li>${boldify(esc(r))}</li>`).join('')
    + '</ol>';
}

// Problem + Solution full text
const problemHtml = mdToHtml(d.problem_full || '');
const solutionHtml = mdToHtml(d.solution_full || '');

/* ═══════════════════════════════════════════════════════════
   4. STYLES
   ═══════════════════════════════════════════════════════════ */

const css = `
:root {
  --z-black:   #111111;
  --z-orange:  #F26C22;
  --z-gray-700:#444444;
  --z-gray-400:#9CA3AF;
  --z-gray-100:#F3F4F6;
  --z-border:  #E5E7EB;
  --z-white:   #FFFFFF;
  --z-green:   #059669;
  --z-font:    'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --z-max-w:   780px;
  --z-radius:  8px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 15px; }
body {
  font-family: var(--z-font);
  color: var(--z-black);
  background: var(--z-white);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

.report { max-width: var(--z-max-w); margin: 0 auto; padding: 56px 40px 72px; }

/* Cover */
.cover { margin-bottom: 52px; }
.wordmark { font-size: 13px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: var(--z-black); }
.accent-line { border: none; height: 2px; background: var(--z-orange); width: 48px; margin: 20px 0 28px; }
.cover h1 { font-size: 26px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: var(--z-black); margin-bottom: 6px; }
.cover-sub { font-size: 15px; color: var(--z-gray-700); margin-bottom: 28px; }
.cover-meta { font-size: 13px; color: var(--z-gray-700); line-height: 2; }
.cover-meta strong { color: var(--z-black); font-weight: 600; }

/* Sections */
.section { margin-bottom: 44px; }
.section-title {
  font-size: 11px; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase;
  color: var(--z-gray-400); margin-bottom: 16px;
  padding-bottom: 10px; border-bottom: 1px solid var(--z-border);
}

/* Result card */
.result-card {
  background: var(--z-gray-100); border: 1px solid var(--z-border);
  border-radius: var(--z-radius); padding: 32px 36px;
  display: flex; gap: 36px; flex-wrap: wrap;
}
.result-item { flex: 1 1 200px; min-width: 160px; }
.result-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--z-gray-400); margin-bottom: 8px; }
.result-value { font-size: 20px; font-weight: 700; color: var(--z-black); line-height: 1.25; }
.result-value.accent { color: var(--z-orange); }
.result-value-sm { font-size: 15px; font-weight: 600; color: var(--z-black); line-height: 1.4; }
.prob-track { height: 5px; background: var(--z-border); border-radius: 3px; overflow: hidden; margin-top: 12px; }
.prob-fill { height: 100%; background: var(--z-orange); border-radius: 3px; }

/* Judgment box */
.judgment {
  border: 1px solid var(--z-border); border-left: 4px solid var(--z-orange);
  border-radius: var(--z-radius); padding: 24px 28px;
  font-size: 15px; color: var(--z-gray-700); line-height: 1.75;
}
.judgment strong { color: var(--z-black); }

/* Scorecard */
.scorecard { width: 100%; border-collapse: collapse; font-size: 14px; }
.scorecard th { text-align: left; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--z-gray-400); padding: 12px 16px; border-bottom: 2px solid var(--z-border); }
.scorecard td { padding: 16px; border-bottom: 1px solid var(--z-border); vertical-align: top; }
.scorecard tr:last-child td { border-bottom: none; }
.sc-name { font-weight: 600; color: var(--z-black); white-space: nowrap; }
.sc-read { color: var(--z-gray-700); line-height: 1.55; }
.pill { display: inline-block; font-weight: 700; font-size: 13px; padding: 3px 10px; border-radius: 12px; white-space: nowrap; }
.pill.hi { color: var(--z-green); background: #ecfdf5; }
.pill.lo { color: #b45309; background: #fffbeb; }

/* Lists */
.finding-list, .strength-list { padding: 0; list-style: none; }
.finding-list li, .strength-list li {
  position: relative; padding: 10px 0 10px 18px;
  font-size: 14px; color: var(--z-gray-700); line-height: 1.6;
  border-bottom: 1px solid var(--z-gray-100);
}
.finding-list li:last-child, .strength-list li:last-child { border-bottom: none; }
.finding-list li::before {
  content: ''; position: absolute; left: 0; top: 18px;
  width: 5px; height: 5px; border-radius: 50%; background: #b45309;
}
.strength-list li::before {
  content: ''; position: absolute; left: 0; top: 18px;
  width: 5px; height: 5px; border-radius: 50%; background: var(--z-green);
}
.finding-list li strong, .strength-list li strong { color: var(--z-black); }

.reco-list { padding: 0; list-style: none; counter-reset: reco; }
.reco-list li {
  position: relative; padding: 10px 0 10px 32px;
  font-size: 14px; color: var(--z-gray-700); line-height: 1.6;
  border-bottom: 1px solid var(--z-gray-100);
}
.reco-list li:last-child { border-bottom: none; }
.reco-list li::before {
  counter-increment: reco; content: counter(reco);
  position: absolute; left: 0; top: 10px;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--z-gray-100); color: var(--z-orange);
  font-size: 11px; font-weight: 700; display: grid; place-items: center;
}
.reco-list li strong { color: var(--z-black); }

/* Body content */
.body-content h3 { font-size: 16px; font-weight: 700; color: var(--z-black); margin: 32px 0 12px; padding-left: 14px; border-left: 3px solid var(--z-orange); }
.body-content h4 { font-size: 14px; font-weight: 700; color: var(--z-black); margin: 24px 0 8px; }
.body-content p { font-size: 14px; color: var(--z-gray-700); line-height: 1.75; margin: 0 0 14px; }
.body-content ul, .body-content ol { padding-left: 22px; margin: 8px 0 16px; }
.body-content li { font-size: 14px; color: var(--z-gray-700); line-height: 1.65; margin-bottom: 4px; }
.body-content strong { color: var(--z-black); }
.quiet { font-size: 14px; color: var(--z-gray-400); }

/* Footer */
.report-footer { margin-top: 56px; padding-top: 20px; border-top: 1px solid var(--z-border); font-size: 12px; color: var(--z-gray-400); line-height: 1.6; }
.footer-brand { font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--z-gray-700); }

/* Toolbar */
.toolbar { display: none; }
.btn-pdf { padding: 10px 18px; border: 1px solid var(--z-border); border-radius: 6px; background: var(--z-white); color: var(--z-black); font-family: var(--z-font); font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s; }
.btn-pdf:hover { background: var(--z-gray-100); }

@page { size: A4; margin: 18mm 14mm 20mm 14mm; }
@media screen { .toolbar { display: block; position: fixed; top: 20px; right: 20px; z-index: 100; } }
@media print {
  html { font-size: 13px; } body { background: #fff; }
  .report { max-width: 100%; padding: 0; } .toolbar { display: none !important; }
  .result-card, .scorecard, .judgment, .section { break-inside: avoid; page-break-inside: avoid; }
  .body-content h3, .body-content h4 { page-break-after: avoid; }
  p { orphans: 3; widows: 3; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
@media (max-width: 640px) {
  .report { padding: 32px 18px 48px; }
  .cover h1 { font-size: 22px; }
  .result-card { flex-direction: column; gap: 24px; padding: 24px 20px; }
  .result-value { font-size: 18px; }
  .scorecard td, .scorecard th { padding: 12px 10px; font-size: 13px; }
}
`;

/* ═══════════════════════════════════════════════════════════
   5. HTML ASSEMBLY
   ═══════════════════════════════════════════════════════════ */

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <title>ZENTI — Diagnóstico estratégico</title>
  <style>${css}</style>
</head>
<body>

  <div class="toolbar">
    <button type="button" class="btn-pdf" onclick="window.print()">Exportar informe</button>
  </div>

  <div class="report">

    <header class="cover">
      <div class="wordmark">ZENTI</div>
      <hr class="accent-line" />
      <h1>Diagnóstico estratégico</h1>
      <p class="cover-sub">Problema, causa raíz, brecha de innovación y solución articulada</p>
      <div class="cover-meta">
        Proyecto: <strong>${esc(proyecto)}</strong><br/>
        ${empresa ? `Empresa: <strong>${esc(empresa)}</strong><br/>` : ''}
        ${sector ? `Sector: <strong>${esc(sector)}</strong><br/>` : ''}
        ${fondo ? `Instrumento: <strong>${esc(fondo)}</strong><br/>` : ''}
        ${trl ? `TRL: <strong>${esc(trl)}</strong><br/>` : ''}
        Fecha: <strong>${esc(fecha)}</strong>
      </div>
    </header>

    <section class="section">
      <div class="section-title">Completitud del diagnóstico</div>
      <div class="result-card">
        <div class="result-item">
          <span class="result-label">Áreas completadas</span>
          <span class="result-value accent">${fortalezas.length}/${diagnostico.length}</span>
        </div>
        <div class="result-item">
          <span class="result-label">Índice de completitud</span>
          <span class="result-value accent">${completitud}%</span>
          <div class="prob-track"><div class="prob-fill" style="width:${completitud}%"></div></div>
        </div>
        <div class="result-item">
          <span class="result-label">Brechas detectadas</span>
          <span class="result-value-sm">${brechas.length > 0 ? brechas.length + ' áreas requieren refuerzo' : 'Sin brechas críticas'}</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-title">Mapa diagnóstico</div>
      ${diagBlock || '<p class="quiet">Diagnóstico detallado en la fundamentación a continuación.</p>'}
    </section>

    ${fortalezasBlock ? `<section class="section">
      <div class="section-title">Fortalezas identificadas</div>
      ${fortalezasBlock}
    </section>` : ''}

    ${brechasBlock ? `<section class="section">
      <div class="section-title">Brechas y áreas de mejora</div>
      ${brechasBlock}
    </section>` : ''}

    ${recoBlock ? `<section class="section">
      <div class="section-title">Ruta de fortalecimiento</div>
      ${recoBlock}
    </section>` : ''}

    ${problemHtml ? `<section class="section">
      <div class="section-title">Análisis del problema</div>
      <div class="body-content">${problemHtml}</div>
    </section>` : ''}

    ${solutionHtml ? `<section class="section">
      <div class="section-title">Articulación de la solución</div>
      <div class="body-content">${solutionHtml}</div>
    </section>` : ''}

    <section class="section">
      <div class="section-title">Próximos pasos</div>
      <div class="judgment">
        Este diagnóstico alimenta directamente los módulos <strong>ZENTI.research</strong> (estado del arte),
        <strong>ZENTI.market</strong> (análisis de mercado) y <strong>ZENTI.framework</strong> (marco teórico + hipótesis).
        Revise las brechas identificadas antes de avanzar a la siguiente fase de la propuesta.
      </div>
    </section>

    <footer class="report-footer">
      <span class="footer-brand">ZENTI</span> · Diagnóstico estratégico para postulaciones a fondos de innovación, I+D+i y emprendimiento.
    </footer>

  </div>
</body>
</html>`;

return [{ json: { html } }];
