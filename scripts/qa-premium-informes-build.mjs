/**
 * Genera artefactos HTML/txt para QA del informe premium (sin n8n ni LLM).
 * Salida: qa-premium-informes/
 *
 * Uso: node scripts/qa-premium-informes-build.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'qa-premium-informes');
fs.mkdirSync(outDir, { recursive: true });

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}

function readText(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function execNodeCode(relPath, { inputJson = {}, inputBinary = {}, namedNodes = {} } = {}) {
  const code = readText(relPath);
  const wrapped = `(function(){\n${code}\n})()`;
  const sandbox = {
    console,
    Buffer,
    $input: {
      first() {
        return { json: inputJson, binary: inputBinary };
      },
    },
    $(name) {
      const nodeValue = namedNodes[name] || { json: {}, binary: {} };
      return {
        first() {
          return nodeValue;
        },
      };
    },
  };
  return vm.runInNewContext(wrapped, sandbox, { timeout: 8000, filename: relPath });
}

function writeOut(name, content) {
  const p = path.join(outDir, name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

const preparar = readJson('scripts/zenti-preview-preparar.json');
const consolidar = readJson('scripts/zenti-preview-consolidar.json');
const premiumFullMd = readText('scripts/zenti-premium-sample.md');
const premiumPartialMd = readText('scripts/zenti-premium-sample-parcial.md');

const promptResult = execNodeCode('workflows/zenti-node-code/prompt-premium-report.js', {
  namedNodes: {
    '⚙️ Preparar Datos': { json: preparar, binary: {} },
  },
});

const freeResult = execNodeCode('workflows/zenti-node-code/render-html-premium.js', {
  inputJson: consolidar,
});

const premiumFullResult = execNodeCode('workflows/zenti-node-code/render-premium-report.js', {
  inputJson: { text: premiumFullMd },
  namedNodes: {
    '📦 Consolidar': { json: consolidar, binary: {} },
  },
});

const premiumPartialResult = execNodeCode('workflows/zenti-node-code/render-premium-report.js', {
  inputJson: { text: premiumPartialMd },
  namedNodes: {
    '📦 Consolidar': { json: consolidar, binary: {} },
  },
});

const promptText = promptResult?.[0]?.json?.prompt_premium || '';
const freeHtml = freeResult?.[0]?.json?.html || '';
const premiumFullHtml = premiumFullResult?.[0]?.json?.html || '';
const premiumPartialHtml = premiumPartialResult?.[0]?.json?.html || '';

const metaFull = {
  premium_sections_found: premiumFullResult?.[0]?.json?.premium_sections_found || [],
  premium_missing_sections: premiumFullResult?.[0]?.json?.premium_missing_sections || [],
};
const metaPartial = {
  premium_sections_found: premiumPartialResult?.[0]?.json?.premium_sections_found || [],
  premium_missing_sections: premiumPartialResult?.[0]?.json?.premium_missing_sections || [],
};

const stamp = new Date().toISOString();

writeOut('01-informe-premium-completo-geo-sentinel.html', premiumFullHtml);
writeOut('02-informe-gratuito-solo-scorecard.html', freeHtml);
writeOut('03-prompt-llm-premium-para-anthropic.txt', promptText);
writeOut('04-informe-premium-secciones-parciales-qa.html', premiumPartialHtml);

const metadata = {
  generado_en: stamp,
  fuente: 'scripts/qa-premium-informes-build.mjs (sin LLM; markdown de muestra)',
  archivos: [
    {
      archivo: '01-informe-premium-completo-geo-sentinel.html',
      descripcion: 'Las 9 secciones premium + bloque free (GeoSentinel / Crea y Valida)',
      ...metaFull,
    },
    {
      archivo: '02-informe-gratuito-solo-scorecard.html',
      descripcion: 'Solo capa gratuita (render-html-premium) para comparar',
    },
    {
      archivo: '03-prompt-llm-premium-para-anthropic.txt',
      descripcion: 'Prompt que usaría el nodo Code en n8n antes del LLM premium',
    },
    {
      archivo: '04-informe-premium-secciones-parciales-qa.html',
      descripcion: 'Markdown corto: verifica secciones faltantes y layout',
      ...metaPartial,
    },
  ],
};

writeOut('00-metadata-qa.json', JSON.stringify(metadata, null, 2));

console.log('QA premium informes generados en:', outDir);
for (const f of metadata.archivos) {
  console.log(' -', f.archivo);
}
console.log('Secciones (completo) encontradas:', metaFull.premium_sections_found.join(', ') || '(ninguna)');
console.log('Secciones (completo) faltantes:', metaFull.premium_missing_sections.join(', ') || '(ninguna)');
console.log('Secciones (parcial) faltantes:', metaPartial.premium_missing_sections.join(', ') || '(ninguna)');
