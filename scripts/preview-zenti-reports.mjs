import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'report-previews');
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
  return vm.runInNewContext(wrapped, sandbox, { timeout: 5000, filename: relPath });
}

const preparar = readJson('scripts/zenti-preview-preparar.json');
const consolidar = readJson('scripts/zenti-preview-consolidar.json');
const premiumMarkdown = readText('scripts/zenti-premium-sample.md');

const promptResult = execNodeCode('workflows/zenti-node-code/prompt-premium-report.js', {
  namedNodes: {
    '⚙️ Preparar Datos': { json: preparar, binary: {} },
  },
});

const freeResult = execNodeCode('workflows/zenti-node-code/render-html-premium.js', {
  inputJson: consolidar,
});

const premiumResult = execNodeCode('workflows/zenti-node-code/render-premium-report.js', {
  inputJson: { text: premiumMarkdown },
  namedNodes: {
    '📦 Consolidar': { json: consolidar, binary: {} },
  },
});

const promptText = promptResult?.[0]?.json?.prompt_premium || '';
const freeHtml = freeResult?.[0]?.json?.html || '';
const premiumHtml = premiumResult?.[0]?.json?.html || '';
const sectionsFound = premiumResult?.[0]?.json?.premium_sections_found || [];
const missingSections = premiumResult?.[0]?.json?.premium_missing_sections || [];

fs.writeFileSync(path.join(outDir, 'premium-prompt-preview.txt'), promptText, 'utf8');
fs.writeFileSync(path.join(outDir, 'free-report-preview.html'), freeHtml, 'utf8');
fs.writeFileSync(path.join(outDir, 'premium-report-preview.html'), premiumHtml, 'utf8');

console.log('Preview files generated:');
console.log('-', path.join(outDir, 'premium-prompt-preview.txt'));
console.log('-', path.join(outDir, 'free-report-preview.html'));
console.log('-', path.join(outDir, 'premium-report-preview.html'));
console.log('Premium sections found:', sectionsFound.join(', ') || '(none)');
console.log('Premium sections missing:', missingSections.join(', ') || '(none)');
