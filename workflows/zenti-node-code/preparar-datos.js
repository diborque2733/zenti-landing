/**
 * Nodo: ⚙️ Preparar Datos
 *
 * Consolida la información de entrada (formulario + PDF) y configura
 * los parámetros de evaluación según el instrumento seleccionado.
 *
 * Prioridad de fuente:
 *   PDF con texto suficiente (>120 chars) → fuente_propuesta = "pdf"
 *   Texto ingresado en formulario         → fuente_propuesta = "manual"
 *   Sin contenido                         → fuente_propuesta = "sin_texto"
 */
let form = {};
try {
  form = $('📋 Formulario Entrada').first().json;
} catch (_) {
  form = {};
}
const raw = $input.first().json;

/**
 * n8n Webhook suele entregar POST JSON en `body`. A veces `body` llega como string
 * (JSON serializado); si no lo parseamos, field-* no existen en `src` y `email` queda
 * vacío → Gmail: "Invalid email address".
 */
function webhookBodyAsObject(r) {
  if (!r || typeof r !== 'object') return {};
  const b = r.body;
  if (b == null) return {};
  if (typeof b === 'string') {
    const t = b.trim();
    if (!t) return {};
    try {
      const p = JSON.parse(t);
      if (p && typeof p === 'object' && !Array.isArray(p)) return p;
    } catch (_) {
      return {};
    }
    return {};
  }
  if (Array.isArray(b) && b[0] && typeof b[0] === 'object' && !Array.isArray(b[0])) return b[0];
  if (typeof b === 'object') return b;
  return {};
}

const webhookFlat = webhookBodyAsObject(raw);
const src = { ...raw, ...webhookFlat, ...form };

const nombre = src['field-0'] || src['Nombre del proyecto'] || src['Nombre del Proyecto'] || src.nombre || '';
const empresa = src['field-1'] || src['Nombre de la empresa'] || src['Empresa'] || src.empresa || '';
const fondo = src['field-2'] || src['Fondo al que postula'] || src['Fondo'] || src.fondo || '';
const trl = src['field-3'] || src['TRL actual'] || src['TRL'] || src.trl || '';
const textoForm = src['field-4'] || src['Texto completo de la propuesta'] || src['Propuesta (texto)'] || src.propuesta || '';
const email = String(
  src['field-5'] ||
    src['Email para recibir el reporte'] ||
    src['Email'] ||
    src.email ||
    '',
).trim();

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

let propuesta;
let fuente_propuesta;

if (textoPdf.length > PDF_THRESHOLD && !placeholderRe.test(textoPdf)) {
  propuesta = textoPdf;
  fuente_propuesta = 'pdf';
} else if (textoForm.trim().length > 0) {
  propuesta = textoForm.trim();
  fuente_propuesta = 'manual';
} else {
  propuesta = textoPdf || '(Texto de postulaci\u00f3n no proporcionado)';
  fuente_propuesta = textoPdf ? 'pdf' : 'sin_texto';
}

const FONDO_CONFIG = {
  'CORFO Crea y Valida': {
    escala: '1-5',
    criterios: 'diagn\u00f3stico, mercado, metodolog\u00eda, novedad, I+D, impacto, escalabilidad, capacidades',
    enfasis: 'Componente I+D+i tiene alto peso en el criterio evaluador. Validar consistencia t\u00e9cnica con bases CORFO y estructuraci\u00f3n metodol\u00f3gica.',
  },
  'CORFO Innova Alta Tecnolog\u00eda': {
    escala: '1-5',
    criterios: 'problema, tecnolog\u00eda, novedad, viabilidad, equipo',
    enfasis: 'I+D representa ~30% del criterio evaluador. Validar nivel tecnol\u00f3gico, evidencia cient\u00edfica y consistencia t\u00e9cnica del equipo.',
  },
  'Startup Chile BUILD': {
    escala: '1-7',
    criterios: 'equipo (~40%), mercado, producto, tracci\u00f3n, impacto, escalabilidad',
    enfasis: 'Pre-aceleraci\u00f3n. De idea validada a prototipo. Equity-free CLP 15M. Equipo es determinante.',
  },
  'Startup Chile IGNITE': {
    escala: '1-7',
    criterios: 'equipo (~40%), producto funcional, product-market fit, tracci\u00f3n, escalabilidad',
    enfasis: 'Aceleraci\u00f3n. Producto funcional buscando PMF. Equity-free CLP 25M + 20M extensi\u00f3n. Evaluar validaci\u00f3n comercial.',
  },
  'Startup Chile GROWTH': {
    escala: '1-7',
    criterios: 'equipo, revenue, tracci\u00f3n, mercado, escalabilidad global',
    enfasis: 'Escalamiento. Revenue y tracci\u00f3n probada. Equity-free hasta CLP 75M. Plan de expansi\u00f3n global.',
  },
  'CORFO Semilla Expande': {
    escala: '1-5',
    criterios: 'innovaci\u00f3n, escalabilidad, equipo, redes',
    enfasis: 'Equipo con al menos 2 integrantes y roles definidos. Evaluar articulaci\u00f3n de redes y capacidad de escalamiento.',
  },
  'CORFO Semilla Inicia': {
    escala: '1-5',
    criterios: 'innovaci\u00f3n, potencial de crecimiento, equipo, viabilidad',
    enfasis: 'De idea a primeras ventas. Sin ventas previas requerido. Entidad Patrocinadora obligatoria. Subsidio hasta CLP 15M.',
  },
  'Innova Regi\u00f3n': {
    escala: '1-5',
    criterios: 'metodolog\u00eda, impacto regional, escalabilidad, equipo',
    enfasis: 'Criterio evaluador prioriza beneficio territorial y articulaci\u00f3n local. Validar consistencia metodol\u00f3gica con impacto declarado.',
  },
  'ANID FONDEF': {
    escala: '1-7',
    criterios: 'm\u00e9rito cient\u00edfico-t\u00e9cnico, relevancia, equipo, vinculaci\u00f3n, plan',
    enfasis: 'Marco ANID: exigencia de I+D riguroso, vinculaci\u00f3n con sector productivo y consistencia del plan de trabajo.',
  },
  'CORFO Consolida y Expande': {
    escala: '1-5',
    criterios: 'diagn\u00f3stico, mercado, metodolog\u00eda, novedad, estrategia de negocio, escalabilidad, capacidades',
    enfasis: 'Evaluaci\u00f3n en dos etapas. Primera etapa: novedad y diferenciaci\u00f3n pesa 40%. Segunda etapa: estrategia de negocio 40%, escalabilidad 30%.',
  },
};

const RAG_CONTEXTS = {
  'CORFO Crea y Valida': {
    bases_excerpt: 'Instrumento \u00abCrea y Valida\u00bb de InnovaChile/CORFO. Objetivo: apoyar el desarrollo de nuevos o mejorados productos (bienes o servicios) y/o procesos, que requieran I+D, desde la fase de prototipo hasta la validaci\u00f3n t\u00e9cnica a escala productiva y/o validaci\u00f3n comercial.\n\nCategor\u00edas: Proyecto Individual (subsidio m\u00e1ximo $180.000.000) y Proyecto Colaborativo (subsidio m\u00e1ximo $220.000.000). Cofinanciamiento: micro/peque\u00f1a 80%, mediana 60%, grande 40%. Plazo: hasta 24 meses (m\u00e1x. 30 con pr\u00f3rrogas).',
    criteria_text: 'Evaluaci\u00f3n notas 1-5. M\u00ednima 3,50 final; 3,00 por subcriterio.\n\n\u2022 Diagn\u00f3stico (10%): problema claro, fundado y documentado.\n\u2022 Mercado Objetivo (10%): identificaci\u00f3n y dimensionamiento de usuarios/clientes.\n\u2022 Metodolog\u00eda (20%): soluci\u00f3n descrita; plan estructurado; presupuesto coherente.\n\u2022 Novedad y diferenciaci\u00f3n (10%): novedad significativa; diferenciadores.\n\u2022 Actividades de I+D (10%): proporci\u00f3n gasto I+D seg\u00fan Ley 20.241.\n\u2022 Impacto (10%): modelo ingresos/ahorro; impactos sociales/medioambientales.\n\u2022 Estrategia continuidad (10%): riesgos; protecci\u00f3n; plan post-subsidio.\n\u2022 Capacidades (10%): equipo t\u00e9cnico; beneficiario.\n\u2022 Bonificaci\u00f3n +0,2 d\u00e9cimas por capital humano experto.\nFoco sostenibilidad (Res. N\u00b0389): Recursos H\u00eddricos, Energ\u00eda o Producci\u00f3n Sostenible.',
    requirements_text: 'Persona jur\u00eddica en Chile, \u226524 meses inicio actividades. Ingresos por ventas acreditados. TRL 3+. Plazo m\u00e1x. 24 meses.',
    source_ref: 'Bases T\u00e9cnicas Crea y Valida \u2014 Res. Exenta N\u00b0388; Anexo Sostenibilidad \u2014 Res. E N\u00b0389',
  },
  'CORFO Consolida y Expande': {
    bases_excerpt: 'Instrumento \u00abConsolida y Expande\u00bb de InnovaChile/CORFO (Res. Exenta N\u00b019/2024). Consolidaci\u00f3n nacional y/o expansi\u00f3n internacional de productos innovadores. Evaluaci\u00f3n en dos etapas sucesivas.',
    criteria_text: 'PRIMERA ETAPA: Diagn\u00f3stico (10%), Mercado (20%), Metodolog\u00eda (30%), Novedad y diferenciaci\u00f3n (40%).\nSEGUNDA ETAPA: Estrategia de Negocio (40%), Escalabilidad (30%), Capacidades (30%).\nNota m\u00ednima: 3,00 por subcriterio, 3,50 final. Bonificaci\u00f3n 5% sello Ley N\u00b021.561.',
    requirements_text: 'Persona jur\u00eddica en Chile. Producto innovador ya desarrollado. Al menos 50% aportes \u00abnuevos o pecuniarios\u00bb.',
    source_ref: 'Bases Consolida y Expande \u2014 Res. Exenta N\u00b019/2024, InnovaChile/CORFO',
  },
  'CORFO Innova Alta Tecnolog\u00eda': {
    bases_excerpt: 'Instrumento \u00abInnova Alta Tecnolog\u00eda\u00bb de InnovaChile/CORFO. Soluciones tecnol\u00f3gicas globales, alto valor agregado, I+D intensivo. Subsidio m\u00e1ximo $1.000.000.000. TRL entrada > 3. I+D \u2265 30% costo total. Plazo: hasta 48 meses.',
    criteria_text: '\u2022 Diagn\u00f3stico y an\u00e1lisis tecnol\u00f3gico (15%)\n\u2022 Mercado Objetivo (10%)\n\u2022 Metodolog\u00eda (15%): avance en TRL cuantificable\n\u2022 Novedad y diferenciaci\u00f3n (15%)\n\u2022 Beneficios Esperados (10%)\n\u2022 Estrategia continuidad (15%)\n\u2022 Equipo (10%): bonificaci\u00f3n +0,2 capital humano experto\n\u2022 Beneficiario y asociados (10%)\nNota m\u00ednima 3,50 final; 3,00 por subcriterio.',
    requirements_text: '\u22653 a\u00f1os inicio actividades. Ingresos ventas \u00faltimos 3 a\u00f1os. TRL > 3. I+D \u2265 30%. Fase 1 completada. Garant\u00eda \u2265 30 UF.',
    source_ref: 'Bases Innova Alta Tecnolog\u00eda \u2014 Res. Electr\u00f3nica Exenta N\u00b03, InnovaChile/CORFO',
  },
  'CORFO Semilla Expande': {
    bases_excerpt: '\u00abSemilla Expande\u00bb de CORFO (Res. Exenta N\u00b0135/2024). Emprendimientos din\u00e1micos de alto crecimiento. Etapa 1: hasta $25M, 9 meses. Etapa 2 (extensi\u00f3n): hasta $20M adicionales. Requiere Entidad Patrocinadora.',
    criteria_text: 'INNOVACI\u00d3N (40%): Relevancia Problema (15%), Propuesta Valor (20%), Estado Avance (5%).\nESCALABILIDAD (30%): Modelo Negocios (10%), Mercado (10%), Plan Expansi\u00f3n (5%), Sostenibilidad (5%).\nEQUIPO (30%): Capacidad (12%), Compromiso (13%), Redes/Alianzas (5%).\nNotas 1,00\u20135,00. Bonificaci\u00f3n 5% sello Ley N\u00b021.561.',
    requirements_text: 'Persona jur\u00eddica/natural con inicio actividades SII. Entidad Patrocinadora obligatoria. Equipo \u22652 personas recomendado.',
    source_ref: 'Bases Semilla Expande \u2014 Res. Exenta N\u00b0135/2024, CORFO',
  },
  'CORFO Semilla Inicia': {
    bases_excerpt: '\u00abSemilla Inicia\u00bb de CORFO. Apoya el desarrollo de ideas innovadoras hacia las primeras ventas. Personas naturales mayores de 18 a\u00f1os residentes en Chile o personas jur\u00eddicas con menos de 18 meses de inicio de actividades y sin ventas previas. Subsidio m\u00e1ximo CLP 15.000.000 (CLP 17.000.000 para mujeres). Plazo m\u00e1ximo 12 meses.',
    criteria_text: 'INNOVACI\u00d3N: Relevancia del problema, propuesta de valor, nivel de avance.\nPOTENCIAL DE CRECIMIENTO: Mercado objetivo, modelo de negocios, escalabilidad.\nEQUIPO: Capacidad, compromiso, complementariedad.\nVIABILIDAD: Plan de trabajo, presupuesto, factibilidad.',
    requirements_text: 'Persona natural \u226518 a\u00f1os residente en Chile, O persona jur\u00eddica con inicio de actividades <18 meses. Sin ventas previas. Entidad Patrocinadora obligatoria.',
    source_ref: 'Bases Semilla Inicia \u2014 CORFO',
  },
  'Startup Chile BUILD': {
    bases_excerpt: 'Startup Chile BUILD de CORFO. Startups en escalamiento con tracci\u00f3n demostrada.',
    criteria_text: 'Notas 1-7. Equipo (~40%), Mercado y Producto, Tracci\u00f3n, Impacto, Escalabilidad. Equipo es determinante.',
    requirements_text: 'Startup con producto en mercado. Tracci\u00f3n demostrable. Equipo a tiempo completo.',
    source_ref: 'Startup Chile BUILD \u2014 CORFO (convocatoria vigente)',
  },
  'ANID FONDEF': {
    bases_excerpt: 'FONDEF de ANID. I+D aplicada con vinculaci\u00f3n al sector productivo.',
    criteria_text: 'Notas 1-7. M\u00e9rito cient\u00edfico-t\u00e9cnico, Relevancia, Equipo, Vinculaci\u00f3n, Plan de trabajo.',
    requirements_text: 'Investigador con grado acad\u00e9mico. Instituci\u00f3n Patrocinante obligatoria. Vinculaci\u00f3n productiva.',
    source_ref: 'Bases FONDEF IDeA \u2014 ANID',
  },
};

const RAG_FUND_ALIASES = {
  'crea y valida': 'CORFO Crea y Valida',
  'corfo crea y valida': 'CORFO Crea y Valida',
  'cyv': 'CORFO Crea y Valida',
  'consolida y expande': 'CORFO Consolida y Expande',
  'corfo consolida y expande': 'CORFO Consolida y Expande',
  'cye': 'CORFO Consolida y Expande',
  'innova alta tecnolog\u00eda': 'CORFO Innova Alta Tecnolog\u00eda',
  'corfo innova alta tecnolog\u00eda': 'CORFO Innova Alta Tecnolog\u00eda',
  'alta tecnologia': 'CORFO Innova Alta Tecnolog\u00eda',
  'alta tecnolog\u00eda': 'CORFO Innova Alta Tecnolog\u00eda',
  'iat': 'CORFO Innova Alta Tecnolog\u00eda',
  'semilla expande': 'CORFO Semilla Expande',
  'corfo semilla expande': 'CORFO Semilla Expande',
  'startup chile build': 'Startup Chile BUILD',
  'startup chile': 'Startup Chile BUILD',
  'suc build': 'Startup Chile BUILD',
  'suc': 'Startup Chile BUILD',
  'anid fondef': 'ANID FONDEF',
  'fondef': 'ANID FONDEF',
  'innova regi\u00f3n': 'CORFO Consolida y Expande',
};

function resolveRagFund(input) {
  if (!input) return null;
  const normalized = input.trim();
  if (RAG_CONTEXTS[normalized]) return normalized;
  const lower = normalized.toLowerCase();
  if (RAG_FUND_ALIASES[lower]) return RAG_FUND_ALIASES[lower];
  for (const key of Object.keys(RAG_CONTEXTS)) {
    if (key.toLowerCase() === lower) return key;
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return key;
  }
  return null;
}

function buildRagContext(fundName) {
  const resolved = resolveRagFund(fundName);
  if (!resolved || !RAG_CONTEXTS[resolved]) {
    return {
      fund_resolved: null,
      has_rag: false,
      bases_excerpt: '',
      criteria_text: '',
      requirements_text: '',
      source_ref: 'Sin bases disponibles para este fondo',
    };
  }
  const ctx = RAG_CONTEXTS[resolved];
  return {
    fund_resolved: resolved,
    has_rag: true,
    bases_excerpt: (ctx.bases_excerpt || '').slice(0, 2000),
    criteria_text: ctx.criteria_text,
    requirements_text: ctx.requirements_text,
    source_ref: ctx.source_ref,
  };
}

const config = FONDO_CONFIG[fondo] || {
  escala: '1-5',
  criterios: 'problema, soluci\u00f3n, mercado, equipo, impacto',
  enfasis: 'Evaluaci\u00f3n t\u00e9cnico-estrat\u00e9gica general para fondos de innovaci\u00f3n.',
};

const rag_context = buildRagContext(fondo);

/**
 * tier: "free" | "premium"
 * - field-7 en el form (opcional): "premium" para informe ampliado (2.º LLM + render premium).
 * - También: src.tier, src.query.tier, o ?tier=premium si el trigger lo expone en json.
 */
const tierRaw = String(
  src['field-7'] ||
    src.tier ||
    (src.query && (src.query.tier || src.query.premium)) ||
    '',
).toLowerCase();
const tier =
  tierRaw === 'premium' || tierRaw === '1' || tierRaw === 'true' || src.premium === true
    ? 'premium'
    : 'free';

return [
  {
    json: {
      nombre,
      empresa,
      fondo,
      trl,
      email,
      propuesta,
      fuente_propuesta,
      texto_formulario: textoForm,
      texto_pdf: textoPdf.slice(0, 500),
      config,
      rag_context,
      tier,
      timestamp: new Date().toISOString(),
    },
  },
];
