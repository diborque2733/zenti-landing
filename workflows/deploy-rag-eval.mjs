/**
 * Deploy RAG integration to ZENTI.eval workflow.
 * Updates: ⚙️ Preparar Datos (jsCode) + 🧠 Generar Evaluación (LLM prompt)
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE = 'https://zenti.app.n8n.cloud';
const API_KEY = process.env.N8N_API_KEY;
const WF_ID = 'oabhou5V20poYB55';
const HEADERS = {
  'X-N8N-API-KEY': API_KEY,
  'Content-Type': 'application/json',
};

const CODE_NODE_NAME = '⚙️ Preparar Datos';
const LLM_NODE_NAME = '🧠 Generar Evaluación (Anthropic)';

const ALLOWED_SETTINGS = new Set([
  'executionOrder', 'errorWorkflow', 'timezone',
  'saveManualExecutions',
]);

async function main() {
  if (!API_KEY) throw new Error('N8N_API_KEY env var required');

  // 1. GET workflow
  console.log('→ Fetching workflow…');
  const getRes = await fetch(`${BASE}/api/v1/workflows/${WF_ID}`, { headers: HEADERS });
  if (!getRes.ok) throw new Error(`GET failed: ${getRes.status} ${await getRes.text()}`);
  const wf = await getRes.json();
  console.log(`  name: ${wf.name}, active: ${wf.active}, nodes: ${wf.nodes.length}`);

  // 2. Read local preparar-datos.js
  const jsCode = readFileSync(resolve(__dirname, 'zenti-node-code/preparar-datos.js'), 'utf8');

  // 3. Find and patch ⚙️ Preparar Datos
  const codeNode = wf.nodes.find(n => n.name === CODE_NODE_NAME);
  if (!codeNode) throw new Error(`Node "${CODE_NODE_NAME}" not found`);
  console.log(`→ Patching "${CODE_NODE_NAME}" jsCode (${jsCode.length} chars)…`);
  codeNode.parameters.jsCode = jsCode;

  // 4. Find and patch 🧠 Generar Evaluación prompt
  const llmNode = wf.nodes.find(n => n.name === LLM_NODE_NAME);
  if (!llmNode) throw new Error(`Node "${LLM_NODE_NAME}" not found`);

  const oldPrompt = llmNode.parameters.text;
  console.log(`→ Current LLM prompt length: ${oldPrompt.length} chars`);

  const ragBlock = [
    '',
    '{{ $json.rag_context.has_rag ? "\\nBASES OFICIALES DEL INSTRUMENTO (cita estos requisitos en tu evaluación):\\n" + $json.rag_context.criteria_text + "\\n\\nRESUMEN DEL INSTRUMENTO:\\n" + $json.rag_context.bases_excerpt + "\\n\\nREQUISITOS DE ADMISIBILIDAD:\\n" + $json.rag_context.requirements_text + "\\n\\nFUENTE: " + $json.rag_context.source_ref : "" }}',
    '',
  ].join('\n');

  const anchor = '- Reglas/pesos fondo (JSON): {{JSON.stringify($json.config)}}';
  if (!oldPrompt.includes(anchor)) throw new Error('Anchor text not found in prompt');

  const newPrompt = oldPrompt.replace(
    anchor,
    anchor + ragBlock,
  );

  llmNode.parameters.text = newPrompt;
  console.log(`→ New LLM prompt length: ${newPrompt.length} chars`);

  // 5. Filter settings
  const filteredSettings = {};
  if (wf.settings) {
    for (const [k, v] of Object.entries(wf.settings)) {
      if (ALLOWED_SETTINGS.has(k)) filteredSettings[k] = v;
    }
  }

  // 6. Build PUT body
  const putBody = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: filteredSettings,
  };

  // 7. Deactivate first if active
  if (wf.active) {
    console.log('→ Deactivating workflow…');
    const deactRes = await fetch(`${BASE}/api/v1/workflows/${WF_ID}/deactivate`, {
      method: 'POST',
      headers: HEADERS,
    });
    if (!deactRes.ok) console.warn(`  deactivate warn: ${deactRes.status}`);
    else console.log('  deactivated');
  }

  // 8. PUT workflow
  console.log('→ Deploying workflow…');
  const putRes = await fetch(`${BASE}/api/v1/workflows/${WF_ID}`, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify(putBody),
  });
  if (!putRes.ok) throw new Error(`PUT failed: ${putRes.status} ${await putRes.text()}`);
  const updated = await putRes.json();
  console.log(`  updated: ${updated.name}`);

  // 9. Reactivate
  console.log('→ Reactivating workflow…');
  const actRes = await fetch(`${BASE}/api/v1/workflows/${WF_ID}/activate`, {
    method: 'POST',
    headers: HEADERS,
  });
  if (!actRes.ok) throw new Error(`Activate failed: ${actRes.status} ${await actRes.text()}`);
  console.log('  reactivated ✓');

  // 10. Print prompt excerpt
  const promptLines = newPrompt.split('\\n');
  const ragStart = newPrompt.indexOf('rag_context.has_rag');
  const ragExcerpt = newPrompt.substring(ragStart - 20, ragStart + 300);
  console.log('\n─── RAG section excerpt ───');
  console.log(ragExcerpt);
  console.log('───────────────────────────');
  console.log('\nDeployment complete.');
}

main().catch(err => {
  console.error('DEPLOY ERROR:', err.message);
  process.exit(1);
});
