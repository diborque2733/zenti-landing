/**
 * Nodo: 📥 Descargar reporte.html
 * Entrada: salida del nodo **📄 PDFShift → PDF** (HTTP Request con respuesta binaria en `data`).
 * Si hay PDF válido en `binary.data` → pasa el binario tal cual para Drive/Gmail.
 * Si no (fallo PDFShift, credencial o red) → mismo HTML UTF-8 que antes (fallback).
 * El HTML para fallback se intenta leer primero desde **🖥️ Render Premium Report**
 * y luego desde **🖥️ Render HTML Reporte** para poder reutilizar el nodo en ambos flujos.
 *
 * Compatibilidad: soporta binaryMode "default" (base64 inline) y "separate" (filesystem-v2),
 * detectando PDF por metadata (mimeType/fileExtension) sin requerir decodificación del buffer.
 */
function pickRenderHtml() {
  const candidateNodes = ['🖥️ Render Premium Report', '🖥️ Render HTML Reporte'];
  for (const nodeName of candidateNodes) {
    try {
      const html = $(nodeName).first().json?.html || '';
      if (html) return html;
    } catch (_) {}
  }
  return '';
}

const html = pickRenderHtml();
const consolidar = $('📦 Consolidar').first().json;
const nombreProyecto = consolidar.nombre || '';

function htmlItem(extra = {}) {
  const safeName = (nombreProyecto || 'proyecto')
    .replace(/[^\w\dáéíóúñÁÉÍÓÚÑ\s-]/gi, '')
    .trim()
    .slice(0, 40)
    .replace(/\s+/g, '-');
  const slug = safeName || 'evaluacion';
  const fileName = `ZENTI-evaluacion-${slug}.html`;
  const buf = Buffer.from(html, 'utf8');
  return [
    {
      json: {
        mensaje: 'Descarga: ' + fileName,
        nombre_proyecto: nombreProyecto,
        formato_entrega: 'html',
        ...extra,
      },
      binary: {
        data: {
          data: buf.toString('base64'),
          mimeType: 'text/html',
          fileExtension: 'html',
          fileName,
        },
      },
    },
  ];
}

const item = $input.first();
const bin = item.binary?.data;

const isPdfByMeta =
  bin &&
  (bin.mimeType?.includes('pdf') || bin.fileExtension === 'pdf');

let isPdfByContent = false;
if (bin?.data && !isPdfByMeta) {
  try {
    const buf = Buffer.from(bin.data, 'base64');
    isPdfByContent = buf.length >= 200 && buf.slice(0, 4).toString() === '%PDF';
  } catch (_) {}
}

if (isPdfByMeta || isPdfByContent) {
  return [
    {
      json: {
        mensaje: 'Descarga: ZENTI-evaluacion.pdf',
        nombre_proyecto: nombreProyecto,
        formato_entrega: 'pdf',
      },
      binary: {
        data: bin,
      },
    },
  ];
}

if (!html) {
  throw new Error('No hay HTML del reporte. Revisa el nodo de render (free/premium) y la cadena PDFShift.');
}

const errMsg =
  item.json?.error?.message ||
  item.json?.error?.description ||
  item.json?.error ||
  item.json?.message ||
  '';
const fallback = htmlItem(
  errMsg
    ? {
        mensaje: 'HTML (PDFShift falló; revisa clave, créditos o dominio permitido en la credencial)',
        pdf_error: String(errMsg).slice(0, 500),
      }
    : {
        mensaje: 'HTML (sin PDF de PDFShift; revisa nodo HTTP y credencial HTTP Basic)',
      },
);
fallback[0].json.formato_entrega = 'html';
return fallback;
