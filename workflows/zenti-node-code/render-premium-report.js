/**
 * Nodo: 🖥️ Render Premium Report
 *
 * Renders the ZENTI Premium Report as styled HTML.
 * Reads:
 *   - Free report data from 📦 Consolidar (metrics, scoreRows, hallazgos, etc.)
 *   - Premium LLM output (markdown text with 6 premium sections)
 *
 * Combines free sections (cover, resultado, juicio, diagnóstico) with
 * premium sections (per-criterion analysis, checklist, budget, comparative,
 * IP strategy, writing recommendations).
 *
 * Design: ZENTI tokens, Inter font, print-friendly, 8-12 pages.
 */
const consolidar = $('📦 Consolidar').first().json;
const premiumInput = $input.first().json;

const premiumText = premiumInput.text
  || premiumInput.response
  || premiumInput.output
  || premiumInput.content
  || String(premiumInput.message || '');

/* ── Free report data (from Consolidar) ── */

const metrics         = consolidar.metrics        || {};
const scoreRows       = consolidar.scoreRows      || [];
const hallazgos       = consolidar.hallazgos      || [];
const recomendaciones = consolidar.recomendaciones || [];

const fecha    = (consolidar.generado_en || consolidar.timestamp || new Date().toISOString()).slice(0, 10);
const proyecto = consolidar.nombre  || 'Proyecto';
const empresa  = consolidar.empresa || '';
const fondo    = consolidar.fondo   || '';
const trl      = consolidar.trl     || '';

/* ══════════════════════════════════════════════════════════
   UTILITIES
   ══════════════════════════════════════════════════════════ */

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function boldify(html) {
  return html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function norm(s) {
  let t = String(s || '');
  t = t.replace(/\ufffd/g, '');
  [
    ['Ã¡','á'],['Ã©','é'],['Ã­','í'],['Ã³','ó'],['Ãº','ú'],['Ã±','ñ'],
    ['Ã¼','ü'],['â\u0080\u0094','—'],['â\u0080\u0093','–'],
    ['â\u0080\u009c','"'],['â\u0080\u009d','"'],['â\u0080\u0099','\u2019'],
  ].forEach(([b, g]) => { t = t.split(b).join(g); });
  return t;
}

/* ── Markdown → HTML (enhanced for tables) ── */

function mdToHtml(text) {
  if (!text) return '';
  const normalized = norm(text);
  const lines = normalized.split('\n');
  const out = [];
  let inUl = false, inOl = false, inP = false, inTable = false, inThead = false;

  const closeP = () => { if (inP) { out.push('</p>'); inP = false; } };
  const closeLists = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };
  const closeTable = () => {
    if (inTable) {
      if (inThead) { out.push('</thead>'); inThead = false; }
      out.push('</tbody></table></div>');
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) { closeP(); closeLists(); closeTable(); continue; }

    // Table separator row (---|---|---)
    if (/^\|?\s*[-:]+[-|\s:]+$/.test(line)) {
      if (inTable && inThead) {
        out.push('</thead><tbody>');
        inThead = false;
      }
      continue;
    }

    // Table row
    if (/^\|(.+)\|$/.test(line)) {
      closeP(); closeLists();
      const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());

      if (!inTable) {
        out.push('<div class="table-wrap"><table class="premium-table"><thead>');
        inTable = true;
        inThead = true;
        out.push('<tr>' + cells.map(c => '<th>' + boldify(esc(c)) + '</th>').join('') + '</tr>');
      } else {
        const tag = inThead ? 'th' : 'td';
        let rowHtml = '<tr>';
        for (const cell of cells) {
          let cls = '';
          const upper = cell.toUpperCase();
          if (upper === 'CUMPLE') cls = ' class="status-cumple"';
          else if (upper === 'NO CUMPLE') cls = ' class="status-no-cumple"';
          else if (upper.includes('INSUFICIENTE') || upper.includes('INFORMACIÓN INSUFICIENTE')) cls = ' class="status-insuficiente"';
          rowHtml += '<' + tag + cls + '>' + boldify(esc(cell)) + '</' + tag + '>';
        }
        rowHtml += '</tr>';
        out.push(rowHtml);
      }
      continue;
    }

    closeTable();

    let hm;
    if ((hm = line.match(/^####\s+(.+)/))) { closeP(); closeLists(); out.push('<h5 class="prem-h5">' + boldify(esc(hm[1])) + '</h5>'); continue; }
    if ((hm = line.match(/^###\s+(.+)/))) { closeP(); closeLists(); out.push('<h4 class="prem-h4">' + boldify(esc(hm[1])) + '</h4>'); continue; }
    if ((hm = line.match(/^##\s+(.+)/))) { closeP(); closeLists(); out.push('<h3 class="prem-h3">' + boldify(esc(hm[1])) + '</h3>'); continue; }
    if ((hm = line.match(/^#\s+(.+)/))) { closeP(); closeLists(); out.push('<h2 class="prem-h2">' + boldify(esc(hm[1])) + '</h2>'); continue; }

    if (/^[-*]\s+/.test(line)) {
      closeP();
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push('<li>' + boldify(esc(line.replace(/^[-*]\s+/, ''))) + '</li>');
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      closeP();
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push('<li>' + boldify(esc(line.replace(/^\d+\.\s+/, ''))) + '</li>');
      continue;
    }

    closeLists();
    if (!inP) { out.push('<p>'); inP = true; } else { out.push(' '); }
    out.push(boldify(esc(line)));
  }
  closeP(); closeLists(); closeTable();
  return out.join('\n');
}

/* ══════════════════════════════════════════════════════════
   PARSE PREMIUM SECTIONS from LLM output
   ══════════════════════════════════════════════════════════ */

function extractSection(text, headerPattern, nextHeaderPattern) {
  const re = new RegExp(headerPattern + '\\s*\\n+([\\s\\S]*?)(?=' + nextHeaderPattern + '|$)', 'i');
  const m = text.match(re);
  return m ? m[1].trim() : '';
}

const rawPremium = norm(premiumText);

const secMercado = extractSection(rawPremium,
  '##\\s*1\\.?\\s*An[aá]lisis\\s+de\\s+mercado[^\\n]*',
  '\\n##\\s*2\\.?\\s*');
const secID = extractSection(rawPremium,
  '##\\s*2\\.?\\s*Evaluaci[oó]n\\s+de\\s+I\\+D[^\\n]*',
  '\\n##\\s*3\\.?\\s*');
const secEquipo = extractSection(rawPremium,
  '##\\s*3\\.?\\s*Evaluaci[oó]n\\s+de\\s+equipo[^\\n]*',
  '\\n##\\s*4\\.?\\s*');
const secMetodologia = extractSection(rawPremium,
  '##\\s*4\\.?\\s*Metodolog[ií]a\\s+y\\s+plan\\s+de\\s+trabajo[^\\n]*',
  '\\n##\\s*5\\.?\\s*');
const secPresupuesto = extractSection(rawPremium,
  '##\\s*5\\.?\\s*Presupuesto[^\\n]*',
  '\\n##\\s*6\\.?\\s*');
const secChecklist = extractSection(rawPremium,
  '##\\s*6\\.?\\s*Checklist[^\\n]*',
  '\\n##\\s*7\\.?\\s*');
const secIP = extractSection(rawPremium,
  '##\\s*7\\.?\\s*Estrategia\\s+de\\s+protecci[oó]n\\s+IP\\s+y\\s+continuidad[^\\n]*',
  '\\n##\\s*8\\.?\\s*');
const secComparativo = extractSection(rawPremium,
  '##\\s*8\\.?\\s*Comparativa\\s+con\\s+proyectos[^\\n]*',
  '\\n##\\s*9\\.?\\s*');
const secRedaccion = extractSection(rawPremium,
  '##\\s*9\\.?\\s*Recomendaciones\\s+de\\s+Redacci[oó]n[^\\n]*',
  '\\n##\\s*10\\.?\\s*');

/* ══════════════════════════════════════════════════════════
   FREE REPORT BLOCKS (same as render-html-premium.js)
   ══════════════════════════════════════════════════════════ */

/* Scorecard */
let scorecardBlock = '';
if (scoreRows.length) {
  const trs = scoreRows.map(r => {
    const ratio = r.nota / (r.max || 5);
    const cls = ratio >= 0.6 ? 'hi' : ratio >= 0.4 ? 'md' : 'lo';
    return '<tr><td class="sc-name">' + esc(r.criterio) + '</td><td class="sc-score"><span class="pill ' + cls + '">' + r.nota + '<span class="pill-max">/' + r.max + '</span></span></td><td class="sc-read">' + boldify(esc(r.lectura)) + '</td></tr>';
  }).join('');
  scorecardBlock = '<table class="scorecard"><thead><tr><th>Criterio</th><th>Nota</th><th>Lectura ejecutiva</th></tr></thead><tbody>' + trs + '</tbody></table>';
} else {
  scorecardBlock = '<p class="quiet">Diagnóstico detallado en la fundamentación a continuación.</p>';
}

/* Hallazgos */
let hallazgosBlock = '';
if (hallazgos.length) {
  hallazgosBlock = '<ul class="finding-list">' + hallazgos.map(h => '<li>' + boldify(esc(h)) + '</li>').join('') + '</ul>';
}

/* Recomendaciones */
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

/* Resolución */
const probLabel = metrics.probabilidad >= 60
  ? 'Favorable con observaciones'
  : metrics.probabilidad >= 35
  ? 'Condicionada a mejoras sustantivas'
  : 'No favorable en estado actual';
const probColor = metrics.probabilidad >= 60 ? '#16a34a' : metrics.probabilidad >= 35 ? '#d97706' : '#dc2626';

/* ══════════════════════════════════════════════════════════
   PREMIUM SECTION BUILDERS
   ══════════════════════════════════════════════════════════ */

function buildPremiumSection(title, sectionNumber, content, iconSvg) {
  if (!content) return '';
  return `
    <section class="section premium-section">
      <div class="premium-section-header">
        <span class="premium-section-number">${sectionNumber}</span>
        <div class="section-title premium-title">${esc(title)}</div>
      </div>
      <div class="premium-content body-content">
        ${mdToHtml(content)}
      </div>
    </section>`;
}

const premMercado     = buildPremiumSection('Análisis de mercado y competencia', '01', secMercado);
const premID          = buildPremiumSection('Evaluación de I+D y componente técnico', '02', secID);
const premEquipo      = buildPremiumSection('Evaluación de equipo y capacidades', '03', secEquipo);
const premMetodologia = buildPremiumSection('Metodología y plan de trabajo', '04', secMetodologia);
const premPresupuesto = buildPremiumSection('Presupuesto recomendado', '05', secPresupuesto);
const premChecklist   = buildPremiumSection('Checklist de requisitos vs bases oficiales', '06', secChecklist);
const premIP          = buildPremiumSection('Estrategia de protección IP y continuidad', '07', secIP);
const premComparativo = buildPremiumSection('Comparativa con proyectos aprobados/rechazados similares', '08', secComparativo);
const premRedaccion   = buildPremiumSection('Recomendaciones de redacción', '09', secRedaccion);

const premiumSectionStatus = [
  ['mercado', !!secMercado],
  ['id_tecnico', !!secID],
  ['equipo', !!secEquipo],
  ['metodologia', !!secMetodologia],
  ['presupuesto', !!secPresupuesto],
  ['checklist', !!secChecklist],
  ['ip_continuidad', !!secIP],
  ['comparativa', !!secComparativo],
  ['redaccion', !!secRedaccion],
];
const premiumSectionsFound = premiumSectionStatus.filter(([, ok]) => ok).map(([name]) => name);
const premiumMissingSections = premiumSectionStatus.filter(([, ok]) => !ok).map(([name]) => name);

/* ══════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════ */

const css = `
:root{--z-black:#111111;--z-orange:#F26C22;--z-gray-700:#444444;--z-gray-500:#6B7280;--z-gray-400:#9CA3AF;--z-gray-200:#E5E7EB;--z-gray-100:#F3F4F6;--z-border:#E5E7EB;--z-white:#FFFFFF;--z-green:#16a34a;--z-red:#dc2626;--z-amber:#d97706;--z-font:'Inter',ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;--z-max-w:780px;--z-radius:10px}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:15px}
body{font-family:var(--z-font);color:var(--z-black);background:var(--z-white);line-height:1.7;-webkit-font-smoothing:antialiased}

.report{max-width:var(--z-max-w);margin:0 auto;padding:64px 44px 80px}

/* Cover */
.cover{margin-bottom:64px}
.wordmark{font-size:12px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:var(--z-gray-400)}
.premium-badge{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--z-orange);border:1.5px solid var(--z-orange);border-radius:4px;padding:3px 10px;margin-left:12px;vertical-align:middle}
.accent-line{border:none;height:2px;background:var(--z-orange);width:40px;margin:24px 0 32px}
.cover h1{font-size:28px;font-weight:800;line-height:1.12;letter-spacing:-0.025em;color:var(--z-black);margin-bottom:8px}
.cover-sub{font-size:15px;color:var(--z-gray-500);margin-bottom:32px;font-weight:400}
.cover-meta{font-size:13px;color:var(--z-gray-500);line-height:2.2}
.cover-meta strong{color:var(--z-black);font-weight:600}

/* Sections */
.section{margin-bottom:56px}
.section-title{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--z-gray-400);margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid var(--z-gray-200)}

/* Premium section header */
.premium-section{border-top:2px solid var(--z-orange);padding-top:8px}
.premium-section-header{display:flex;align-items:baseline;gap:14px;margin-bottom:24px}
.premium-section-number{font-size:28px;font-weight:800;color:var(--z-orange);opacity:.35;line-height:1;font-variant-numeric:tabular-nums}
.premium-title{border-bottom:none;padding-bottom:0;margin-bottom:0;color:var(--z-black);font-size:12px}

/* Premium divider */
.premium-divider{margin:48px 0 40px;text-align:center;position:relative}
.premium-divider::before{content:'';position:absolute;left:0;right:0;top:50%;height:1px;background:var(--z-orange);opacity:.25}
.premium-divider-label{position:relative;display:inline-block;background:var(--z-white);padding:0 20px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--z-orange)}

/* Result card */
.result-card{background:var(--z-gray-100);border:1px solid var(--z-gray-200);border-radius:var(--z-radius);padding:36px 40px;display:flex;gap:40px;flex-wrap:wrap}
.result-item{flex:1 1 200px;min-width:160px}
.result-label{display:block;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--z-gray-400);margin-bottom:10px}
.result-value{font-size:22px;font-weight:700;color:var(--z-black);line-height:1.2}
.result-value.accent{color:var(--z-orange)}
.result-value-sm{font-size:15px;font-weight:600;color:var(--z-black);line-height:1.45}
.prob-track{height:5px;background:var(--z-gray-200);border-radius:3px;overflow:hidden;margin-top:14px}
.prob-fill{height:100%;background:var(--z-orange);border-radius:3px}

/* Judgment */
.judgment{border:1px solid var(--z-gray-200);border-left:4px solid var(--z-orange);border-radius:var(--z-radius);padding:28px 32px;font-size:15px;color:var(--z-gray-700);line-height:1.8}
.judgment strong{color:var(--z-black)}

/* Scorecard */
.scorecard{width:100%;border-collapse:collapse;font-size:14px}
.scorecard th{text-align:left;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--z-gray-400);padding:14px 16px;border-bottom:2px solid var(--z-gray-200)}
.scorecard td{padding:18px 16px;border-bottom:1px solid var(--z-gray-100);vertical-align:top}
.scorecard tr:last-child td{border-bottom:none}
.sc-name{font-weight:600;color:var(--z-black);white-space:nowrap}
.sc-read{color:var(--z-gray-700);line-height:1.6}
.pill{display:inline-block;font-weight:700;font-size:15px;padding:2px 0;white-space:nowrap}
.pill-max{font-weight:400;font-size:12px;color:var(--z-gray-400);margin-left:2px}
.pill.hi{color:var(--z-orange)}.pill.md{color:var(--z-black)}.pill.lo{color:var(--z-gray-400)}

/* Findings */
.finding-list{padding:0;list-style:none}
.finding-list li{position:relative;padding:14px 0 14px 20px;font-size:14px;color:var(--z-gray-700);line-height:1.65;border-bottom:1px solid var(--z-gray-100)}
.finding-list li:last-child{border-bottom:none}
.finding-list li::before{content:'';position:absolute;left:0;top:22px;width:6px;height:6px;border-radius:50%;background:var(--z-orange)}
.finding-list li strong{color:var(--z-black)}

/* Recomendaciones por prioridad */
.reco-tier{margin-bottom:28px}
.reco-tier:last-child{margin-bottom:0}
.reco-tier-label{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:12px;padding:6px 14px;border-radius:6px;display:inline-block}
.tier-alta .reco-tier-label{background:#FEF3EC;color:var(--z-orange)}
.tier-media .reco-tier-label{background:var(--z-gray-100);color:var(--z-gray-700)}
.tier-comp .reco-tier-label{background:var(--z-gray-100);color:var(--z-gray-400)}
.reco-tier-list{padding:0;list-style:none}
.reco-tier-list li{position:relative;padding:12px 0 12px 20px;font-size:14px;color:var(--z-gray-700);line-height:1.65;border-bottom:1px solid var(--z-gray-100)}
.reco-tier-list li:last-child{border-bottom:none}
.reco-tier-list li::before{content:'';position:absolute;left:0;top:20px;width:4px;height:4px;border-radius:50%}
.tier-alta .reco-tier-list li::before{background:var(--z-orange)}
.tier-media .reco-tier-list li::before{background:var(--z-gray-500)}
.tier-comp .reco-tier-list li::before{background:var(--z-gray-400)}
.reco-tier-list li strong{color:var(--z-black)}

/* Resolución del comité */
.resolution{border:1px solid var(--z-gray-200);border-radius:var(--z-radius);overflow:hidden}
.resolution-header{background:var(--z-black);color:var(--z-white);padding:20px 32px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
.resolution-body{padding:32px}
.resolution-row{margin-bottom:24px}
.resolution-row:last-child{margin-bottom:0}
.resolution-label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--z-gray-400);margin-bottom:8px}
.resolution-value{font-size:15px;color:var(--z-gray-700);line-height:1.7}
.resolution-value strong{color:var(--z-black)}
.resolution-decision{font-size:17px;font-weight:700;line-height:1.3}

/* ── PREMIUM TABLES ── */
.table-wrap{overflow-x:auto;margin:20px 0 28px}
.premium-table{width:100%;border-collapse:collapse;font-size:13px;line-height:1.6}
.premium-table th{text-align:left;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--z-gray-500);padding:12px 16px;border-bottom:2px solid var(--z-gray-200);background:var(--z-gray-100)}
.premium-table td{padding:14px 16px;border-bottom:1px solid var(--z-gray-100);vertical-align:top;color:var(--z-gray-700)}
.premium-table tbody tr:nth-child(even) td{background:var(--z-gray-100)}
.premium-table td:first-child{font-weight:600;color:var(--z-black)}
.premium-table strong{color:var(--z-black)}

/* Status badges */
.status-cumple{color:var(--z-green)!important;font-weight:700}
.status-no-cumple{color:var(--z-red)!important;font-weight:700}
.status-insuficiente{color:var(--z-amber)!important;font-weight:700}

/* ── PREMIUM BODY CONTENT ── */
.premium-content h2.prem-h2{font-size:18px;font-weight:700;color:var(--z-black);margin:32px 0 14px}
.premium-content h3.prem-h3{font-size:16px;font-weight:700;color:var(--z-black);margin:28px 0 12px;padding-left:16px;border-left:3px solid var(--z-orange)}
.premium-content h4.prem-h4{font-size:14px;font-weight:700;color:var(--z-black);margin:24px 0 10px}
.premium-content h5.prem-h5{font-size:13px;font-weight:700;color:var(--z-gray-700);margin:20px 0 8px}
.premium-content p{font-size:14px;color:var(--z-gray-700);line-height:1.8;margin:0 0 14px}
.premium-content ul,.premium-content ol{padding-left:22px;margin:8px 0 16px}
.premium-content li{font-size:14px;color:var(--z-gray-700);line-height:1.7;margin-bottom:6px}
.premium-content strong{color:var(--z-black)}

/* Body content (free sections) */
.body-content h3{font-size:16px;font-weight:700;color:var(--z-black);margin:36px 0 14px;padding-left:16px;border-left:3px solid var(--z-orange)}
.body-content h4{font-size:14px;font-weight:700;color:var(--z-black);margin:28px 0 10px}
.body-content p{font-size:14px;color:var(--z-gray-700);line-height:1.8;margin:0 0 16px}
.body-content ul,.body-content ol{padding-left:22px;margin:10px 0 18px}
.body-content li{font-size:14px;color:var(--z-gray-700);line-height:1.7;margin-bottom:6px}
.body-content strong{color:var(--z-black)}
.quiet{font-size:14px;color:var(--z-gray-400)}

/* Footer */
.report-footer{margin-top:64px;padding-top:24px;border-top:1px solid var(--z-gray-200);font-size:12px;color:var(--z-gray-400);line-height:1.7}
.footer-brand{font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--z-gray-500)}

/* Toolbar */
.toolbar{display:none}
.btn-pdf{padding:10px 18px;border:1px solid var(--z-gray-200);border-radius:6px;background:var(--z-white);color:var(--z-black);font-family:var(--z-font);font-size:13px;font-weight:600;cursor:pointer;transition:background .15s}
.btn-pdf:hover{background:var(--z-gray-100)}

/* Print */
@page{size:A4;margin:18mm 14mm 20mm 14mm}
@media screen{.toolbar{display:block;position:fixed;top:20px;right:20px;z-index:100}}
@media print{
  html{font-size:13px}
  body{background:#fff}
  .report{max-width:100%;padding:0}
  .toolbar{display:none!important}
  .result-card,.scorecard,.judgment,.resolution,.reco-tier,.premium-section,.premium-table{break-inside:avoid;page-break-inside:avoid}
  .section{break-inside:avoid;page-break-inside:avoid}
  .body-content h3,.body-content h4,.prem-h3,.prem-h4{page-break-after:avoid}
  .premium-section{page-break-before:auto}
  p{orphans:3;widows:3}
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .premium-divider{page-break-before:always}
}

/* Responsive */
@media(max-width:640px){
  .report{padding:36px 20px 52px}
  .cover h1{font-size:23px}
  .result-card{flex-direction:column;gap:28px;padding:28px 24px}
  .result-value{font-size:19px}
  .scorecard td,.scorecard th{padding:14px 10px;font-size:13px}
  .premium-table td,.premium-table th{padding:10px 12px;font-size:12px}
  .resolution-body{padding:24px}
  .premium-section-number{font-size:22px}
}
`;

/* ══════════════════════════════════════════════════════════
   HTML ASSEMBLY
   ══════════════════════════════════════════════════════════ */

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <title>ZENTI — Informe premium de competitividad</title>
  <style>${css}</style>
</head>
<body>

  <div class="toolbar">
    <button type="button" class="btn-pdf" onclick="window.print()">Exportar informe</button>
  </div>

  <div class="report">

    <!-- ═══ COVER ═══ -->
    <header class="cover">
      <div class="wordmark">ZENTI <span class="premium-badge">Premium</span></div>
      <hr class="accent-line" />
      <h1>Informe premium de competitividad</h1>
      <p class="cover-sub">Consultoría estratégica completa para postulación a fondos de innovación</p>
      <div class="cover-meta">
        Proyecto: <strong>${esc(proyecto)}</strong><br/>
        ${empresa ? 'Empresa: <strong>' + esc(empresa) + '</strong><br/>' : ''}
        ${fondo ? 'Instrumento: <strong>' + esc(fondo) + '</strong><br/>' : ''}
        ${trl ? 'Nivel de madurez: <strong>' + esc(trl) + '</strong><br/>' : ''}
        Fecha de emisión: <strong>${esc(fecha)}</strong>
      </div>
    </header>

    <!-- ═══ RESULTADO CONSOLIDADO ═══ -->
    <section class="section">
      <div class="section-title">Resultado consolidado</div>
      <div class="result-card">
        <div class="result-item">
          <span class="result-label">Nota final</span>
          <span class="result-value accent">${esc(metrics.notaFinal || '\u2014')}</span>
        </div>
        <div class="result-item">
          <span class="result-label">Veredicto</span>
          <span class="result-value-sm">${esc(metrics.veredicto || '\u2014')}</span>
        </div>
        <div class="result-item">
          <span class="result-label">Estimación de adjudicación</span>
          <span class="result-value accent">${metrics.probabilidad || 0}%</span>
          <div class="prob-track"><div class="prob-fill" style="width:${metrics.probabilidad || 0}%"></div></div>
        </div>
      </div>
    </section>

    <!-- ═══ JUICIO EXPERTO ═══ -->
    <section class="section">
      <div class="section-title">Juicio experto ZENTI</div>
      <div class="judgment">${boldify(esc(metrics.resumen || metrics.justificacion || ''))}</div>
    </section>

    <!-- ═══ DIAGNÓSTICO DE COMPETITIVIDAD ═══ -->
    <section class="section">
      <div class="section-title">Diagnóstico de competitividad</div>
      ${scorecardBlock}
    </section>

    <!-- ═══ BRECHAS CRÍTICAS ═══ -->
    ${hallazgosBlock ? '<section class="section"><div class="section-title">Brechas críticas de postulación</div>' + hallazgosBlock + '</section>' : ''}

    <!-- ═══ RUTA DE FORTALECIMIENTO ═══ -->
    ${recoBlock ? '<section class="section"><div class="section-title">Ruta de fortalecimiento recomendada</div>' + recoBlock + '</section>' : ''}

    <!-- ═══════════════════════════════════════════════
         PREMIUM SECTIONS
         ═══════════════════════════════════════════════ -->

    <div class="premium-divider">
      <span class="premium-divider-label">Análisis premium</span>
    </div>

    ${premMercado}
    ${premID}
    ${premEquipo}
    ${premMetodologia}
    ${premPresupuesto}
    ${premChecklist}
    ${premIP}
    ${premComparativo}
    ${premRedaccion}

    <!-- ═══ RESOLUCIÓN DEL COMITÉ ═══ -->
    <section class="section">
      <div class="section-title">Resolución del comité evaluador</div>
      <div class="resolution">
        <div class="resolution-header">Dictamen técnico</div>
        <div class="resolution-body">
          <div class="resolution-row">
            <div class="resolution-label">Decisión</div>
            <div class="resolution-value resolution-decision" style="color:${probColor}">${esc(probLabel)}</div>
          </div>
          <div class="resolution-row">
            <div class="resolution-label">Fundamento</div>
            <div class="resolution-value">${boldify(esc(metrics.justificacion || metrics.resumen || ''))}</div>
          </div>
          <div class="resolution-row">
            <div class="resolution-label">Condiciones para reconsideración</div>
            <div class="resolution-value">${metrics.probabilidad >= 60
              ? 'Abordar las brechas identificadas para consolidar la posición competitiva. El proyecto presenta bases sólidas que justifican avanzar con la postulación formal.'
              : metrics.probabilidad >= 35
              ? 'Resolver las brechas críticas de prioridad alta antes de la presentación formal. Se recomienda una segunda iteración del documento de postulación incorporando la ruta de fortalecimiento y los capítulos premium de mercado, metodología y presupuesto.'
              : 'Reformular los aspectos estructurales señalados en el diagnóstico. Se recomienda revisar el planteamiento técnico-metodológico, el enfoque comercial y la consistencia del plan de trabajo antes de una nueva evaluación.'
            }</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CONSULTORÍA ═══ -->
    <section class="section" style="margin-top:16px">
      <div class="section-title">Consultoría estratégica</div>
      <div class="judgment" style="text-align:center">
        <p style="margin:0 0 16px;font-size:15px;color:var(--z-gray-700)">¿Necesita apoyo para implementar las recomendaciones de este informe? El equipo ZENTI puede trabajar las brechas identificadas y estructurar una propuesta competitiva.</p>
        <a href="https://calendly.com/diego-zentigrants/consultoria-estrategica-zenti" style="display:inline-block;padding:12px 32px;background:var(--z-orange);color:#fff;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:.02em">Agendar sesión de consultoría — $197 USD</a>
      </div>
    </section>

    <!-- ═══ FOOTER ═══ -->
    <footer class="report-footer">
      <span class="footer-brand">ZENTI</span> &middot; Informe premium de competitividad — evaluación técnico-estratégica de postulaciones a fondos de innovación, I+D+i y emprendimiento.<br/>
      <span style="color:var(--z-gray-400);font-size:11px">Documento generado el ${esc(fecha)}. Este informe es una simulación orientativa y no constituye una evaluación oficial del organismo otorgante.</span>
    </footer>

  </div>
</body>
</html>`;

return [{ json: { html, premium_sections_found: premiumSectionsFound, premium_missing_sections: premiumMissingSections } }];
