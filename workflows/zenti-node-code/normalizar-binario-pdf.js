/**
 * Nodo: 🧷 Normalizar binario PDF
 *
 * Estandariza la referencia al archivo adjunto para que el nodo
 * de extracción lo encuentre independientemente del campo de origen.
 * Si no se adjuntó documento, el flujo continúa sin interrupción.
 */
const item = $input.first();
const bins = item.binary || {};
const keys = Object.keys(bins);

if (keys.length === 0) {
  return [{ json: { ...item.json, _pdf_present: false } }];
}

const sourceKey = keys.includes('data') ? 'data' : keys[0];
const bin = bins[sourceKey];

const out = {
  json: {
    ...item.json,
    _pdf_present: true,
    _pdf_source_key: sourceKey,
    _pdf_mime: bin.mimeType || 'application/octet-stream',
    _pdf_name: bin.fileName || 'archivo.pdf',
  },
  binary: { data: bin },
};

return [out];
