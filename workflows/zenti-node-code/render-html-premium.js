/**
 * Nodo: 🖥️ Render HTML Reporte
 *
 * Template puro — cero parsing de reporte_final.
 * Lee datos pre-extraídos de 📦 Consolidar:
 *   d.metrics, d.scoreRows, d.hallazgos,
 *   d.recomendaciones, d.bodyText
 *
 * Palette: --z-blue:#1a56db · --z-green:#057a55 · --z-orange:#F26C22
 * Charts: Chart.js 4 (CDN) — gauge probabilidad + barras criterios
 * Estilo: ejecutivo, imprimible A4, gráficos inline.
 */
const d = $input.first().json;

const metrics         = d.metrics        || {};
const scoreRows       = d.scoreRows      || [];
const hallazgos       = d.hallazgos      || [];
const recomendaciones = d.recomendaciones || [];
const bodyText        = d.bodyText        || '';

const fecha    = (d.generado_en || d.timestamp || new Date().toISOString()).slice(0, 10);
const proyecto = d.nombre  || 'Proyecto';
const empresa  = d.empresa || '';
const fondo    = d.fondo   || '';
const trl      = d.trl     || '';

const ZENTI_LINK_PREMIUM_USD = 'https://zentigrants.com/#pricing';
const ZENTI_LINK_PREMIUM_CLP = 'https://www.flow.cl/uri/JSbQZ7S1H';

/* ── Chart data para Chart.js ── */
const probVal   = metrics.probabilidad || 0;
const chartBarLabels = scoreRows.map(r => JSON.stringify(r.criterio || ''));
const chartBarData   = scoreRows.map(r => {
  const pct = Math.round(((r.nota || 0) / (r.max || 5)) * 100);
  return pct;
});
const chartBarColors = chartBarData.map(p =>
  p >= 70 ? "'#1a56db'" : p >= 50 ? "'#057a55'" : p >= 35 ? "'#d97706'" : "'#dc2626'"
);

/* ── Utilities ── */

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
  const closeLists = () => { if (inUl) { out.push('</ul>'); inUl = false; } if (inOl) { out.push('</ol>'); inOl = false; } };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { closeP(); closeLists(); continue; }
    let hm;
    if ((hm = line.match(/^###\s+(.+)/))) { closeP(); closeLists(); out.push('<h4>' + boldify(esc(hm[1])) + '</h4>'); continue; }
    if ((hm = line.match(/^##?\s+(.+)/))) { closeP(); closeLists(); out.push('<h3>' + boldify(esc(hm[1])) + '</h3>'); continue; }
    if (/^[-*]\s+/.test(line)) { closeP(); if (inOl) { out.push('</ol>'); inOl = false; } if (!inUl) { out.push('<ul>'); inUl = true; } out.push('<li>' + boldify(esc(line.replace(/^[-*]\s+/,''))) + '</li>'); continue; }
    if (/^\d+\.\s+/.test(line)) { closeP(); if (inUl) { out.push('</ul>'); inUl = false; } if (!inOl) { out.push('<ol>'); inOl = true; } out.push('<li>' + boldify(esc(line.replace(/^\d+\.\s+/,''))) + '</li>'); continue; }
    closeLists();
    if (!inP) { out.push('<p>'); inP = true; } else { out.push(' '); }
    out.push(boldify(esc(line)));
  }
  closeP(); closeLists();
  return out.join('\n');
}

/* ── Scorecard con barras visuales ── */

let scorecardBlock = '';
if (scoreRows.length) {
  const bars = scoreRows.map(r => {
    const pct  = Math.round(((r.nota || 0) / (r.max || 5)) * 100);
    const col  = pct >= 70 ? '#1a56db' : pct >= 50 ? '#057a55' : pct >= 35 ? '#d97706' : '#dc2626';
    const tag  = pct >= 70 ? 'Sólido' : pct >= 50 ? 'Aceptable' : pct >= 35 ? 'Débil' : 'Crítico';
    return `<div class="bar-row">
      <div class="bar-meta">
        <span class="bar-name">${esc(r.criterio)}</span>
        <span class="bar-score" style="color:${col}">${r.nota}<span class="bar-max">/${r.max}</span></span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${col}"></div></div>
      <div class="bar-tag" style="color:${col}">${tag}</div>
      ${r.lectura ? `<div class="bar-read">${boldify(esc(r.lectura))}</div>` : ''}
    </div>`;
  }).join('');
  scorecardBlock = `<div class="bar-chart-block">${bars}</div>`;
} else {
  scorecardBlock = '<p class="quiet">Diagn\u00f3stico detallado en la fundamentaci\u00f3n a continuaci\u00f3n.</p>';
}

/* ── Hallazgos con cards numeradas ── */

let hallazgosBlock = '';
if (hallazgos.length) {
  hallazgosBlock = '<div class="finding-cards">' + hallazgos.map((h, i) =>
    `<div class="finding-card"><span class="finding-num">${i+1}</span><span class="finding-text">${boldify(esc(h))}</span></div>`
  ).join('') + '</div>';
}

/* ── Recomendaciones por prioridad ── */

let recoBlock = '';
if (recomendaciones.length) {
  const alta = recomendaciones.slice(0, 3);
  const media = recomendaciones.slice(3, 6);
  const comp = recomendaciones.slice(6);

  function recoTier(items, label, tierCls) {
    if (!items.length) return '';
    return '<div class="reco-tier ' + tierCls + '"><div class="reco-tier-label">' + esc(label) + '</div><ul class="reco-tier-list">' + items.map(r => '<li>' + boldify(esc(r)) + '</li>').join('') + '</ul></div>';
  }
  recoBlock = recoTier(alta, 'Prioridad alta', 'tier-alta') + recoTier(media, 'Prioridad media', 'tier-media') + recoTier(comp, 'Complementaria', 'tier-comp');
}

/* ── Body ── */

const bodyHtml = mdToHtml(bodyText);

/* ── Resolución del comité ── */

const probLabel = metrics.probabilidad >= 60 ? 'Favorable con observaciones' : metrics.probabilidad >= 35 ? 'Condicionada a mejoras sustantivas' : 'No favorable en estado actual';
const probColor = metrics.probabilidad >= 60 ? '#16a34a' : metrics.probabilidad >= 35 ? '#d97706' : '#dc2626';

/* ══════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════ */

const css = `
:root{
  --z-black:#111111;--z-blue:#1a56db;--z-green:#057a55;--z-orange:#F26C22;
  --z-amber:#d97706;--z-red:#dc2626;
  --z-gray-700:#374151;--z-gray-500:#6B7280;--z-gray-400:#9CA3AF;
  --z-gray-200:#E5E7EB;--z-gray-100:#F3F4F6;--z-border:#E5E7EB;--z-white:#FFFFFF;
  --z-font:'Inter',ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  --z-max-w:800px;--z-radius:12px
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:15px}
body{font-family:var(--z-font);color:var(--z-black);background:#f8fafc;line-height:1.7;-webkit-font-smoothing:antialiased}
.report{max-width:var(--z-max-w);margin:0 auto;padding:56px 48px 80px;background:var(--z-white);box-shadow:0 1px 3px rgba(0,0,0,.08)}

/* ── Cover ── */
.cover{margin-bottom:56px;padding-bottom:40px;border-bottom:1px solid var(--z-gray-200)}
.cover-brand{display:flex;align-items:center;gap:10px;margin-bottom:32px}
.cover-wordmark{font-size:18px;font-weight:800;letter-spacing:.04em;color:var(--z-black)}
.cover-wordmark span{color:var(--z-blue)}
.cover-badge{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--z-white);background:var(--z-blue);padding:3px 10px;border-radius:20px}
.cover h1{font-size:26px;font-weight:800;line-height:1.15;letter-spacing:-0.02em;color:var(--z-black);margin-bottom:8px}
.cover-sub{font-size:14px;color:var(--z-gray-500);margin-bottom:28px}
.cover-meta-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-top:24px}
.meta-card{background:var(--z-gray-100);border:1px solid var(--z-gray-200);border-radius:8px;padding:14px 16px}
.meta-card-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--z-gray-400);margin-bottom:4px}
.meta-card-value{font-size:14px;font-weight:600;color:var(--z-black)}

/* ── Sections ── */
.section{margin-bottom:52px}
.section-title{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--z-gray-400);margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid var(--z-gray-200)}

/* ── KPI Cards ── */
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.kpi-card{border:1px solid var(--z-gray-200);border-radius:var(--z-radius);padding:24px 20px;position:relative;overflow:hidden}
.kpi-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px}
.kpi-card.kpi-nota::before{background:var(--z-blue)}
.kpi-card.kpi-verd::before{background:var(--z-orange)}
.kpi-card.kpi-prob::before{background:var(--z-green)}
.kpi-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--z-gray-400);margin-bottom:10px}
.kpi-value{font-size:24px;font-weight:800;line-height:1.1;color:var(--z-black)}
.kpi-value.blue{color:var(--z-blue)}.kpi-value.orange{color:var(--z-orange)}.kpi-value.green{color:var(--z-green)}
.kpi-sub{font-size:12px;color:var(--z-gray-500);margin-top:6px;line-height:1.4}
.gauge-wrap{margin-top:12px;text-align:center}
.gauge-wrap canvas{max-width:140px;height:70px!important}

/* ── Judgment ── */
.judgment{border:1px solid var(--z-gray-200);border-left:4px solid var(--z-blue);border-radius:var(--z-radius);padding:28px 32px;font-size:15px;color:var(--z-gray-700);line-height:1.8;background:var(--z-gray-100)}
.judgment strong{color:var(--z-black)}

/* ── Bar chart scorecard ── */
.bar-chart-block{display:flex;flex-direction:column;gap:20px}
.chart-canvas-wrap{background:var(--z-gray-100);border:1px solid var(--z-gray-200);border-radius:var(--z-radius);padding:20px 24px;margin-bottom:8px}
.chart-canvas-wrap canvas{max-height:220px}
.bar-row{padding:12px 0;border-bottom:1px solid var(--z-gray-100)}
.bar-row:last-child{border-bottom:none}
.bar-meta{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
.bar-name{font-size:13px;font-weight:600;color:var(--z-black)}
.bar-score{font-size:15px;font-weight:700}
.bar-max{font-size:11px;font-weight:400;color:var(--z-gray-400)}
.bar-track{height:7px;background:var(--z-gray-200);border-radius:4px;overflow:hidden;margin-bottom:4px}
.bar-fill{height:100%;border-radius:4px;transition:width .3s}
.bar-tag{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;margin-bottom:4px}
.bar-read{font-size:13px;color:var(--z-gray-500);line-height:1.55;margin-top:4px}

/* ── Finding cards ── */
.finding-cards{display:flex;flex-direction:column;gap:10px}
.finding-card{display:flex;align-items:flex-start;gap:14px;padding:16px 18px;border:1px solid var(--z-gray-200);border-radius:10px;background:var(--z-white)}
.finding-num{flex-shrink:0;width:28px;height:28px;border-radius:50%;background:var(--z-orange);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px}
.finding-text{font-size:14px;color:var(--z-gray-700);line-height:1.65}
.finding-text strong{color:var(--z-black)}

/* ── Recomendaciones ── */
.reco-tier{margin-bottom:24px}
.reco-tier:last-child{margin-bottom:0}
.reco-tier-label{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;margin-bottom:10px;padding:5px 12px;border-radius:6px;display:inline-block}
.tier-alta .reco-tier-label{background:#EEF2FF;color:var(--z-blue)}
.tier-media .reco-tier-label{background:#F0FDF4;color:var(--z-green)}
.tier-comp .reco-tier-label{background:var(--z-gray-100);color:var(--z-gray-500)}
.reco-tier-list{padding:0;list-style:none}
.reco-tier-list li{position:relative;padding:10px 0 10px 20px;font-size:14px;color:var(--z-gray-700);line-height:1.65;border-bottom:1px solid var(--z-gray-100)}
.reco-tier-list li:last-child{border-bottom:none}
.reco-tier-list li::before{content:'';position:absolute;left:0;top:18px;width:8px;height:8px;border-radius:50%}
.tier-alta .reco-tier-list li::before{background:var(--z-blue)}
.tier-media .reco-tier-list li::before{background:var(--z-green)}
.tier-comp .reco-tier-list li::before{background:var(--z-gray-400)}
.reco-tier-list li strong{color:var(--z-black)}

/* ── Upsell premium ── */
.upsell-card{background:linear-gradient(135deg,#1e3a8a 0%,#1a56db 100%);border-radius:var(--z-radius);padding:36px 32px;color:#fff;text-align:center}
.upsell-icon{font-size:28px;margin-bottom:12px}
.upsell-title{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:8px}
.upsell-heading{font-size:18px;font-weight:800;color:#fff;margin-bottom:8px}
.upsell-sub{font-size:13px;color:rgba(255,255,255,.75);line-height:1.6;max-width:480px;margin:0 auto 20px}
.upsell-features{list-style:none;padding:0;margin:0 auto 24px;max-width:340px;text-align:left}
.upsell-features li{font-size:13px;color:rgba(255,255,255,.85);padding:7px 0;border-bottom:1px solid rgba(255,255,255,.1);display:flex;align-items:center;gap:8px}
.upsell-features li:last-child{border-bottom:none}
.upsell-features li::before{content:'✓';color:#60a5fa;font-weight:700;font-size:14px}
.upsell-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn-usd{padding:13px 28px;background:#fff;color:var(--z-blue);border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:.02em}
.btn-clp{padding:13px 28px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none}

/* ── Resolución del comité ── */
.resolution{border:1px solid var(--z-gray-200);border-radius:var(--z-radius);overflow:hidden}
.resolution-header{background:var(--z-black);color:var(--z-white);padding:18px 32px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;display:flex;align-items:center;gap:10px}
.res-dot{width:10px;height:10px;border-radius:50%}
.resolution-body{padding:32px}
.resolution-row{margin-bottom:22px}
.resolution-row:last-child{margin-bottom:0}
.resolution-label{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--z-gray-400);margin-bottom:6px}
.resolution-value{font-size:14px;color:var(--z-gray-700);line-height:1.7}
.resolution-value strong{color:var(--z-black)}
.resolution-decision{font-size:16px;font-weight:700;line-height:1.3}
.decision-badge{display:inline-block;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:700;margin-top:6px}

/* ── Consultoría CTA ── */
.consultoria-cta{border:2px solid var(--z-orange);border-radius:var(--z-radius);padding:32px;text-align:center}

/* ── Body content ── */
.body-content h3{font-size:16px;font-weight:700;color:var(--z-black);margin:36px 0 14px;padding-left:16px;border-left:3px solid var(--z-blue)}
.body-content h4{font-size:14px;font-weight:700;color:var(--z-black);margin:28px 0 10px}
.body-content p{font-size:14px;color:var(--z-gray-700);line-height:1.8;margin:0 0 16px}
.body-content ul,.body-content ol{padding-left:22px;margin:10px 0 18px}
.body-content li{font-size:14px;color:var(--z-gray-700);line-height:1.7;margin-bottom:6px}
.body-content strong{color:var(--z-black)}
.quiet{font-size:14px;color:var(--z-gray-400)}

/* ── Footer ── */
.report-footer{margin-top:64px;padding-top:24px;border-top:1px solid var(--z-gray-200);font-size:12px;color:var(--z-gray-400);line-height:1.7}
.footer-brand{font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--z-black)}
.footer-brand span{color:var(--z-blue)}

/* ── Toolbar ── */
.toolbar{display:none}
.btn-pdf{padding:10px 18px;border:1px solid var(--z-gray-200);border-radius:6px;background:var(--z-white);color:var(--z-black);font-family:var(--z-font);font-size:13px;font-weight:600;cursor:pointer}

/* ── Print ── */
@page{size:A4;margin:16mm 14mm 18mm 14mm}
@media screen{body{padding:24px 0}.toolbar{display:block;position:fixed;top:20px;right:20px;z-index:100}}
@media print{
  html{font-size:13px}body{background:#fff;padding:0}
  .report{max-width:100%;padding:0;box-shadow:none}
  .toolbar{display:none!important}
  .kpi-grid,.kpi-card,.judgment,.resolution,.reco-tier,.upsell-card,.finding-card,.bar-row,.chart-canvas-wrap{break-inside:avoid;page-break-inside:avoid}
  .section{break-inside:avoid;page-break-inside:avoid}
  .body-content h3,.body-content h4{page-break-after:avoid}
  p{orphans:3;widows:3}
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}

/* ── Responsive ── */
@media(max-width:640px){
  .report{padding:32px 20px 48px}
  .cover h1{font-size:22px}
  .kpi-grid{grid-template-columns:1fr}
  .cover-meta-grid{grid-template-columns:repeat(2,1fr)}
  .resolution-body{padding:20px}
  .upsell-btns{flex-direction:column;align-items:center}
}
`;

/* ══════════════════════════════════════════════
   HTML ASSEMBLY
   ══════════════════════════════════════════════ */

/* ── Charts script ── */
const hasScores = scoreRows.length > 0;
const gaugeScript = `
<script>
(function(){
  // Gauge — probabilidad
  const gCtx = document.getElementById('gauge-prob');
  if(gCtx){
    new Chart(gCtx,{
      type:'doughnut',
      data:{
        datasets:[{
          data:[${probVal},${100-probVal}],
          backgroundColor:['${probVal>=60?'#057a55':probVal>=35?'#d97706':'#dc2626'}','#E5E7EB'],
          borderWidth:0,circumference:180,rotation:270
        }]
      },
      options:{responsive:true,maintainAspectRatio:false,cutout:'70%',plugins:{legend:{display:false},tooltip:{enabled:false}}}
    });
  }
  ${hasScores ? `
  // Horizontal bars — criterios
  const bCtx = document.getElementById('bar-criterios');
  if(bCtx){
    new Chart(bCtx,{
      type:'bar',
      data:{
        labels:[${chartBarLabels.join(',')}],
        datasets:[{
          data:[${chartBarData.join(',')}],
          backgroundColor:[${chartBarColors.join(',')}],
          borderRadius:5,borderSkipped:false
        }]
      },
      options:{
        indexAxis:'y',responsive:true,maintainAspectRatio:false,
        scales:{
          x:{min:0,max:100,grid:{color:'#F3F4F6'},ticks:{callback:v=>v+'%',font:{size:11}}},
          y:{grid:{display:false},ticks:{font:{size:12},color:'#374151'}}
        },
        plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.raw+'%'}}}
      }
    });
  }` : ''}
})();
</script>`;

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <title>ZENTI \u2014 Informe ejecutivo de competitividad</title>
  <style>${css}</style>
</head>
<body>

  <div class="toolbar">
    <button type="button" class="btn-pdf" onclick="window.print()">Exportar PDF</button>
  </div>

  <div class="report">

    <!-- COVER -->
    <header class="cover">
      <div class="cover-brand">
        <div class="cover-wordmark">ZENTI<span>.</span></div>
        <span class="cover-badge">Informe de Competitividad</span>
      </div>
      <h1>Diagn\u00f3stico estrat\u00e9gico de postulaci\u00f3n</h1>
      <p class="cover-sub">Evaluaci\u00f3n t\u00e9cnica y ruta de fortalecimiento para fondos de innovaci\u00f3n p\u00fablicos</p>
      <div class="cover-meta-grid">
        <div class="meta-card"><div class="meta-card-label">Proyecto</div><div class="meta-card-value">${esc(proyecto)}</div></div>
        ${empresa ? `<div class="meta-card"><div class="meta-card-label">Empresa</div><div class="meta-card-value">${esc(empresa)}</div></div>` : ''}
        ${fondo   ? `<div class="meta-card"><div class="meta-card-label">Instrumento</div><div class="meta-card-value">${esc(fondo)}</div></div>` : ''}
        ${trl     ? `<div class="meta-card"><div class="meta-card-label">TRL</div><div class="meta-card-value">${esc(trl)}</div></div>` : ''}
        <div class="meta-card"><div class="meta-card-label">Fecha</div><div class="meta-card-value">${esc(fecha)}</div></div>
      </div>
    </header>

    <!-- KPI CARDS -->
    <section class="section">
      <div class="section-title">Resultado consolidado</div>
      <div class="kpi-grid">
        <div class="kpi-card kpi-nota">
          <div class="kpi-label">Nota final</div>
          <div class="kpi-value blue">${esc(metrics.notaFinal || '\u2014')}</div>
          <div class="kpi-sub">${esc(metrics.veredicto || '')}</div>
        </div>
        <div class="kpi-card kpi-verd">
          <div class="kpi-label">Estimaci\u00f3n adjudicaci\u00f3n</div>
          <div class="kpi-value orange">${probVal}%</div>
          <div class="gauge-wrap"><canvas id="gauge-prob" width="140" height="70"></canvas></div>
        </div>
        <div class="kpi-card kpi-prob">
          <div class="kpi-label">Probabilidad</div>
          <div class="kpi-value green">${probVal >= 60 ? 'Alta' : probVal >= 35 ? 'Media' : 'Baja'}</div>
          <div class="kpi-sub">${esc(probLabel)}</div>
        </div>
      </div>
    </section>

    <!-- JUICIO EXPERTO -->
    <section class="section">
      <div class="section-title">Juicio experto ZENTI</div>
      <div class="judgment">${boldify(esc(metrics.resumen || metrics.justificacion || ''))}</div>
    </section>

    <!-- DIAGNÓSTICO + GRÁFICO -->
    <section class="section">
      <div class="section-title">Diagn\u00f3stico de competitividad</div>
      ${hasScores ? `<div class="chart-canvas-wrap"><canvas id="bar-criterios"></canvas></div>` : ''}
      ${scorecardBlock}
    </section>

    ${hallazgosBlock ? `<section class="section"><div class="section-title">Brechas cr\u00edticas de postulaci\u00f3n</div>${hallazgosBlock}</section>` : ''}

    ${recoBlock ? `<section class="section"><div class="section-title">Ruta de fortalecimiento recomendada</div>${recoBlock}</section>` : ''}

    ${bodyHtml ? `<section class="section"><div class="section-title">Fundamentaci\u00f3n detallada</div><div class="body-content">${bodyHtml}</div></section>` : ''}

    <!-- UPSELL PREMIUM -->
    <section class="section">
      <div class="upsell-card">
        <div class="upsell-icon">🔒</div>
        <div class="upsell-title">Contenido premium</div>
        <div class="upsell-heading">Informe completo \u2014 8 secciones adicionales</div>
        <div class="upsell-sub">Accede al an\u00e1lisis profundo por criterio, checklist de requisitos vs bases y presupuesto recomendado.</div>
        <ul class="upsell-features">
          <li>An\u00e1lisis de mercado, competencia e I+D</li>
          <li>Evaluaci\u00f3n de equipo, capacidades y metodolog\u00eda</li>
          <li>Presupuesto recomendado con % por partida</li>
          <li>Checklist de requisitos vs bases oficiales</li>
          <li>Comparativa, IP y continuidad estrat\u00e9gica</li>
        </ul>
        <div class="upsell-btns">
          <a href="${ZENTI_LINK_PREMIUM_USD}" class="btn-usd">Desbloquear \u2014 $89 USD</a>
          <a href="${ZENTI_LINK_PREMIUM_CLP}" class="btn-clp">Chile: $80.000 CLP</a>
        </div>
      </div>
    </section>

    <!-- RESOLUCIÓN -->
    <section class="section">
      <div class="section-title">Resoluci\u00f3n del comit\u00e9 evaluador</div>
      <div class="resolution">
        <div class="resolution-header">
          <span class="res-dot" style="background:${probColor}"></span>
          Dictamen t\u00e9cnico
        </div>
        <div class="resolution-body">
          <div class="resolution-row">
            <div class="resolution-label">Decisi\u00f3n</div>
            <div class="resolution-value resolution-decision" style="color:${probColor}">${esc(probLabel)}</div>
          </div>
          <div class="resolution-row">
            <div class="resolution-label">Fundamento</div>
            <div class="resolution-value">${boldify(esc(metrics.justificacion || metrics.resumen || ''))}</div>
          </div>
          <div class="resolution-row">
            <div class="resolution-label">Condiciones para reconsideraci\u00f3n</div>
            <div class="resolution-value">${
              probVal >= 60
              ? 'El proyecto presenta bases s\u00f3lidas. Abordar las brechas identificadas para consolidar la posici\u00f3n competitiva antes de la postulaci\u00f3n formal.'
              : probVal >= 35
              ? 'Resolver las brechas cr\u00edticas de prioridad alta antes de la presentaci\u00f3n formal. Se recomienda una segunda iteraci\u00f3n del documento de postulaci\u00f3n.'
              : 'Reformular los aspectos estructurales se\u00f1alados en el diagn\u00f3stico. Revisar el planteamiento t\u00e9cnico-metodol\u00f3gico y la propuesta de valor antes de una nueva evaluaci\u00f3n.'
            }</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONSULTORÍA CTA -->
    <section class="section">
      <div class="section-title">Consultor\u00eda estrat\u00e9gica</div>
      <div class="consultoria-cta">
        <p style="font-size:15px;color:var(--z-gray-700);margin:0 0 16px">\u00bfNecesita apoyo para fortalecer la postulaci\u00f3n? El equipo ZENTI puede trabajar las brechas y estructurar una propuesta competitiva.</p>
        <a href="https://calendly.com/diego-zentigrants/consultoria-estrategica-zenti" style="display:inline-block;padding:13px 32px;background:var(--z-orange);color:#fff;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">Agendar sesi\u00f3n de consultor\u00eda \u2014 $197 USD</a>
      </div>
    </section>

    <footer class="report-footer">
      <span class="footer-brand">ZENTI<span>.</span></span> &middot; Evaluaci\u00f3n t\u00e9cnico-estrat\u00e9gica de postulaciones a fondos de innovaci\u00f3n, I+D+i y emprendimiento.<br/>
      <span style="color:var(--z-gray-400);font-size:11px">Generado el ${esc(fecha)}. Simulaci\u00f3n orientativa. No constituye evaluaci\u00f3n oficial del organismo otorgante.</span>
    </footer>

  </div>

  ${gaugeScript}
</body>
</html>`;

return [{ json: { html } }];
