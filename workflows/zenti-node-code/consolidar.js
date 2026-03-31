/**
 * Nodo: 📦 Consolidar
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │ DATA MODEL — extracción y estructuración del informe ZENTI  │
 * │                                                              │
 * │ Nodos downstream (render, email) reciben datos estructurados.│
 * │ Ningún nodo posterior parsea reporte_final.                  │
 * │                                                              │
 * │ SSOT: metrics (resultado consolidado), scoreRows             │
 * │       (diagnóstico de competitividad), hallazgos (brechas),  │
 * │       recomendaciones (ruta de fortalecimiento), bodyText.   │
 * └──────────────────────────────────────────────────────────────┘
 */
const preparar = $('⚙️ Preparar Datos').first().json;
const llmOutput = $input.first().json;

/* ═══════════════════════════════════════════════════════════
   1. UTILIDADES (canónicas — no se repiten en render ni email)
   ═══════════════════════════════════════════════════════════ */

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

function pick(text, re, fallback) {
  const m = text.match(re);
  return m && m[1] ? norm(m[1]).trim() : (fallback || '');
}

/* ═══════════════════════════════════════════════════════════
   2. RAW TEXT
   ═══════════════════════════════════════════════════════════ */

const reporte_final = norm(
  llmOutput.text ||
  llmOutput.response ||
  llmOutput.output ||
  llmOutput.content ||
  String(llmOutput.message || ''),
);

/* ═══════════════════════════════════════════════════════════
   3. RESULTADO CONSOLIDADO — FUENTE ÚNICA DE VERDAD
   ═══════════════════════════════════════════════════════════ */

let probNum = parseInt(
  pick(reporte_final, /\*\*Probabilidad[^*\n]*adjudicaci[oó]n[^*\n]*\*\*[:\s]*(\d{1,3})\s*%/i) ||
  pick(reporte_final, /Probabilidad[^%\n]*?(\d{1,3})\s*%/i) ||
  pick(reporte_final, /(\d{1,3})\s*%/),
  10,
);
if (Number.isNaN(probNum)) probNum = 0;
probNum = Math.max(0, Math.min(100, probNum));

function clean(s) {
  return String(s || '').replace(/\*\*/g, '').replace(/\s{2,}/g, ' ').replace(/^[:\s-–—]+/, '').trim();
}

const metrics = {
  notaFinal: clean(
    pick(reporte_final, /\*\*Nota final\*\*[:\s]*([^\n]+)/i) ||
    pick(reporte_final, /Nota final[:\s]*([^\n]+)/i)
  ) || '\u2014',
  veredicto: clean(
    pick(reporte_final, /\*\*Veredicto\*\*[:\s]*([^\n]+)/i) ||
    pick(reporte_final, /-\s*\*\*Veredicto\*\*[:\s]*([^\n]+)/i) ||
    pick(reporte_final, /Veredicto[:\s]*([^\n]+)/i)
  ) || '\u2014',
  probabilidad: probNum,
  justificacion: clean(
    pick(reporte_final, /\*\*Justificaci[oó]n breve\*\*[:\s]*([^\n]+)/i) ||
    pick(reporte_final, /Justificaci[oó]n breve[:\s]*([^\n]+)/i)
  ),
  resumen: '',
};

let resumenRaw = pick(
  reporte_final,
  /^##\s*Resumen[^\n]*\n+([\s\S]*?)(?=\n##|\n\*\*Veredicto|\n\*\*Nota|\n\*\*Probabilidad|$)/im,
);
if (!resumenRaw || resumenRaw.length < 40) {
  resumenRaw = [metrics.justificacion, metrics.veredicto]
    .filter(Boolean)
    .join('. ')
    .replace(/\.\s*\./g, '.');
}
metrics.resumen = clean(resumenRaw.replace(/\n+/g, ' ')).slice(0, 1200);

/* ═══════════════════════════════════════════════════════════
   4. DIAGNÓSTICO DE COMPETITIVIDAD
   ═══════════════════════════════════════════════════════════ */

const scoreRows = [];
const reScore = /^\*\*([^*]+)\*\*[:\s]*([\d.]+)\s*\/\s*([\d.]+)\s*(.*)/gm;
let sm;
while ((sm = reScore.exec(reporte_final)) !== null) {
  const name = sm[1].trim();
  if (/^(veredicto|nota final|probabilidad|justificaci)/i.test(name)) continue;
  scoreRows.push({
    criterio: norm(name),
    nota: parseFloat(sm[2]),
    max: parseFloat(sm[3]),
    lectura: norm((sm[4] || '').replace(/^[-–—:.\s]+/, '').replace(/\*\*/g, '')).trim()
      || 'Consultar fundamentaci\u00f3n detallada.',
  });
  if (scoreRows.length >= 12) break;
}

/* ═══════════════════════════════════════════════════════════
   5. BRECHAS CRÍTICAS DE POSTULACIÓN
   ═══════════════════════════════════════════════════════════ */

const debSection =
  pick(reporte_final, /##\s*Debilidades[^\n]*\n+([\s\S]*?)(?=\n##|$)/i) ||
  pick(reporte_final, /##\s*Riesgos[^\n]*\n+([\s\S]*?)(?=\n##|$)/i) ||
  pick(reporte_final, /##\s*Brechas[^\n]*\n+([\s\S]*?)(?=\n##|$)/i) ||
  '';
const hallazgos = debSection
  .split('\n')
  .map(l => l.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').trim())
  .filter(l => l.length > 8)
  .slice(0, 8);

/* ═══════════════════════════════════════════════════════════
   6. RUTA DE FORTALECIMIENTO
   ═══════════════════════════════════════════════════════════ */

const recoSection =
  pick(reporte_final, /##\s*Recomendaciones[^\n]*\n+([\s\S]*?)(?=\n##|$)/i) || '';
const recomendaciones = recoSection
  .split('\n')
  .map(l => l.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').trim())
  .filter(l => l.length > 8)
  .slice(0, 12);

/* ═══════════════════════════════════════════════════════════
   7. FUNDAMENTACIÓN DETALLADA (body sin secciones ya extraídas)
   ═══════════════════════════════════════════════════════════ */

let bodyText = reporte_final;
bodyText = bodyText.replace(/^[-*]?\s*\*\*Veredicto\*\*[^\n]*/gm, '');
bodyText = bodyText.replace(/^[-*]?\s*\*\*Nota final\*\*[^\n]*/gm, '');
bodyText = bodyText.replace(/^[-*]?\s*\*\*Probabilidad[^\n]*/gm, '');
bodyText = bodyText.replace(/^[-*]?\s*\*\*Justificaci[oó]n breve\*\*[^\n]*/gm, '');
bodyText = bodyText.replace(/^\*\*[^*]+\*\*[:\s]*[\d.]+\s*\/\s*[\d.]+[^\n]*/gm, '');
bodyText = bodyText.replace(/##\s*Debilidades[^\n]*\n[\s\S]*?(?=\n##|$)/gi, '');
bodyText = bodyText.replace(/##\s*Riesgos[^\n]*\n[\s\S]*?(?=\n##|$)/gi, '');
bodyText = bodyText.replace(/##\s*Brechas[^\n]*\n[\s\S]*?(?=\n##|$)/gi, '');
bodyText = bodyText.replace(/##\s*Recomendaciones[^\n]*\n[\s\S]*?(?=\n##|$)/gi, '');
bodyText = bodyText.replace(/##\s*Resumen[^\n]*\n[\s\S]*?(?=\n##|$)/gi, '');
bodyText = bodyText.replace(/^#\s+[^\n]+/m, '');
bodyText = bodyText.replace(/\n{3,}/g, '\n\n').trim();

/* ═══════════════════════════════════════════════════════════
   8. METADATA
   ═══════════════════════════════════════════════════════════ */

const nombre = preparar.nombre || '';
const empresa = preparar.empresa || '';
const fondo = preparar.fondo || '';
const trl = preparar.trl || '';
const email = preparar.email || '';
const fuente_propuesta = preparar.fuente_propuesta || '';
const config = preparar.config || {};
const tier = preparar.tier === 'premium' ? 'premium' : 'free';
const generado_en = new Date().toISOString();

const baseUrl = 'https://zenti.app.n8n.cloud/webhook/zenti-eval-open';
const qs = [
  'nombre=' + encodeURIComponent(nombre),
  'empresa=' + encodeURIComponent(empresa),
  'fondo=' + encodeURIComponent(fondo),
  'trl=' + encodeURIComponent(trl),
].join('&');

return [
  {
    json: {
      nombre,
      empresa,
      fondo,
      trl,
      email,
      fuente_propuesta,
      config,
      tier,
      reporte_final,
      generado_en,
      timestamp: generado_en,
      link_vista_previa_get: baseUrl + '?' + qs,

      // ── Pre-parsed data (SSOT) ──
      metrics,
      scoreRows,
      hallazgos,
      recomendaciones,
      bodyText: bodyText.length > 60 ? bodyText : '',
    },
  },
];
