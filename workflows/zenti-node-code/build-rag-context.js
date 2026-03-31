/**
 * Nodo: 📚 Build RAG Context
 *
 * Construye el contexto RAG (Retrieval Augmented Generation) a partir de
 * las bases oficiales de cada fondo. El LLM usa este contexto para citar
 * criterios reales en la evaluación de propuestas.
 *
 * Input esperado: campo `fondo` (nombre del fondo seleccionado por el usuario)
 * Output: campo `rag_context` con extractos, criterios, requisitos y fuente.
 */

const RAG_CONTEXTS = {
  'CORFO Crea y Valida': {
    bases_excerpt:
      'Instrumento «Crea y Valida» de InnovaChile/CORFO. Objetivo: apoyar el desarrollo de nuevos o mejorados productos (bienes o servicios) y/o procesos, que requieran I+D, desde la fase de prototipo hasta la validación técnica a escala productiva y/o validación comercial, fortaleciendo las capacidades de I+D+i en las empresas.\n\nCategorías: Proyecto Individual (subsidio máximo $180.000.000) y Proyecto Colaborativo (subsidio máximo $220.000.000).\n\nCofinanciamiento según tamaño: Empresa micro/pequeña (≤25.000 UF ventas): 80% máx. | Empresa mediana (25.001–100.000 UF): 60% máx. | Empresa grande (>100.000 UF): 40% máx. Al menos 50% de aportes de participantes debe ser «nuevo o pecuniario».\n\nPlazo: hasta 24 meses (máx. 30 con prórrogas). Dos etapas sucesivas obligatorias.',
    criteria_text:
      'Evaluación con notas de 1 a 5. Nota final mínima 3,50; nota mínima 3,00 por subcriterio.\n\n• Diagnóstico (10%): problema/desafío claro, coherente, fundado y documentado.\n• Mercado Objetivo (10%): identificación, caracterización y dimensionamiento de usuarios/clientes.\n• Metodología (20%): solución claramente descrita; plan de trabajo estructurado; resultados cuantificables; presupuesto coherente.\n• Grado de novedad y diferenciación (10%): novedad significativa; atributos diferenciadores.\n• Actividades de I+D (10%): proporción de gasto en I+D según Ley 20.241.\n• Impacto y beneficios esperados (10%): modelo de ingresos/ahorro; impactos sociales/medioambientales.\n• Estrategia de continuidad (10%): riesgos identificados; protección de resultados; plan post-subsidio.\n• Capacidades (10%): equipo técnico idóneo; capacidades del beneficiario.\n• Bonificación +0,2 décimas por capital humano experto (≥5 años experiencia o posgrado, ≥12 meses).\n\nFoco sostenibilidad (Res. N°389): alinear a ámbitos Recursos Hídricos, Energía o Producción Sostenible.',
    requirements_text:
      'Persona jurídica en Chile, ≥24 meses inicio actividades giro primera categoría. Ingresos por ventas acreditados. TRL 3+ al inicio. Universidades no pueden ser beneficiarios. Plazo máx. 24 meses (30 con prórrogas).',
    source_ref:
      'Bases Técnicas Crea y Valida — Res. Exenta N°388, InnovaChile/CORFO; Anexo Técnico Sostenibilidad — Res. E N°389',
  },
  'CORFO Consolida y Expande': {
    bases_excerpt:
      'Instrumento «Consolida y Expande» de InnovaChile/CORFO (Res. Exenta N°19/2024). Dirigido a empresas que ya han desarrollado un producto/servicio/proceso innovador y buscan su consolidación nacional y/o expansión internacional.\n\nEvaluación en dos etapas sucesivas. Adjudicación: hasta 30 proyectos + grupo de selección de hasta 30 adicionales (50% por método aleatorio para evaluación DIPRES).',
    criteria_text:
      'PRIMERA ETAPA (notas 1-5):\n• Diagnóstico (10%): problema claro, coherente, fundado.\n• Mercado Objetivo (20%): beneficiarios directos e indirectos; impactos sociales/medioambientales; riesgos y barreras.\n• Metodología (30%): solución clara; plan estructurado; indicadores cuantificables; presupuesto coherente.\n• Grado de novedad y diferenciación (40%): novedad en mercados de destino; valor agregado diferenciador.\n\nSEGUNDA ETAPA (notas 1-5):\n• Estrategia de Negocio (40%): modelo de ingresos/ahorro; cuantificación; protección PI.\n• Escalabilidad (30%): avance del producto; ventas; clientes; inversión.\n• Capacidades (30%): gestión, técnicas, financieras; equipo idóneo.\n\nNota mínima: 3,00 por subcriterio, 3,50 final. Bonificación 5% por sello Ley N°21.561.',
    requirements_text:
      'Persona jurídica en Chile, giro primera categoría vigente. Producto innovador ya desarrollado. Al menos 50% aportes «nuevos o pecuniarios».',
    source_ref:
      'Bases Técnicas Consolida y Expande — Res. Exenta N°19/2024, InnovaChile/CORFO',
  },
  'CORFO Innova Alta Tecnología': {
    bases_excerpt:
      'Instrumento «Innova Alta Tecnología» de InnovaChile/CORFO. Objetivo: soluciones tecnológicas globales, alto valor agregado, innovaciones intensivas en I+D con alta incertidumbre tecnológica.\n\nSubsidio máximo $1.000.000.000. Cofinanciamiento: micro/pequeña 70%, mediana 55%, grande 40%. Empresas lideradas por mujeres: +10% adicional.\n\nPlazo: hasta 48 meses (máx. 60). I+D ≥ 30% del costo total. TRL de entrada > 3.',
    criteria_text:
      'Evaluación notas 1-5. Nota final mínima 3,50; mínima 3,00 por subcriterio.\n\n• Diagnóstico y análisis tecnológico (15%): problema claro; inteligencia tecnológica y PI.\n• Mercado Objetivo (10%): usuarios/clientes identificados y dimensionados.\n• Metodología (15%): solución descrita; plan estructurado; avance en TRL cuantificable; presupuesto coherente.\n• Grado de novedad y diferenciación (15%): novedad significativa; diferenciación.\n• Beneficios Esperados (10%): modelo ingresos/ahorro; impactos sociales/medioambientales.\n• Estrategia de continuidad (15%): riesgos; protección; captura de valor; plan post-subsidio.\n• Equipo de trabajo (10%): experiencia técnica. Bonificación +0,2 por capital humano experto.\n• Beneficiario y asociados (10%): capacidades de gestión, financieras, infraestructura.',
    requirements_text:
      'Persona jurídica en Chile, ≥3 años inicio actividades. Ingresos por ventas en últimos 3 años. TRL > 3. I+D ≥ 30% del costo total. Fase 1 (perfil) completada. Plazo máx. 48 meses. Garantía ≥ 30 UF.',
    source_ref:
      'Bases Innova Alta Tecnología — Res. Electrónica Exenta N°3, InnovaChile/CORFO',
  },
  'CORFO Semilla Expande': {
    bases_excerpt:
      'Instrumento «Semilla Expande» de Gerencia de Emprendimiento de CORFO (Res. Exenta N°135/2024). Emprendimientos dinámicos con alto potencial de crecimiento.\n\nEtapa 1: hasta $25.000.000, plazo 9 meses (no prorrogable). Etapa 2 (Extensión): hasta $20.000.000 adicionales. Requiere Entidad Patrocinadora obligatoria.',
    criteria_text:
      'Evaluación notas 1,00–5,00 (centésima).\n\nINNOVACIÓN (40%):\n• Relevancia del Problema/Oportunidad (15%): problema no resuelto; relevancia para cliente.\n• Propuesta de Valor (20%): valor vs. competencia; coherencia con temática.\n• Estado de Avance (5%): hitos (ventas, tracción, capital, patentes).\n\nESCALABILIDAD (30%):\n• Modelo de Negocios (10%): definiciones para escalamiento.\n• Mercado (10%): clientes, competencia, tamaño, barreras.\n• Plan de Expansión (5%): despegue comercial.\n• Sostenibilidad (5%): operación sostenible social/ambiental.\n\nEQUIPO (30%):\n• Capacidad (12%): complementariedad, perfil, experiencia. Se espera ≥2 integrantes.\n• Compromiso (13%): dedicación horaria.\n• Redes/Alianzas (5%): contactos y alianzas comerciales.\n\nBonificación 5% por sello Ley N°21.561. Prelación empate: 1° Innovación, 2° Equipo, 3° Propuesta de Valor.',
    requirements_text:
      'Persona jurídica en Chile o natural con inicio actividades SII. Entidad Patrocinadora obligatoria. Equipo ≥2 personas recomendado. No simultaneidad con otros proyectos CORFO del mismo emprendimiento. Etapa 1: 9 meses máx.',
    source_ref:
      'Bases Semilla Expande — Res. Electrónica Exenta N°135/2024, Gerencia de Emprendimiento, CORFO',
  },
  'Startup Chile BUILD': {
    bases_excerpt:
      'Programa Startup Chile BUILD de CORFO. Startups en etapa de escalamiento con tracción demostrada. Enfoque en competitividad de mercado, equipo y potencial de crecimiento global.',
    criteria_text:
      'Evaluación notas 1-7.\n• Equipo (~40%): experiencia, complementariedad, dedicación, track record.\n• Mercado y Producto: tamaño de mercado; producto mínimo viable demostrado.\n• Tracción: métricas de crecimiento (MRR, usuarios, clientes, ventas, capital levantado).\n• Impacto: potencial económico y social en Chile.\n• Escalabilidad: modelo escalable; plan de expansión internacional.\n\nEquipo es determinante. Validación comercial pesa más que mérito científico.',
    requirements_text:
      'Startup con producto en mercado. Tracción demostrable. Equipo a tiempo completo. Operación desde Chile durante el programa.',
    source_ref:
      'Programa Startup Chile BUILD — CORFO (convocatoria vigente)',
  },
  'ANID FONDEF': {
    bases_excerpt:
      'FONDEF de ANID. I+D aplicada con vinculación al sector productivo. Exige rigor científico, articulación con empresas y consistencia del plan de trabajo.',
    criteria_text:
      'Evaluación notas 1-7.\n• Mérito científico-técnico: calidad, originalidad, rigor, metodología.\n• Relevancia: importancia del problema; impacto en sector productivo.\n• Equipo: calificación, productividad, experiencia en I+D.\n• Vinculación: articulación con empresas; compromisos de adopción.\n• Plan de trabajo: factibilidad, cronograma, hitos, presupuesto coherente.',
    requirements_text:
      'Investigador responsable con grado académico. Institución Patrocinante obligatoria. Vinculación con sector productivo. Equipamiento financiable hasta $50M.',
    source_ref:
      'Bases FONDEF IDeA / Iniciación en Investigación — ANID',
  },
};

const FUND_ALIASES = {
  'crea y valida': 'CORFO Crea y Valida',
  'corfo crea y valida': 'CORFO Crea y Valida',
  'cyv': 'CORFO Crea y Valida',
  'consolida y expande': 'CORFO Consolida y Expande',
  'corfo consolida y expande': 'CORFO Consolida y Expande',
  'cye': 'CORFO Consolida y Expande',
  'innova alta tecnología': 'CORFO Innova Alta Tecnología',
  'corfo innova alta tecnología': 'CORFO Innova Alta Tecnología',
  'alta tecnologia': 'CORFO Innova Alta Tecnología',
  'alta tecnología': 'CORFO Innova Alta Tecnología',
  'iat': 'CORFO Innova Alta Tecnología',
  'semilla expande': 'CORFO Semilla Expande',
  'corfo semilla expande': 'CORFO Semilla Expande',
  'startup chile build': 'Startup Chile BUILD',
  'startup chile': 'Startup Chile BUILD',
  'suc build': 'Startup Chile BUILD',
  'suc': 'Startup Chile BUILD',
  'anid fondef': 'ANID FONDEF',
  'fondef': 'ANID FONDEF',
  'fondef idea': 'ANID FONDEF',
};

function resolveFundName(input) {
  if (!input) return null;
  const normalized = input.trim();

  if (RAG_CONTEXTS[normalized]) return normalized;

  const lower = normalized.toLowerCase();
  if (FUND_ALIASES[lower]) return FUND_ALIASES[lower];

  for (const key of Object.keys(RAG_CONTEXTS)) {
    if (key.toLowerCase() === lower) return key;
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return key;
  }

  return null;
}

function buildRagContext(fundName) {
  const resolved = resolveFundName(fundName);

  if (!resolved || !RAG_CONTEXTS[resolved]) {
    return {
      fund_name: fundName || '(no especificado)',
      fund_resolved: null,
      has_rag: false,
      fund_bases_excerpt: '',
      evaluation_criteria: '',
      requirements: '',
      source_reference: 'Sin bases disponibles para este fondo',
      _note: `No se encontraron bases oficiales para "${fundName}". La evaluación usará criterios genéricos.`,
    };
  }

  const ctx = RAG_CONTEXTS[resolved];
  return {
    fund_name: fundName,
    fund_resolved: resolved,
    has_rag: true,
    fund_bases_excerpt: ctx.bases_excerpt,
    evaluation_criteria: ctx.criteria_text,
    requirements: ctx.requirements_text,
    source_reference: ctx.source_ref,
  };
}

const raw = $input.first().json;
const fondo = raw.fondo || raw.fund || raw.nombre_fondo || '';

const rag_context = buildRagContext(fondo);

return [
  {
    json: {
      ...raw,
      rag_context,
    },
  },
];
