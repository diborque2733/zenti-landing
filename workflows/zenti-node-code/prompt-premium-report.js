/**
 * Nodo: 🧠 Prompt Premium Report
 *
 * Builds the enhanced LLM prompt for ZENTI Premium Report.
 * Reads proposal data from ⚙️ Preparar Datos, loads inlined RAG
 * context for the selected fund, and constructs a system+user
 * prompt that asks Claude for exhaustive per-criterion analysis.
 *
 * Output: { prompt_premium: string, rag_context_used: string }
 */
const preparar = $('⚙️ Preparar Datos').first().json;

const nombre   = preparar.nombre   || 'Proyecto';
const empresa  = preparar.empresa  || '';
const fondo    = preparar.fondo    || '';
const trl      = preparar.trl      || '';
const propuesta = preparar.propuesta || '';
const config   = preparar.config   || {};

/* ══════════════════════════════════════════════════════════
   RAG CONTEXTS — inlined from rag-contexts.json
   n8n Code nodes cannot read files; data must live here.
   ══════════════════════════════════════════════════════════ */

const RAG_CONTEXTS = {
  "CORFO Crea y Valida": {
    "bases_excerpt": "Instrumento «Crea y Valida» de InnovaChile/CORFO. Objetivo: apoyar el desarrollo de nuevos o mejorados productos (bienes o servicios) y/o procesos, que requieran I+D, desde la fase de prototipo hasta la validación técnica a escala productiva y/o validación comercial, fortaleciendo las capacidades de I+D+i en las empresas.\n\nCategorías: Proyecto Individual (subsidio máximo $180.000.000) y Proyecto Colaborativo (subsidio máximo $220.000.000).\n\nCofinanciamiento según tamaño: Empresa micro/pequeña (≤25.000 UF ventas): 80% máx. | Empresa mediana (25.001–100.000 UF): 60% máx. | Empresa grande (>100.000 UF): 40% máx. Al menos 50% de aportes de participantes debe ser «nuevo o pecuniario». Empresas lideradas por mujeres: aumento de hasta 10% adicional.\n\nPlazo: hasta 24 meses (máx. 30 con prórrogas). Etapas sucesivas obligatorias. Ciclos biológicos: hasta 36 meses (máx. 42).\n\nFase 1 (perfil obligatorio): retroalimentación no vinculante. Fase 2: postulación a cofinanciamiento.\n\nRequisitos admisibilidad beneficiario: persona jurídica constituida en Chile, ≥24 meses desde inicio actividades en giro empresarial primera categoría, ingresos por ventas acreditados.",
    "criteria_text": "Evaluación con notas de 1 a 5. Para recomendación de aprobación: nota final mínima 3,50 y nota mínima 3,00 en cada subcriterio.\n\nCriterios y ponderaciones:\n• Diagnóstico (10%): problema/desafío/oportunidad clara y coherentemente identificado, análisis de causas completo, fundado y documentado.\n• Mercado Objetivo (10%): adecuada identificación, caracterización y dimensionamiento de usuarios/clientes beneficiarios.\n• Metodología (20%): solución claramente descrita y efectiva; plan de trabajo correctamente estructurado (actividades, plazos, hitos); resultados e indicadores claros y cuantificables; presupuesto coherente con plan; dedicación horaria y valor hora coherentes.\n• Grado de novedad y diferenciación (10%): novedad significativa a nivel empresa/regional/nacional/internacional; atributos diferenciadores vs. soluciones existentes.\n• Actividades de I+D (10%): proporción de gasto en I+D (según Ley 20.241) respecto al costo total.\n• Impacto y beneficios esperados (10%): modelo de ingresos/ahorro coherente; impactos sociales y/o medioambientales.\n• Estrategia de continuidad (10%): riesgos y barreras identificados; estrategia de protección; plan post-subsidio.\n• Capacidades (10%): equipo con experiencia y capacidades técnicas; beneficiario con capacidades de gestión, financieras e infraestructura.\n• Bonificación capital humano experto: +0,2 décimas si se incluye contratación de personal con ≥5 años experiencia o posgrado por ≥12 meses.\n\nFoco sostenibilidad (Anexo Técnico Res. N°389): proyectos deben alinearse a ámbitos de acción — Recursos Hídricos, Energía, o Producción Sostenible — y abordar al menos un desafío específico.",
    "requirements_text": "Persona jurídica constituida en Chile. ≥24 meses desde inicio actividades en giro primera categoría. Ingresos por ventas acreditados en los 2 años previos. Universidades/IP/CFT no pueden ser beneficiarios. Proyecto debe contemplar al menos dos etapas. TRL inicial: superior a prueba de concepto experimental (TRL 3+). I+D debe representar al menos un porcentaje significativo del costo total. Plazo máx. 24 meses (30 con prórrogas).",
    "source_ref": "Bases Técnicas Crea y Valida — Resolución Exenta N°388, InnovaChile/CORFO; Anexo Técnico Complementario con Foco en Sostenibilidad — Resolución E N°389",
    "budget_rules": "Cofinanciamiento: micro/pequeña 80%, mediana 60%, grande 40%. Mínimo 50% aportes nuevos/pecuniarios. Subsidio máx. individual $180M, colaborativo $220M. Partidas: honorarios equipo (valor hora justificado), subcontratos (hasta 40% del subsidio), equipamiento (depreciación proporcional), gastos de operación, viajes, propiedad intelectual, overhead (hasta 15% del subsidio).",
    "approval_patterns": "Proyectos aprobados tienden a: nota final 3.8-4.5; Metodología y Diagnóstico son los criterios más diferenciadores; I+D representando 25-45% del costo total; equipos de 3-6 personas con al menos un PhD o MSc; presupuesto entre $80M-$160M; plan de trabajo con 3-5 etapas bien definidas; indicadores cuantificables con línea base. Proyectos rechazados frecuentemente: diagnóstico genérico sin datos, metodología vaga sin hitos medibles, equipo sin experiencia demostrable en el área, presupuesto inflado en overhead."
  },
  "CORFO Consolida y Expande": {
    "bases_excerpt": "Instrumento «Consolida y Expande» de InnovaChile/CORFO (Res. Exenta N°19/2024). Dirigido a empresas que ya han desarrollado un nuevo o mejorado producto/servicio/proceso innovador y buscan su consolidación en el mercado nacional y/o expansión a mercados internacionales.\n\nEvaluación en dos etapas sucesivas. Los proyectos aprobados en primera etapa pasan a segunda evaluación. Adjudicación limitada a 30 proyectos + grupo de selección de hasta 30 adicionales (50% por método aleatorio para evaluación de impacto DIPRES).\n\nNota mínima por subcriterio: 3,00. Nota final mínima: 3,50. Bonificación del 5% sobre nota final para empresas de menor tamaño con sello Ley N°21.561 (reducción jornada anticipada).",
    "criteria_text": "PRIMERA ETAPA — Notas de 1 a 5:\n• Diagnóstico (10%): problema/desafío/oportunidad claro, coherente, fundado y documentado.\n• Mercado Objetivo (20%): identificación de actores beneficiarios directos e indirectos; impactos sociales/medioambientales; riesgos y barreras comerciales/regulatorias.\n• Metodología (30%): solución claramente descrita; plan de trabajo estructurado (actividades, plazos, hitos); resultados e indicadores claros y cuantificables; presupuesto coherente; dedicación horaria y valor hora coherentes.\n• Grado de novedad y diferenciación (40%): novedad significativa en mercados de destino; valor agregado sobre alternativas existentes; atributos diferenciadores.\n\nSEGUNDA ETAPA — Notas de 1 a 5:\n• Estrategia de Negocio (40%): modelo de ingresos/ahorro adecuado y coherente con mercado; cuantificación objetiva; estrategia de protección de propiedad intelectual.\n• Escalabilidad (30%): estado de avance del producto; ventas realizadas; alcance actual; inversión y clientes.\n• Capacidades — Beneficiario y asociados (30%): capacidades de gestión, técnicas, financieras, infraestructura; equipo de trabajo con experiencia idónea.",
    "requirements_text": "Persona jurídica constituida en Chile. Empresa con giro empresarial primera categoría vigente. Producto/servicio innovador ya desarrollado (listo para consolidar/expandir). Cofinanciamiento según tamaño empresa. Al menos 50% de aportes deben ser «nuevos o pecuniarios». Se verifican requisitos de admisibilidad antes de evaluación.",
    "source_ref": "Bases Técnicas Consolida y Expande — Resolución Exenta N°19/2024, InnovaChile/CORFO",
    "budget_rules": "Cofinanciamiento según tamaño empresa. Al menos 50% de aportes deben ser nuevos/pecuniarios. Partidas similares a CyV: honorarios, subcontratos, equipamiento, operación, viajes, PI, overhead.",
    "approval_patterns": "Proyectos aprobados: fuerte evidencia de tracción comercial (ventas, clientes, contratos); estrategia de negocio cuantificada con proyecciones a 3-5 años; equipo con track record en el mercado objetivo; producto ya en TRL 7+. Novedad y Diferenciación (40%) es el criterio más pesado en primera etapa — necesita diferenciación clara vs competidores nombrados."
  },
  "CORFO Innova Alta Tecnología": {
    "bases_excerpt": "Instrumento «Innova Alta Tecnología» de InnovaChile/CORFO. Objetivo: fomentar el desarrollo de soluciones tecnológicas globales, asociadas a nuevos productos y/o procesos innovadores, de alto valor agregado, sofisticados y con potencial de escalamiento nacional o global. Apoyar innovaciones intensivas en I+D con alta incertidumbre tecnológica.\n\nSubsidio máximo: $1.000.000.000 (mil millones de pesos). Cofinanciamiento: micro/pequeña empresa 70%, mediana 55%, grande 40%. Empresas lideradas por mujeres: hasta +10% adicional (tope subsidio $1.142.857.143).\n\nPlazo ejecución: hasta 48 meses (máx. 60 con prórrogas). Ciclos biológicos: hasta 60 meses (máx. 72).\n\nPostulación en dos fases: Fase 1 (perfil obligatorio con retroalimentación no vinculante) y Fase 2 (postulación a cofinanciamiento).\n\nGasto en I+D debe representar al menos 30% del costo total del proyecto. TRL de entrada: superior a TRL 3 (pruebas de concepto superadas).",
    "criteria_text": "Evaluación con notas de 1 a 5. Nota final mínima: 3,50. Nota mínima por subcriterio: 3,00.\n\nCriterios y ponderaciones:\n• Diagnóstico y análisis tecnológico (15%): problema/desafío claro y coherente; análisis de causas completo; adecuado análisis de inteligencia tecnológica y propiedad intelectual.\n• Mercado Objetivo (10%): adecuada identificación, caracterización y dimensionamiento de usuarios/clientes.\n• Metodología (15%): solución claramente descrita; plan de trabajo correctamente estructurado; resultados cuantificables que den cuenta del avance en TRL; presupuesto coherente; dedicación horaria coherente.\n• Grado de novedad y diferenciación (15%): novedad significativa; atributos diferenciadores sobre soluciones existentes.\n• Beneficios Esperados (10%): modelo de ingresos/ahorro coherente; cuantificación objetiva; impactos sociales y/o medioambientales.\n• Estrategia de continuidad (15%): riesgos y barreras identificados; estrategia de protección de resultados; estrategia de captura de valor; propuesta post-subsidio.\n• Equipo de trabajo (10%): experiencia y capacidades técnicas idóneas. Bonificación +0,2 décimas por contratación de capital humano experto (≥5 años o posgrado, ≥12 meses).\n• Beneficiario y asociados (10%): capacidades de gestión, técnicas, financieras e infraestructura.",
    "requirements_text": "Persona jurídica constituida en Chile con ≥3 años desde inicio actividades en giro primera categoría. Ingresos por ventas acreditados dentro de los 3 años previos. TRL > 3 (pruebas de concepto superadas). I+D ≥ 30% del costo total. Universidades/IP/CFT no pueden ser beneficiarios. Debe haber completado Fase 1 (perfil) y recibido retroalimentación. Plazo máx. 48 meses (60 con prórrogas). Garantía fiel cumplimiento ≥ 30 UF.",
    "source_ref": "Bases Técnicas Innova Alta Tecnología — Resolución Electrónica Exenta N°3, InnovaChile/CORFO",
    "budget_rules": "Subsidio máx. $1.000M. Cofinanciamiento: micro/pequeña 70%, mediana 55%, grande 40%. I+D ≥ 30% del costo total. Partidas: honorarios equipo técnico (valor hora documentado), subcontratos especializados, equipamiento científico, materiales e insumos, viajes técnicos, PI y patentes, overhead (hasta 15%). Garantía fiel cumplimiento ≥ 30 UF.",
    "approval_patterns": "Proyectos aprobados: alta incertidumbre tecnológica demostrada; equipo con PhDs y publicaciones; análisis de inteligencia tecnológica con estado del arte y freedom-to-operate; I+D entre 35-55% del costo total; presupuesto $400M-$900M; horizonte 36-48 meses; estrategia IP con patentes o trade secrets documentados. Estrategia de continuidad (15%) es diferenciador clave."
  },
  "CORFO Semilla Expande": {
    "bases_excerpt": "Instrumento «Semilla Expande» de la Gerencia de Emprendimiento de CORFO. Objetivo: impulsar el desarrollo de emprendimientos dinámicos con potencial de alto crecimiento, promoviendo ecosistemas de emprendimiento a nivel regional y nacional, generando desarrollo sostenible.\n\nEtapa 1: hasta $25.000.000 (subsidio máx.), plazo de hasta 9 meses (no prorrogable). Etapa 2 (Extensión): subsidio adicional hasta $20.000.000.\n\nOverhead Entidad Patrocinadora: Etapa 1 hasta $2.000.000; Etapa 2 hasta 10% del subsidio ($1.500.000–$2.000.000).\n\nRequiere obligatoriamente una Entidad Patrocinadora (incubadora/aceleradora participante CORFO). Equipo emprendedor: al menos 2 personas recomendado. Sostenibilidad (ámbito social y/o ambiental) es criterio evaluado.",
    "criteria_text": "Evaluación con notas de 1,00 a 5,00 (hasta centésima). Bonificación 5% sobre nota final por sello Ley N°21.561.\n\nCriterios y ponderaciones:\n\nINNOVACIÓN (40%):\n• Relevancia del Problema/Oportunidad (15%): grado en que el problema no está siendo resuelto por soluciones actuales; relevancia para el cliente/usuario.\n• Propuesta de Valor (20%): valor agregado vs. competencia; coherencia con temática/desafío del llamado.\n• Estado de Avance (5%): hitos logrados (ventas, tracción, capital levantado, patentes, internacionalización).\n\nESCALABILIDAD (30%):\n• Modelo de Negocios (10%): definiciones para escalamiento acelerado a nuevos mercados.\n• Mercado (10%): identificación de clientes y competencia; tamaño y madurez del mercado; barreras de entrada.\n• Plan de Expansión (5%): plan para despegue comercial, tracción y consolidación de ventas.\n• Sostenibilidad (5%): propuesta de operación sostenible en ámbito social y/o ambiental.\n\nEQUIPO (30%):\n• Capacidad del Equipo (12%): complementariedad, perfil técnico/profesional, experiencia. Se espera al menos 2 integrantes.\n• Compromiso del Equipo (13%): dedicación horaria del equipo emprendedor.\n• Redes y/o Alianzas (5%): pertinencia e idoneidad de redes de contacto y alianzas comerciales.\n\nOrden de prelación en empate: 1° Innovación, 2° Equipo, 3° Propuesta de Valor, 4° Relevancia del Problema.",
    "requirements_text": "Persona jurídica constituida en Chile o persona natural con inicio de actividades en SII. Entidad Patrocinadora obligatoria (incubadora/aceleradora). Equipo emprendedor de al menos 2 personas (recomendado). Ventas acreditadas o tracción demostrable. Limitaciones de participación: no simultaneidad con otros proyectos CORFO del mismo emprendimiento. Etapa 1: 9 meses máx. Subsidio Etapa 1: hasta $25M.",
    "source_ref": "Bases Semilla Expande — Resolución Electrónica Exenta N°135/2024, Gerencia de Emprendimiento, CORFO",
    "budget_rules": "Subsidio Etapa 1: hasta $25M. Etapa 2: hasta $20M adicional. Overhead EP: hasta $2M (Etapa 1), hasta 10% subsidio (Etapa 2). Partidas: honorarios equipo, desarrollo producto, marketing, viajes, propiedad intelectual. No financia compra de activos fijos mayores.",
    "approval_patterns": "Proyectos aprobados: propuesta de valor clara con diferenciación verificable; equipo de 2-4 personas con roles complementarios y dedicación >50%; tracción demostrable (usuarios, ventas, LOIs); modelo de negocio con unit economics básicos; Entidad Patrocinadora reconocida. Innovación (40%) es el criterio más pesado."
  },
  "Startup Chile BUILD": {
    "bases_excerpt": "Programa Startup Chile BUILD de CORFO. Dirigido a startups en etapa de escalamiento con tracción demostrada. Enfoque en competitividad de mercado, equipo y potencial de crecimiento global.\n\nNota: Las bases oficiales de SUC no están incluidas en el corpus de texto extraído actualmente. Los criterios se basan en convocatorias públicas conocidas de Startup Chile.",
    "criteria_text": "Evaluación con notas de 1 a 7. Criterios y ponderaciones aproximadas:\n• Equipo (~40%): experiencia del equipo fundador, complementariedad de habilidades, dedicación, track record.\n• Mercado y Producto: tamaño y accesibilidad del mercado objetivo; producto mínimo viable demostrado.\n• Tracción: métricas de crecimiento (MRR, usuarios, clientes), ventas, capital levantado.\n• Impacto: potencial de impacto económico y social en Chile; contribución al ecosistema.\n• Escalabilidad: modelo de negocio escalable; plan de expansión internacional.\n\nEquipo es el criterio determinante. Evaluar validación comercial por sobre mérito científico puro.",
    "requirements_text": "Startup con producto en mercado. Tracción demostrable (ventas, usuarios, métricas de crecimiento). Equipo dedicado a tiempo completo. Disposición a operar desde Chile durante el programa. Empresa constituida legalmente.",
    "source_ref": "Programa Startup Chile BUILD — CORFO (bases oficiales de convocatoria vigente; criterios basados en información pública de SUC)",
    "budget_rules": "Equity-free funding. Monto fijo por programa. Uso flexible: marketing, desarrollo, viajes, equipo. No requiere cofinanciamiento formal. Rendición simplificada.",
    "approval_patterns": "Startups aprobadas: equipo fundador con experiencia previa en startups o industria relevante; MRR >USD 5K o >1000 usuarios activos; producto en mercado con feedback de clientes; plan de expansión internacional creíble; potencial de impacto en ecosistema chileno."
  },
  "ANID FONDEF": {
    "bases_excerpt": "FONDEF (Fondo de Fomento al Desarrollo Científico y Tecnológico) de ANID. Orientado a proyectos de I+D aplicada con vinculación al sector productivo. Marco ANID exige rigor científico, vinculación con sector productivo y consistencia del plan de trabajo.\n\nNota: Las bases técnicas FONDEF completas no están incluidas en el corpus de texto extraído actualmente. Los criterios reflejan la estructura conocida de concursos FONDEF/ANID (IDeA, FONDEQUIP).",
    "criteria_text": "Evaluación con notas de 1 a 7. Criterios principales:\n• Mérito científico-técnico: calidad, originalidad y rigor de la propuesta de investigación; pertinencia de la metodología.\n• Relevancia: importancia del problema abordado; impacto potencial en el sector productivo.\n• Equipo: calificación y productividad del investigador responsable y equipo; experiencia en I+D.\n• Vinculación: articulación con empresas o entidades del sector productivo; compromisos de adopción de resultados.\n• Plan de trabajo: factibilidad, estructura, cronograma, hitos y presupuesto coherente.\n\nSe requiere Institución Patrocinante (universidad o centro de investigación). Equipamiento financiable hasta $50.000.000.",
    "requirements_text": "Investigador responsable con grado académico y productividad demostrada. Institución Patrocinante obligatoria (universidad/centro de investigación). Vinculación con sector productivo. Plan de trabajo con hitos verificables. Presupuesto dentro de límites establecidos por convocatoria.",
    "source_ref": "Bases FONDEF IDeA / Iniciación en Investigación — ANID (bases concursales genéricas del corpus)",
    "budget_rules": "Presupuesto según línea concursal. Equipamiento hasta $50M. Partidas: honorarios investigadores, asistentes, tesistas; equipamiento científico; materiales; viajes; gastos de operación; overhead institucional (según política ANID).",
    "approval_patterns": "Proyectos aprobados: investigador responsable con publicaciones indexadas y experiencia en el área; vinculación concreta con empresa mandante (carta compromiso, cofinanciamiento); metodología con rigor científico (hipótesis, diseño experimental, análisis estadístico); presupuesto justificado por actividad."
  },
  "NSF SBIR/STTR": {
    "bases_excerpt": "NSF SBIR/STTR Phase I (NSF 24-579). Small Business Innovation Research / Small Business Technology Transfer. Objetivo: apoyar pequeñas empresas en investigación y desarrollo de innovaciones tecnológicas con potencial de comercialización.\n\nNSF busca propuestas que demuestren éxito en tres criterios de revisión: Intellectual Merit, Broader Impacts, y Commercialization Potential.",
    "criteria_text": "Criterios de evaluación NSF SBIR/STTR:\n\n• Intellectual Merit: potencial para avanzar el conocimiento; uso de técnicas fundamentales de ciencia/ingeniería para superar el riesgo técnico. Evaluado mediante Technical Risk (posibilidad real de fracaso técnico) y Technological Innovation (producto diferenciado con ventaja competitiva durable y barrera de entrada para competidores).\n\n• Broader Impacts: beneficio potencial para la sociedad; contribución a resultados sociales deseados según NSF PAPPG.\n\n• Commercialization Potential: viabilidad del modelo de negocio; tamaño de mercado; capacidad del equipo para llevar la innovación al mercado.\n\nEl riesgo técnico asume que existe posibilidad de fracaso incluso para expertos en la materia. La innovación tecnológica implica que el producto resultante tendría una ventaja sustancial y duradera sobre competidores, difícil de neutralizar por ingeniería inversa.",
    "requirements_text": "Small business concern (≤500 empleados, organizada con fines de lucro en EE.UU.). PI debe estar empleado por la small business. SBIR: empresa ejecuta la I+D. STTR: colaboración obligatoria con institución de investigación. Phase I: prueba de concepto y factibilidad técnica.",
    "source_ref": "NSF 24-579: NSF SBIR/STTR Phase I Programs; SBA SBIR/STTR Policy Directive May 2023",
    "budget_rules": "Phase I: hasta USD 275,000 por 6-12 meses. Partidas: salarios y fringe benefits, equipamiento, viajes, suministros, subcontratos (con research institution en STTR), otros directos, indirect costs (rate negociado o de minimis 10%).",
    "approval_patterns": "Propuestas aprobadas: riesgo técnico real y claramente articulado; estado del arte documentado con gap identificado; PI con track record técnico; plan de comercialización con TAM/SAM/SOM; letters of support de clientes potenciales; presupuesto alineado al plan de trabajo; broader impacts más allá de lo comercial."
  }
};

/* ══════════════════════════════════════════════════════════
   FUND CATALOG — inlined from catalogo-fondos-global.json
   Used for budget rules and metadata when RAG is partial.
   ══════════════════════════════════════════════════════════ */

const FUND_CATALOG = {
  "CORFO Crea y Valida":           { monto_max: "CLP 180.000.000", plazo_max: 24, trl_min: 3, escala: "1-5", nota_minima: 3.5 },
  "CORFO Consolida y Expande":     { monto_max: "variable", plazo_max: 24, trl_min: null, escala: "1-5", nota_minima: 3.5 },
  "CORFO Innova Alta Tecnología":  { monto_max: "CLP 1.000.000.000", plazo_max: 48, trl_min: 3, escala: "1-5", nota_minima: 3.5 },
  "CORFO Semilla Expande":         { monto_max: "CLP 25.000.000", plazo_max: 9, trl_min: null, escala: "1-5", nota_minima: null },
  "Startup Chile BUILD":           { monto_max: "CLP 15.000.000", plazo_max: 4, trl_min: null, escala: "1-7", nota_minima: null },
  "ANID FONDEF":                   { monto_max: "CLP 200.000.000", plazo_max: 36, trl_min: null, escala: "1-7", nota_minima: null },
  "NSF SBIR/STTR":                 { monto_max: "USD 275.000", plazo_max: 12, trl_min: null, escala: "merit-review", nota_minima: null },
};

/* ══════════════════════════════════════════════════════════
   SELECT RAG CONTEXT
   ══════════════════════════════════════════════════════════ */

const ragKey = Object.keys(RAG_CONTEXTS).find(k =>
  fondo.toLowerCase().includes(k.toLowerCase()) ||
  k.toLowerCase().includes(fondo.toLowerCase())
) || '';

const rag = ragKey ? RAG_CONTEXTS[ragKey] : null;
const fundMeta = ragKey ? (FUND_CATALOG[ragKey] || {}) : {};

const ragContextUsed = ragKey || 'generic (no specific RAG available)';

/* ══════════════════════════════════════════════════════════
   BUILD PREMIUM PROMPT
   ══════════════════════════════════════════════════════════ */

let ragBlock = '';
if (rag) {
  ragBlock = `
=== BASES OFICIALES DEL INSTRUMENTO: ${ragKey} ===
Fuente: ${rag.source_ref}

EXTRACTO DE BASES:
${rag.bases_excerpt}

CRITERIOS DE EVALUACIÓN Y PONDERACIONES:
${rag.criteria_text}

REQUISITOS DE ADMISIBILIDAD:
${rag.requirements_text}

REGLAS PRESUPUESTARIAS:
${rag.budget_rules || 'No disponibles en detalle.'}

PATRONES DE APROBACIÓN/RECHAZO:
${rag.approval_patterns || 'No disponibles en detalle.'}

METADATA DEL FONDO:
- Monto máximo: ${fundMeta.monto_max || 'variable'}
- Plazo máximo: ${fundMeta.plazo_max || '?'} meses
- TRL mínimo: ${fundMeta.trl_min || 'no especificado'}
- Escala de evaluación: ${fundMeta.escala || '?'}
- Nota mínima aprobación: ${fundMeta.nota_minima || 'no especificada'}
===`;
} else {
  ragBlock = `
=== FONDO SELECCIONADO: ${fondo} ===
No se dispone de bases técnicas detalladas para este instrumento en el corpus RAG.
Genera el análisis con la mejor información disponible y señala explícitamente
dónde el usuario debe verificar con las bases oficiales.
===`;
}

const systemPrompt = `Eres un consultor senior de innovación con +15 años de experiencia evaluando y asesorando postulaciones a fondos públicos de innovación, I+D+i y emprendimiento en Chile, Latinoamérica, EE.UU. y Europa.

Tu tarea: generar un INFORME PREMIUM EXHAUSTIVO que justifique el precio de $89 USD. Este no es un resumen genérico: es una consultoría detallada, específica al fondo y a la propuesta del usuario, organizada por capítulos de valor editorial claro.

CONTEXTO DEL FONDO (bases oficiales):
${ragBlock}

REGLAS DE GENERACIÓN:

1. Todo el informe debe estar en ESPAÑOL.
2. Cada sección debe ser ESPECÍFICA a esta propuesta y este fondo. Prohibido contenido genérico que aplique a cualquier proyecto.
3. Cuando cites criterios, usa los NOMBRES EXACTOS y PONDERACIONES de las bases oficiales proporcionadas arriba.
4. Tono: consultor senior escribiendo para un cliente que paga por asesoría. Directo, fundamentado, sin relleno.
5. Formato: Markdown con headers claros (##) para cada sección.
6. Extensión: 3500-5500 palabras. Cada sección debe tener profundidad real.
7. Cuando no haya suficiente información, señala explícitamente la brecha y qué evidencia debería agregar el postulante.
8. Evita repetir el contenido del informe gratuito; profundiza y expande.

ESTRUCTURA DEL INFORME PREMIUM:

## 1. Análisis de mercado y competencia

- Evalúa tamaño, urgencia y claridad del problema de mercado.
- Analiza competidores directos, sustitutos y diferenciación.
- Contrasta lo declarado por el usuario con lo que exigiría un comité evaluador.
- Cierra con una lectura ejecutiva de la fortaleza comercial de la propuesta.

## 2. Evaluación de I+D y componente técnico

- Examina novedad, desafío tecnológico, TRL y madurez de la solución.
- Usa los criterios exactos del fondo cuando existan componentes de I+D, innovación o mérito técnico.
- Señala vacíos de validación, evidencia técnica faltante y riesgos de factibilidad.
- Incluye una estimación razonada del nivel técnico frente al estándar del instrumento.

## 3. Evaluación de equipo y capacidades

- Analiza experiencia del equipo, complementariedad, dedicación y capacidades del beneficiario.
- Indica si el perfil del equipo es suficiente para ejecutar el proyecto según bases.
- Señala perfiles faltantes, brechas de gobernanza y refuerzos recomendados.

## 4. Metodología y plan de trabajo

- Revisa estructura metodológica, hitos, entregables, indicadores y secuencia lógica.
- Explica si el plan de trabajo es evaluable, creíble y defendible.
- Propón una estructura sugerida de etapas, hitos e indicadores cuando falte claridad.

## 5. Presupuesto (estructura recomendada con % por partida)

Basándote en las reglas presupuestarias del fondo:
| Partida | % sugerido | Monto estimado | Justificación |
- Usa el monto máximo del fondo como referencia
- Incluye: honorarios equipo, subcontratos, equipamiento, operación, viajes, PI, overhead
- Señala límites específicos (ej: overhead máx 15%, subcontratos máx 40%)
- Si el usuario mencionó montos, compáralos con la estructura sugerida

## 6. Checklist de requisitos vs bases oficiales

Para cada requisito formal del fondo:
| Requisito | Estado | Detalle |
Donde Estado es: CUMPLE / NO CUMPLE / INFORMACIÓN INSUFICIENTE
Y Detalle explica por qué, con referencia a lo que dice la propuesta.

Incluir: tipo de persona jurídica, antigüedad, TRL, porcentaje I+D, plazo, montos, equipo, entidad patrocinadora, etc.

## 7. Estrategia de protección IP y continuidad

Basándote en los requisitos del fondo sobre protección de resultados y continuidad:
- Estado actual de PI del proyecto (según lo declarado)
- Estrategia recomendada: patentes, modelos de utilidad, secreto comercial, registro de software
- Cronograma sugerido de protección
- Costos estimados de protección
- Estrategia de continuidad post-subsidio, captura de valor y escalamiento
- Cómo presentar esta sección en la postulación para maximizar puntaje

## 8. Comparativa con proyectos aprobados/rechazados similares

Compara el perfil de esta propuesta contra los patrones de proyectos aprobados y rechazados en este fondo:
- Fortalezas relativas al pool competitivo
- Debilidades relativas al pool competitivo
- Posicionamiento estimado (cuartil superior/medio/inferior)
- Factores diferenciadores que podrían inclinar la balanza
- Riesgos específicos que un evaluador señalaría

## 9. Recomendaciones de redacción (opcional pero valioso)

Solo si hay material suficiente, agrega una sección final corta con 3-5 mejoras de redacción:
- **Sección**: [nombre]
- **Problema detectado**
- **Texto sugerido**
- **Por qué funciona**

IMPORTANTE:
- NO incluyas secciones del informe gratuito (resultado consolidado, juicio experto, diagnóstico general, brechas, ruta de fortalecimiento, resolución del comité). Esas ya existen.
- SÍ incluye las 8 secciones premium listadas arriba, con toda la profundidad posible.
- Cada recomendación debe ser tan específica que el usuario pueda actuar sobre ella sin necesidad de consultoría adicional.`;

const userPrompt = `PROPUESTA A EVALUAR:

Proyecto: ${nombre}
Empresa: ${empresa}
Fondo al que postula: ${fondo}
Nivel de madurez tecnológica (TRL): ${trl}

Texto de la propuesta:
---
${propuesta || '(No se proporcionó texto de propuesta. Genera el análisis con la información disponible y señala que la falta de texto limita la profundidad del análisis en las secciones que lo requieren.)'}
---

Genera el informe premium completo con las 8 secciones definidas en tus instrucciones. Si agregas una novena sección de redacción, déjala al final como valor adicional.`;

const prompt_premium = systemPrompt + '\n\n---\n\nUSER:\n' + userPrompt;

return [{ json: { prompt_premium, rag_context_used: ragContextUsed } }];
