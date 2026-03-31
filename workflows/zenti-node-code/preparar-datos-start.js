/**
 * Nodo: Preparar Datos Start (ZENTI.start)
 *
 * Normaliza el formulario corto (idea sin propuesta formal) y calcula un
 * match heur\u00edstico de instrumento p\u00fablico (sector + etapa + se\u00f1ales en el texto).
 * El LLM refina el veredicto; este nodo entrega contexto estructurado y pistas.
 */
let form = {};
try {
  form = $('📋 Formulario ZENTI.start').first().json;
} catch (_) {
  form = {};
}
const raw = $input.first().json;
const webhook = raw.body && typeof raw.body === 'object' ? raw.body : {};
const src = { ...webhook, ...raw, ...form };

function pick(...keys) {
  for (const k of keys) {
    if (src[k] !== undefined && src[k] !== null && String(src[k]).trim() !== '') {
      return String(src[k]).trim();
    }
  }
  return '';
}

const idea = pick(
  'field-0',
  'Idea',
  'Descripci\u00f3n de la idea',
  'Descripci\u00f3n de tu idea',
  'idea'
);
const sector = pick(
  'field-1',
  'Sector',
  'sector'
);
const etapa = pick(
  'field-2',
  'Etapa',
  'etapa',
  'Etapa del proyecto'
);
const equipo = pick(
  'field-3',
  'Equipo',
  'equipo',
  'Qui\u00e9n integra el equipo'
);
const email = pick(
  'field-4',
  'Email',
  'email',
  'Correo'
);

const ideaLower = idea.toLowerCase();

const FONDS = [
  {
    id: 'CORFO Crea y Valida',
    etiqueta: 'CORFO Crea y Valida',
    foco:
      'Validaci\u00f3n t\u00e9cnica y de mercado de soluciones innovadoras; fuerte componente I+D+i y metodolog\u00eda.',
    etapasIdeal: ['Prototipo inicial', 'Con tracci\u00f3n temprana'],
    sectoresPlus: ['Tecnolog\u00eda', 'Salud', 'Energ\u00eda', 'Agro', 'Manufactura'],
  },
  {
    id: 'CORFO Innova Alta Tecnolog\u00eda',
    etiqueta: 'CORFO Innova Alta Tecnolog\u00eda',
    foco:
      'Proyectos de alto contenido tecnol\u00f3gico y rigor en I+D; TRL medio-alto y diferenciaci\u00f3n cient\u00edfica-t\u00e9cnica.',
    etapasIdeal: ['Prototipo inicial', 'Con tracci\u00f3n temprana', 'Con clientes pagando'],
    sectoresPlus: ['Tecnolog\u00eda', 'Salud', 'Energ\u00eda', 'Miner\u00eda', 'Manufactura'],
  },
  {
    id: 'Startup Chile BUILD',
    etiqueta: 'Startup Chile BUILD',
    foco:
      'Escalamiento de startups con tracci\u00f3n; equipo, mercado, producto e impacto; peso relevante del equipo y validaci\u00f3n comercial.',
    etapasIdeal: ['Con tracci\u00f3n temprana', 'Con clientes pagando'],
    sectoresPlus: ['Tecnolog\u00eda', 'Servicios', 'Educaci\u00f3n', 'Salud', 'Agro'],
  },
  {
    id: 'CORFO Semilla Expande',
    etiqueta: 'CORFO Semilla Expande',
    foco:
      'Articular redes, escalabilidad y modelo de negocio temprano; equipos con roles claros (t\u00edpicamente 2+ integrantes).',
    etapasIdeal: ['Prototipo inicial', 'Con tracci\u00f3n temprana'],
    sectoresPlus: ['Servicios', 'Tecnolog\u00eda', 'Educaci\u00f3n', 'Agro', 'Manufactura', 'Otro'],
  },
  {
    id: 'CORFO Semilla Inicia',
    etiqueta: 'CORFO Semilla Inicia',
    foco: 'De idea a primeras ventas. Para personas naturales o jur\u00eddicas con menos de 18 meses y sin ventas previas. Hasta CLP 15M (17M mujeres).',
    etapasIdeal: ['Solo idea', 'Prototipo inicial'],
    sectoresPlus: ['Tecnolog\u00eda', 'Servicios', 'Educaci\u00f3n', 'Salud', 'Agro', 'Manufactura', 'Otro'],
  },
  {
    id: 'Innova Regi\u00f3n',
    etiqueta: 'Innova Regi\u00f3n',
    foco:
      'Impacto territorial y articulaci\u00f3n regional; metodolog\u00eda y beneficio para el ecosistema local.',
    etapasIdeal: ['Prototipo inicial', 'Con tracci\u00f3n temprana', 'Con clientes pagando'],
    sectoresPlus: ['Agro', 'Energ\u00eda', 'Manufactura', 'Servicios', 'Miner\u00eda', 'Educaci\u00f3n', 'Otro'],
  },
  {
    id: 'ANID FONDEF',
    etiqueta: 'ANID FONDEF',
    foco:
      'I+D con vinculaci\u00f3n ciencia-empresa; m\u00e9rito cient\u00edfico-t\u00e9cnico, plan riguroso y transferencia.',
    etapasIdeal: ['Prototipo inicial', 'Con tracci\u00f3n temprana'],
    sectoresPlus: ['Salud', 'Tecnolog\u00eda', 'Energ\u00eda', 'Manufactura', 'Miner\u00eda', 'Agro'],
  },
];

const KW = [
  { re: /\b(trl|laboratorio|paper|patente|algoritmo|deep\s*tech|ciencia|universidad|fondecyt|publicaci[oó]n)\b/i, bump: { 'CORFO Innova Alta Tecnolog\u00eda': 2.5, 'ANID FONDEF': 2.5, 'CORFO Crea y Valida': 1 } },
  { re: /\b(piloto|validaci[oó]n|prueba\s+de\s+concepto|mvp|prototipo)\b/i, bump: { 'CORFO Crea y Valida': 2.5, 'CORFO Semilla Expande': 1.5, 'CORFO Semilla Inicia': 1 } },
  { re: /\b(clientes|mrr|recurrente|ventas|contrato|pago|facturaci[oó]n)\b/i, bump: { 'Startup Chile BUILD': 3, 'CORFO Innova Alta Tecnolog\u00eda': 1 } },
  { re: /\b(escala|escalamiento|serie\s*a|inversi[oó]n|vc)\b/i, bump: { 'Startup Chile BUILD': 2.5, 'CORFO Semilla Expande': 1.5 } },
  { re: /\b(regi[oó]n|territorio|comuna|local|rural|proveedor\s+local)\b/i, bump: { 'Innova Regi\u00f3n': 3 } },
  { re: /\b(equipo|fundador|cofundador|socio)\b/i, bump: { 'CORFO Semilla Expande': 1.2, 'Startup Chile BUILD': 1.2 } },
];

const ETAPA_WEIGHT = {
  'Solo idea': {
    'CORFO Semilla Inicia': 4,
    'CORFO Semilla Expande': -5,   // requires sales — hard exclusion for zero-sales projects
    'CORFO Crea y Valida': 2,
    'CORFO Innova Alta Tecnolog\u00eda': 0.5,
    'Startup Chile BUILD': -1,
    'Innova Regi\u00f3n': 1,
    'ANID FONDEF': 0.5,
  },
  'Prototipo inicial': {
    'CORFO Crea y Valida': 3,
    'CORFO Innova Alta Tecnolog\u00eda': 2.5,
    'ANID FONDEF': 2,
    'CORFO Semilla Expande': 2,
    'CORFO Semilla Inicia': 2,
    'Startup Chile BUILD': 0.5,
    'Innova Regi\u00f3n': 1.5,
  },
  'Con tracci\u00f3n temprana': {
    'Startup Chile BUILD': 3,
    'CORFO Crea y Valida': 2,
    'Innova Regi\u00f3n': 2.5,
    'CORFO Innova Alta Tecnolog\u00eda': 2,
    'CORFO Semilla Expande': 1,
    'CORFO Semilla Inicia': -2,
    'ANID FONDEF': 1,
  },
  'Con clientes pagando': {
    'Startup Chile BUILD': 3.5,
    'CORFO Innova Alta Tecnolog\u00eda': 2.5,
    'CORFO Semilla Expande': 1.5,
    'CORFO Crea y Valida': 1,
    'Innova Regi\u00f3n': 2,
    'CORFO Semilla Inicia': -5,
    'ANID FONDEF': 1,
  },
};

function scoreFund(f) {
  let s = 0;
  if (f.etapasIdeal.includes(etapa)) s += 2.5;
  if (f.sectoresPlus.includes(sector)) s += 2;
  const ew = ETAPA_WEIGHT[etapa];
  if (ew && ew[f.id] !== undefined) s += ew[f.id];
  for (const { re, bump } of KW) {
    if (re.test(ideaLower)) {
      const add = bump[f.id];
      if (add) s += add;
    }
  }
  return Math.round(s * 10) / 10;
}

const scored = FONDS.map(f => ({ id: f.id, etiqueta: f.etiqueta, score: scoreFund(f), foco: f.foco }))
  .sort((a, b) => b.score - a.score);

const heuristic_primary = scored[0] || null;
const heuristic_secondary = scored[1] || null;

const resumen_matching = [
  'Sector declarado: ' + (sector || '(\u2014)'),
  'Etapa declarada: ' + (etapa || '(\u2014)'),
  'Pista algor\u00edtmica (no vinculante): ' +
    (heuristic_primary ? heuristic_primary.etiqueta + ' (' + heuristic_primary.score + ')' : 'sin datos suficientes'),
  heuristic_secondary ? 'Segunda opci\u00f3n heur\u00edstica: ' + heuristic_secondary.etiqueta : '',
]
  .filter(Boolean)
  .join('\n');

const catalogo_fondos_txt = FONDS.map(
  f => '- **' + f.etiqueta + '** — ' + f.foco
).join('\n');

return [
  {
    json: {
      idea,
      sector,
      etapa,
      equipo,
      email,
      heuristic_primary: heuristic_primary?.etiqueta || '',
      heuristic_secondary: heuristic_secondary?.etiqueta || '',
      fund_scores: scored,
      resumen_matching,
      catalogo_fondos_txt,
      timestamp: new Date().toISOString(),
    },
  },
];
