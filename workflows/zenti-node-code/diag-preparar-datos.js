/**
 * Nodo: ⚙️ Preparar Datos Diag
 *
 * Consolida la información de entrada (formulario + PDF) y configura
 * el contexto del diagnóstico según el instrumento y sector.
 *
 * Output alimenta las 2 fases LLM (Problem + Solution) y downstream.
 */
const form = $('📋 Formulario Diag').first().json;
const current = $input.first().json;

const nombre    = form['field-0'] || form.nombre || '';
const empresa   = form['field-1'] || form.empresa || '';
const sector    = form['field-2'] || form.sector || '';
const fondo     = form['field-3'] || form.fondo || '';
const trl       = form['field-4'] || form.trl || '';
const textoForm = form['field-5'] || form.descripcion || '';
const email     = form['field-6'] || form.email || '';

let textoPdf = '';
try {
  const extractor = $('📄 Extraer Texto PDF').first();
  textoPdf = String(extractor.json?.text || extractor.json?.data || '').trim();
} catch (e) {
  textoPdf = '';
}

const PDF_THRESHOLD = 120;
const placeholderRe =
  /^(resumen\s+en\s+pdf|ver\s+pdf|adjunto|propuesta\s+en\s+(el\s+)?archivo)/i;

let descripcion;
let fuente;

if (textoPdf.length > PDF_THRESHOLD && !placeholderRe.test(textoPdf)) {
  descripcion = textoPdf;
  fuente = 'pdf';
} else if (textoForm.trim().length > 0) {
  descripcion = textoForm.trim();
  fuente = 'manual';
} else {
  descripcion = textoPdf || '(Descripción no proporcionada)';
  fuente = textoPdf ? 'pdf' : 'sin_texto';
}

const SECTOR_SOURCES = {
  'TI / Software': 'ACM DL, IEEE Xplore, arXiv (cs), Semantic Scholar',
  'Minería / Industria': 'Minerals Engineering, Journal of Mining Science, SERNAGEOMIN, Cochilco',
  'Salud / Biotech': 'PubMed, Cochrane, NEJM, MINSAL informes',
  'Energía / Sustentabilidad': 'Energy Policy, Renewable & Sustainable Reviews, CNE Chile, IEA',
  'AgriTech / AgroFood': 'INIA informes, Food Policy, Nature Food, ODEPA datos',
  'Educación / EdTech': 'ERIC, Journal of Learning Sciences, Mineduc SIMCE, OCDE PISA',
  'Fintech / Banca': 'Journal of Financial Economics, CMF Chile, BIS reports',
};

const FONDO_CONTEXT = {
  'CORFO Crea y Valida': {
    tipo: 'innovacion',
    enfoque: 'I+D+i con componente de validación comercial',
    criterio_clave: 'Innovación + viabilidad comercial + impacto sectorial',
    hook: 'CORFO valora la articulación entre problema real, innovación tecnológica y potencial de mercado',
  },
  'CORFO Innova Alta Tecnología': {
    tipo: 'alta_tecnologia',
    enfoque: 'Investigación aplicada con alto componente científico',
    criterio_clave: 'Mérito científico + novedad tecnológica + equipo experto',
    hook: 'CORFO AltaTec exige evidencia científica sólida y equipo con track record en I+D',
  },
  'Startup Chile BUILD': {
    tipo: 'startup',
    enfoque: 'Tracción comercial y escalabilidad global',
    criterio_clave: 'Equipo (~40%) + tracción + mercado global + escalabilidad',
    hook: 'Startup Chile prioriza equipo excepcional, validación de mercado y potencial de escala',
  },
  'CORFO Semilla Expande': {
    tipo: 'semilla',
    enfoque: 'Crecimiento de negocio innovador existente',
    criterio_clave: 'Innovación + escalabilidad + equipo + redes',
    hook: 'Semilla Expande evalúa capacidad de escalar con redes de apoyo y equipo cohesionado',
  },
  'Innova Región': {
    tipo: 'regional',
    enfoque: 'Impacto territorial y articulación local',
    criterio_clave: 'Beneficio regional + metodología + articulación con actores locales',
    hook: 'Innova Región prioriza impacto medible en el territorio y vinculación con ecosistema local',
  },
  'ANID FONDEF': {
    tipo: 'cientifico',
    enfoque: 'Investigación aplicada con vinculación productiva',
    criterio_clave: 'Mérito científico + metodología rigurosa + vinculación sectorial',
    hook: 'FONDEF exige rigor científico, hipótesis falsificables y plan de transferencia al sector productivo',
  },
};

const fondoCtx = FONDO_CONTEXT[fondo] || {
  tipo: 'general',
  enfoque: 'Innovación y desarrollo',
  criterio_clave: 'Problema + solución + mercado + equipo + impacto',
  hook: 'Los fondos de innovación evalúan la coherencia entre problema, solución y potencial de impacto',
};

const fuentes_sector = SECTOR_SOURCES[sector] || 'Fuentes académicas y sectoriales relevantes';

return [
  {
    json: {
      nombre,
      empresa,
      sector,
      fondo,
      trl,
      email,
      descripcion,
      fuente,
      texto_formulario: textoForm,
      texto_pdf: textoPdf.slice(0, 500),
      fondo_context: fondoCtx,
      fuentes_sector,
      timestamp: new Date().toISOString(),
    },
  },
];
