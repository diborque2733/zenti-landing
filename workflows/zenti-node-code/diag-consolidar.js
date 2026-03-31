/**
 * Nodo: 📦 Consolidar Diagnóstico
 *
 * Recibe outputs de Fase Problem y Fase Solution, los parsea
 * y genera un objeto estructurado que alimenta:
 *   - Render HTML (reporte)
 *   - Downstream modules (research, market, framework)
 *   - Email delivery
 *
 * SSOT: problemData, solutionData, diagnostico, fortalezas, brechas
 */
const preparar = $('⚙️ Preparar Datos Diag').first().json;
const problemRaw = $('🔍 Fase Problem').first().json;
const solutionRaw = $input.first().json;

/* ═══════════════════════════════════════════════════════════
   1. UTILIDADES
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

function extractSection(text, heading, nextHeading) {
  const pattern = nextHeading
    ? new RegExp(`##\\s*${heading}[^\\n]*\\n+([\\s\\S]*?)(?=\\n##\\s*${nextHeading}|$)`, 'i')
    : new RegExp(`##\\s*${heading}[^\\n]*\\n+([\\s\\S]*?)(?=\\n##|$)`, 'i');
  return pick(text, pattern);
}

function extractList(text) {
  return text
    .split('\n')
    .map(l => l.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').trim())
    .filter(l => l.length > 8);
}

/* ═══════════════════════════════════════════════════════════
   2. RAW TEXT
   ═══════════════════════════════════════════════════════════ */

const problemText = norm(
  problemRaw.text || problemRaw.response || problemRaw.output ||
  problemRaw.content || String(problemRaw.message || ''),
);
const solutionText = norm(
  solutionRaw.text || solutionRaw.response || solutionRaw.output ||
  solutionRaw.content || String(solutionRaw.message || ''),
);

const fullText = problemText + '\n\n' + solutionText;

/* ═══════════════════════════════════════════════════════════
   3. PROBLEM DATA — extraer secciones de Fase Problem
   ═══════════════════════════════════════════════════════════ */

const problemStatement =
  extractSection(problemText, 'Problem Statement', 'Pain') ||
  extractSection(problemText, 'Definici.n del Problema', '') ||
  pick(problemText, /problem statement[:\s]*"?([^"]+)"?/i) ||
  pick(problemText, /^(.+?\.)/, '').slice(0, 500);

const painQuantification =
  extractSection(problemText, 'Pain|Cuantificaci', 'Root Cause|Causa') ||
  extractSection(problemText, 'Quantification|Cuantificaci', '');

const rootCause =
  extractSection(problemText, 'Root Cause|Causa Ra', 'Innovation|Brecha') ||
  extractSection(problemText, 'An.lisis.*Causa', '');

const innovationGap =
  extractSection(problemText, 'Innovation Gap|Brecha', '') ||
  extractSection(problemText, 'Brecha de Innovaci', '');

const trlAnalysis =
  pick(problemText, /TRL\s*(?:Start|Inicio)[:\s]*(.+?)(?:\n|TRL\s*(?:End|Final))/i) ||
  pick(problemText, /TRL[:\s]*(\d[^.\n]*)/i);

/* ═══════════════════════════════════════════════════════════
   4. SOLUTION DATA — extraer secciones de Fase Solution
   ═══════════════════════════════════════════════════════════ */

const solutionDefinition =
  extractSection(solutionText, 'Solution|Definici.n de la Soluci', 'Defensibility|Defensabilidad') ||
  pick(solutionText, /solution statement[:\s]*"?([^"]+)"?/i);

const defensibility =
  extractSection(solutionText, 'Defensibility|Defensabilidad|Ventaja', 'GN1|Narrativa') ||
  extractSection(solutionText, 'Moat|Barrera', '');

const gn1Narrative =
  extractSection(solutionText, 'GN1|Narrativa.*Apertura|Opening', '') ||
  extractSection(solutionText, 'P.rrafo.*Apertura', '');

const differentiators = [];
const diffRe = /(?:diferenciador|differentiator|punto\s+diferencial)[:\s]*([^\n]+)/gi;
let dm;
while ((dm = diffRe.exec(solutionText)) !== null && differentiators.length < 5) {
  differentiators.push(norm(dm[1].trim()));
}

/* ═══════════════════════════════════════════════════════════
   5. DIAGNÓSTICO CONSOLIDADO
   ═══════════════════════════════════════════════════════════ */

const diagnosticoAreas = [
  { area: 'Problem Statement', status: problemStatement.length > 50 ? 'completo' : 'débil', content: problemStatement.slice(0, 300) },
  { area: 'Cuantificación del Dolor', status: painQuantification.length > 50 ? 'completo' : 'débil', content: painQuantification.slice(0, 300) },
  { area: 'Causa Raíz', status: rootCause.length > 50 ? 'completo' : 'débil', content: rootCause.slice(0, 300) },
  { area: 'Brecha de Innovación', status: innovationGap.length > 50 ? 'completo' : 'débil', content: innovationGap.slice(0, 300) },
  { area: 'Definición de Solución', status: solutionDefinition.length > 50 ? 'completo' : 'débil', content: solutionDefinition.slice(0, 300) },
  { area: 'Defensabilidad', status: defensibility.length > 50 ? 'completo' : 'débil', content: defensibility.slice(0, 300) },
  { area: 'Narrativa GN1', status: gn1Narrative.length > 100 ? 'completo' : 'débil', content: gn1Narrative.slice(0, 300) },
];

const completos = diagnosticoAreas.filter(a => a.status === 'completo').length;
const total = diagnosticoAreas.length;
const completitud = Math.round((completos / total) * 100);

const fortalezas = diagnosticoAreas
  .filter(a => a.status === 'completo')
  .map(a => a.area);

const brechas = diagnosticoAreas
  .filter(a => a.status === 'débil')
  .map(a => `${a.area}: requiere mayor desarrollo y evidencia`);

/* ═══════════════════════════════════════════════════════════
   6. RECOMENDACIONES
   ═══════════════════════════════════════════════════════════ */

const recoSection =
  extractSection(solutionText, 'Recomendaciones|Recommendations|Pr.ximos', '') ||
  extractSection(problemText, 'Recomendaciones|Recommendations', '');
const recomendaciones = extractList(recoSection).slice(0, 8);

if (recomendaciones.length === 0 && brechas.length > 0) {
  brechas.forEach(b => {
    recomendaciones.push(`Fortalecer: ${b}`);
  });
}

/* ═══════════════════════════════════════════════════════════
   7. METADATA
   ═══════════════════════════════════════════════════════════ */

const generado_en = new Date().toISOString();

return [
  {
    json: {
      nombre: preparar.nombre || '',
      empresa: preparar.empresa || '',
      sector: preparar.sector || '',
      fondo: preparar.fondo || '',
      trl: preparar.trl || '',
      email: preparar.email || '',
      fuente: preparar.fuente || '',
      fondo_context: preparar.fondo_context || {},
      generado_en,
      timestamp: generado_en,

      // Texts (for downstream modules: research, market, framework)
      problem_statement: problemStatement,
      pain_quantification: painQuantification,
      root_cause: rootCause,
      innovation_gap: innovationGap,
      trl_analysis: trlAnalysis,
      solution_definition: solutionDefinition,
      defensibility,
      gn1_narrative: gn1Narrative,
      differentiators,

      // Full texts (for render)
      problem_full: problemText,
      solution_full: solutionText,

      // Structured diagnostic
      diagnostico: diagnosticoAreas,
      completitud,
      fortalezas,
      brechas,
      recomendaciones,
    },
  },
];
