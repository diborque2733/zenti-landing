/**
 * Nodo: Render Start Report (ZENTI.start)
 *
 * Construye informe HTML de una p\u00e1gina (premium, advisory) a partir del JSON
 * devuelto por el LLM. Si el parseo falla, usa datos del nodo Preparar + fallback sobrio.
 */
let prep = {};
try {
  prep = $('⚙️ Preparar Datos Start').first().json;
} catch (_) {
  prep = {};
}

const llm = $input.first().json;
const rawLlm = String(llm.text || llm.output || llm.response || '').trim();

function parseLlmJson(t) {
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const inner = fence ? fence[1] : t;
  try {
    return JSON.parse(inner.trim());
  } catch (_) {
    return null;
  }
}

const d = parseLlmJson(rawLlm) || {};

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const instrumento_recomendado =
  d.instrumento_recomendado || d.instrumento_prioritario || prep.heuristic_primary || 'Por definir con asesor\u00eda';
const por_que =
  d.por_que ||
  d['por_qu\u00e9'] ||
  d.justificacion_match ||
  'El modelo no devolvi\u00f3 justificaci\u00f3n estructurada; revisa el criterio del instrumento con un especialista ZENTI.';
const instrumento_alternativo =
  d.instrumento_alternativo || d.segunda_opcion || prep.heuristic_secondary || '\u2014';

let brechas = Array.isArray(d.brechas) ? d.brechas : Array.isArray(d.gap_analysis) ? d.gap_analysis : [];
if (!brechas.length) {
  brechas = [
    'Definici\u00f3n expl\u00edcita del problema y del cliente pagador (ICP).',
    'Evidencia de diferenciaci\u00f3n frente al estado del arte o alternativas sustitutas.',
    'Plan de trabajo con hitos, riesgos y m\u00e9tricas de validaci\u00f3n.',
    'Equipo, roles y trazabilidad de capacidades t\u00e9cnicas/comerciales.',
    'Modelo de sostenibilidad econ\u00f3mica alineado al instrumento objetivo.',
  ];
}

let roadmap = Array.isArray(d.roadmap) ? d.roadmap : Array.isArray(d.pasos) ? d.pasos : [];
if (!roadmap.length) {
  roadmap = [
    { prioridad: 1, titulo: 'Aterrizar problema y usuario', detalle: 'Una p\u00e1gina con dolor cuantificable y qui\u00e9n paga.' },
    { prioridad: 2, titulo: 'Estado del arte breve', detalle: '3\u20135 referencias y brecha clara vs. tu propuesta.' },
    { prioridad: 3, titulo: 'Hoja de ruta TRL / validaci\u00f3n', detalle: 'Hitos de laboratorio, piloto y escalamiento.' },
    { prioridad: 4, titulo: 'Equipo y gobernanza', detalle: 'Roles, dedicaci\u00f3n y acuerdos entre socios.' },
    { prioridad: 5, titulo: 'Matriz instrumento\u2013requisitos', detalle: 'Cotejo expl\u00edcito con bases del fondo elegido.' },
  ];
}

function normalizeRoadmapStep(x, i) {
  if (typeof x === 'string') {
    return { prioridad: i + 1, titulo: x, detalle: '' };
  }
  return {
    prioridad: Number(x.prioridad) || Number(x.paso) || i + 1,
    titulo: x.titulo || x.title || x.accion || 'Paso',
    detalle: x.detalle || x.descripcion || x.detail || '',
  };
}
roadmap = roadmap.map(normalizeRoadmapStep).sort((a, b) => a.prioridad - b.prioridad);

const fecha = (prep.timestamp || new Date().toISOString()).slice(0, 10);
const email = prep.email || '';
const sector = prep.sector || '\u2014';
const etapa = prep.etapa || '\u2014';
const ideaCorta = (prep.idea || '').slice(0, 280).replace(/\s+/g, ' ').trim();
const CTA_URL = 'https://cal.com/zenti';

const brechasLi = brechas
  .slice(0, 7)
  .map(b => '<li>' + esc(typeof b === 'string' ? b : b.texto || b.descripcion || JSON.stringify(b)) + '</li>')
  .join('');

const roadmapOl = roadmap
  .slice(0, 9)
  .map(
    r =>
      '<li><span class="rm-p">' +
      esc(String(r.prioridad)) +
      '</span><div class="rm-body"><strong>' +
      esc(r.titulo) +
      '</strong>' +
      (r.detalle ? '<div class="rm-sub">' + esc(r.detalle) + '</div>' : '') +
      '</div></li>'
  )
  .join('');

const html =
  '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>' +
  '<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>' +
  '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>' +
  '<title>ZENTI.start \u2014 Diagn\u00f3stico</title>' +
  '<style>' +
  ':root{--z-black:#111111;--z-orange:#F26C22;--z-gray-100:#F3F4F6;--z-border:#E5E7EB;--z-muted:#444444}' +
  'body{margin:0;font-family:Inter,system-ui,sans-serif;color:var(--z-black);background:var(--z-gray-100);line-height:1.55}' +
  '.wrap{max-width:720px;margin:0 auto;padding:40px 28px 48px;background:#fff;border-left:4px solid var(--z-orange)}' +
  '.wordmark{font-weight:700;font-size:22px;letter-spacing:.04em;color:var(--z-black)}' +
  '.tagline{font-size:13px;color:var(--z-muted);margin-top:6px;max-width:520px}' +
  '.rule{height:3px;background:var(--z-orange);margin:22px 0 28px;max-width:120px}' +
  '.meta{font-size:12px;color:var(--z-muted);margin-bottom:28px}' +
  '.card{border:1px solid var(--z-border);border-radius:10px;padding:22px 22px 20px;background:var(--z-gray-100);' +
  'border-left:4px solid var(--z-orange)}' +
  '.card h2{margin:0 0 10px;font-size:15px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--z-muted)}' +
  '.fund{font-size:20px;font-weight:700;color:var(--z-black);margin-bottom:12px}' +
  '.why{font-size:14px;color:#1f2937}' +
  '.alt{font-size:13px;color:var(--z-muted);margin-top:14px;padding-top:14px;border-top:1px solid var(--z-border)}' +
  'section{margin-top:32px}' +
  'section h3{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--z-muted);margin:0 0 14px}' +
  '.bullets{margin:0;padding-left:20px;font-size:14px;color:#1f2937}' +
  '.bullets li{margin-bottom:8px}' +
  '.roadmap{list-style:none;margin:0;padding:0}' +
  '.roadmap li{display:flex;gap:14px;align-items:flex-start;padding:14px 0;border-bottom:1px solid var(--z-border);font-size:14px}' +
  '.roadmap li:last-child{border-bottom:none}' +
  '.rm-p{flex:0 0 28px;height:28px;border-radius:8px;background:var(--z-black);color:#fff;font-weight:600;font-size:13px;' +
  'display:flex;align-items:center;justify-content:center}' +
  '.rm-sub{margin-top:6px;font-size:13px;color:var(--z-muted);font-weight:400}' +
  '.cta{margin-top:36px;padding:22px;border:1px solid var(--z-border);border-radius:10px;text-align:center;background:#fafafa}' +
  '.cta a{display:inline-block;margin-top:10px;padding:12px 26px;background:var(--z-orange);color:#fff;text-decoration:none;' +
  'font-weight:600;font-size:14px;border-radius:8px}' +
  '.footer{margin-top:40px;padding-top:22px;border-top:1px solid var(--z-border);font-size:11px;color:var(--z-muted);line-height:1.6}' +
  '</style></head><body><div class="wrap">' +
  '<div class="wordmark">ZENTI</div>' +
  '<div class="tagline">Diagn\u00f3stico de viabilidad y match de instrumento</div>' +
  '<div class="rule"></div>' +
  '<div class="meta">Fecha: ' +
  esc(fecha) +
  ' \u00b7 Sector: ' +
  esc(sector) +
  ' \u00b7 Etapa: ' +
  esc(etapa) +
  (ideaCorta ? '<br/><span style="opacity:.85">S\u00edntesis de la idea:</span> ' + esc(ideaCorta) + (prep.idea && prep.idea.length > 280 ? '\u2026' : '') : '') +
  '</div>' +
  '<div class="card"><h2>Resultado de match</h2>' +
  '<div class="fund">' +
  esc(instrumento_recomendado) +
  '</div>' +
  '<div class="why">' +
  esc(por_que) +
  '</div>' +
  '<div class="alt"><strong>Segunda opci\u00f3n</strong> \u2014 ' +
  esc(instrumento_alternativo) +
  '</div></div>' +
  '<section><h3>An\u00e1lisis de brechas</h3><ul class="bullets">' +
  brechasLi +
  '</ul></section>' +
  '<section><h3>Ruta para construir la postulaci\u00f3n</h3><ol class="roadmap">' +
  roadmapOl +
  '</ol></section>' +
  '<div class="cta"><div style="font-size:15px;font-weight:600;color:var(--z-black)">\u00bfQuieres ordenar la postulaci\u00f3n con un experto?</div>' +
  '<a href="' +
  esc(CTA_URL) +
  '" target="_blank" rel="noopener noreferrer">Agenda una sesi\u00f3n de estructuraci\u00f3n</a></div>' +
  '<div class="footer">' +
  '<strong>ZENTI</strong> \u2014 plataforma de inteligencia para innovaci\u00f3n y fondos p\u00fablicos.<br/>' +
  'Este documento es orientativo y no constituye asesor\u00eda legal ni garant\u00eda de adjudicaci\u00f3n. ' +
  'Las bases oficiales de cada instrumento prevalecen siempre.' +
  '</div></div></body></html>';

const email_subject =
  'ZENTI.start \u2014 Tu match de instrumento y ruta sugerida (' + fecha + ')';

return [
  {
    json: {
      html,
      email_subject,
      email,
      instrumento_recomendado,
      instrumento_alternativo,
      por_que,
      brechas: brechas.slice(0, 7).map(b => typeof b === 'string' ? b : b.texto || b.descripcion || String(b)),
      roadmap: roadmap.slice(0, 7),
      sector,
      etapa,
      fecha,
    },
  },
];
