/**
 * Nodo: 🔗 Preparar entrega email
 *
 * Correo ejecutivo advisory. Naming oficial ZENTI.
 * Lee datos pre-extraídos de 📦 Consolidar.
 * Tokens: #111 · #F26C22 · #444 · #9CA3AF · #E5E7EB · #F3F4F6
 */
const c = $('📦 Consolidar').first().json;
const d = $input.first().json;

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Data ──────────────────────────────────────────────── */

const fileId =
  d.id ||
  d.fileId ||
  d.file_id ||
  (d.data && d.data.id) ||
  '';
let link =
  d.webViewLink ||
  d.webContentLink ||
  d.webLink ||
  d.viewLink ||
  '';
if (!link && fileId) {
  const idClean = String(fileId).replace(/[^a-zA-Z0-9_-]/g, '');
  if (idClean) link = `https://drive.google.com/file/d/${idClean}/view`;
}
if (!link) link = c.link_vista_previa_get || '';

const linkDownload = d.webContentLink || '';

const nombreCorto     = String(c.nombre || 'equipo').split(/\s+/)[0];
const proyectoNombre  = c.nombre || 'tu proyecto';
const metrics         = c.metrics         || {};
const recomendaciones = c.recomendaciones || [];

const veredicto = metrics.veredicto    || '';
const notaFinal = metrics.notaFinal    || '';
const probNum   = metrics.probabilidad || 0;
const resumen   = metrics.resumen      || metrics.justificacion || '';
const topReco   = recomendaciones[0]   || '';

const descItem  = $('📥 Descargar reporte.html').first();
let attachBin   = descItem.binary;
const fmt       = descItem.json.formato_entrega || 'html';

/** Gmail usa fileName / mimeType; si faltan, algunos clientes no dejan abrir el adjunto bien. */
function normalizeBinary(bin, formato) {
  const ext = formato === 'pdf' ? 'pdf' : 'html';
  const mime = formato === 'pdf' ? 'application/pdf' : 'text/html';
  const fallbackName =
    formato === 'pdf' ? 'ZENTI-evaluacion.pdf' : 'ZENTI-evaluacion.html';
  if (bin && bin.data && bin.data.data) {
    const b = bin.data;
    return {
      data: {
        data: b.data,
        mimeType: b.mimeType || mime,
        fileExtension: b.fileExtension || ext,
        fileName: b.fileName || fallbackName,
      },
    };
  }
  return null;
}

let normalizedBin = normalizeBinary(attachBin, fmt);
if (!normalizedBin) {
  let html = '';
  try {
    html = $('🖥️ Render HTML Reporte').first().json.html || '';
  } catch (_) {}
  if (html) {
    const buf = Buffer.from(html, 'utf8');
    normalizedBin = {
      data: {
        data: buf.toString('base64'),
        mimeType: 'text/html',
        fileExtension: 'html',
        fileName: 'ZENTI-evaluacion.html',
      },
    };
  }
}
attachBin = normalizedBin || {};
if (!attachBin.data || !attachBin.data.data) {
  throw new Error(
    'ZENTI: no hay archivo para adjuntar (revisa nodos Descargar reporte, PDFShift y Subir a Drive en esta ejecucion).',
  );
}

const subject = `ZENTI | Resultado de evaluaci\u00f3n estrat\u00e9gica \u2014 ${proyectoNombre}`;

const LINK_PREMIUM_USD = 'https://zentigrants.com/#pricing';
const LINK_PREMIUM_CLP = 'https://www.flow.cl/uri/JSbQZ7S1H';

/* ── Email HTML ────────────────────────────────────────── */

const email_html = `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0;padding:32px 12px;background:#F3F4F6;font-family:'Inter',ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111111;line-height:1.55">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB">

      <!-- HEADER -->
      <tr><td style="background:#111111;color:#ffffff;padding:28px 32px">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;padding-right:14px">
            <div style="width:42px;height:42px;border-radius:12px;background:#F26C22;text-align:center;line-height:42px">
              <span style="font-size:20px;font-weight:900;color:#111111">Z</span>
            </div>
          </td>
          <td style="vertical-align:middle">
            <div style="font-size:14px;font-weight:800;letter-spacing:.18em;color:#ffffff">ZENTI</div>
            <div style="font-size:11px;color:rgba(255,255,255,.6);margin-top:3px;letter-spacing:.04em">Evaluaci\u00f3n \u00b7 Optimizaci\u00f3n \u00b7 Postulaci\u00f3n</div>
          </td>
        </tr></table>
      </td></tr>

      <!-- BODY -->
      <tr><td style="padding:36px 32px 32px">

        <p style="margin:0 0 20px;font-size:16px;color:#111111">Estimado <strong>${esc(nombreCorto)}</strong>,</p>
        <p style="margin:0 0 28px;font-size:14px;color:#444444;line-height:1.7">
          La evaluaci\u00f3n t\u00e9cnico-estrat\u00e9gica de <strong>${esc(proyectoNombre)}</strong> ha concluido. A continuaci\u00f3n presentamos el resultado consolidado y nuestro juicio experto sobre la competitividad de la postulaci\u00f3n.
        </p>

        <!-- RESULTADO CONSOLIDADO -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px">
          <tr><td style="background:#F3F4F6;border:1px solid #E5E7EB;border-radius:10px;padding:24px 28px">

            <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9CA3AF;margin-bottom:16px">Resultado consolidado</div>

            ${notaFinal ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 12px">
              <tr><td style="font-size:12px;color:#9CA3AF;font-weight:600;letter-spacing:.05em;text-transform:uppercase;padding-bottom:4px">Nota final</td></tr>
              <tr><td style="font-size:22px;font-weight:700;color:#F26C22;padding-bottom:16px">${esc(notaFinal)}</td></tr>
            </table>` : ''}

            ${veredicto ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px">
              <tr><td style="font-size:12px;color:#9CA3AF;font-weight:600;letter-spacing:.05em;text-transform:uppercase;padding-bottom:4px">Veredicto</td></tr>
              <tr><td style="font-size:15px;font-weight:600;color:#111111;line-height:1.4">${esc(veredicto)}</td></tr>
            </table>` : ''}

            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="font-size:12px;color:#9CA3AF;font-weight:600;letter-spacing:.05em;text-transform:uppercase;padding-bottom:6px">Estimaci\u00f3n de adjudicaci\u00f3n</td>
                <td align="right" style="font-size:18px;font-weight:700;color:#F26C22;padding-bottom:6px">${probNum}%</td>
              </tr>
              <tr><td colspan="2" style="padding:0">
                <div style="height:6px;width:100%;border-radius:3px;background:#E5E7EB;overflow:hidden">
                  <div style="height:100%;width:${probNum}%;background:#F26C22;border-radius:3px"></div>
                </div>
              </td></tr>
            </table>

          </td></tr>
        </table>

        <!-- JUICIO EXPERTO -->
        ${resumen ? `<div style="border:1px solid #E5E7EB;border-left:4px solid #F26C22;border-radius:8px;padding:20px 24px;margin:0 0 28px">
          <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9CA3AF;margin-bottom:10px">Juicio experto ZENTI</div>
          <p style="margin:0;font-size:14px;color:#444444;line-height:1.7">${esc(resumen.length > 500 ? resumen.slice(0, 497) + '...' : resumen)}</p>
        </div>` : ''}

        <!-- CTA Drive + enlace en texto plano (Gmail m\u00f3vil a veces rompe botones; href vac\u00edo = no abre nada) -->
        ${link ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px">
          <tr><td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr><td style="border-radius:8px;background:#F26C22">
                <a href="${esc(link)}" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:.02em">Revisar evaluaci\u00f3n en Drive</a>
              </td></tr>
            </table>
          </td></tr>
        </table>
        <p style="margin:0 0 20px;font-size:12px;color:#6B7280;line-height:1.6;word-break:break-all">
          Si el bot\u00f3n no abre, copi\u00e1 este enlace en el navegador:<br/>
          <a href="${esc(link)}" style="color:#F26C22;font-weight:600">${esc(link)}</a>
        </p>` : `<p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.65">
          <strong>Informe adjunto a este correo</strong> (${fmt === 'pdf' ? 'PDF' : 'HTML'}). Si no ves el archivo, revis\u00e1 la secci\u00f3n de adjuntos del correo (icono de clip) y la carpeta Spam.
        </p>`}
        ${linkDownload ? `<p style="margin:0 0 20px;font-size:12px;color:#6B7280;line-height:1.6;word-break:break-all">
          Descarga directa (si Drive lo permite):<br/>
          <a href="${esc(linkDownload)}" style="color:#F26C22;font-weight:600">${esc(linkDownload)}</a>
        </p>` : ''}

        <!-- PREMIUM UPGRADE -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px">
          <tr><td style="background:#FEF3EC;border:1px solid #F26C22;border-radius:10px;padding:20px 24px;text-align:center">
            <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#F26C22;margin-bottom:8px">Informe premium</div>
            <p style="margin:0 0 14px;font-size:14px;color:#444444;line-height:1.55">Mercado, I+D, equipo, metodolog\u00eda, presupuesto, checklist y comparativa en un solo informe premium.</p>
            <a href="${esc(LINK_PREMIUM_USD)}" style="display:inline-block;padding:12px 24px;background:#F26C22;color:#ffffff;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;margin:4px">$89 USD (tarjeta internacional)</a>
            <a href="${esc(LINK_PREMIUM_CLP)}" style="display:inline-block;padding:12px 24px;margin:4px;border:1px solid #F26C22;color:#F26C22;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">$80.000 CLP</a>
          </td></tr>
        </table>

        <!-- RUTA DE FORTALECIMIENTO -->
        ${topReco ? `<div style="margin:0 0 28px">
          <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9CA3AF;margin-bottom:8px">Ruta de fortalecimiento recomendada</div>
          <p style="margin:0;font-size:14px;color:#444444;line-height:1.65">${esc(topReco)}</p>
          ${recomendaciones[1] ? `<p style="margin:10px 0 0;font-size:14px;color:#444444;line-height:1.65">${esc(recomendaciones[1])}</p>` : ''}
        </div>` : ''}

        <p style="margin:0 0 24px;font-size:14px;color:#444444;line-height:1.65">
          El informe ejecutivo contiene el diagn\u00f3stico de competitividad completo, las brechas cr\u00edticas identificadas y la ruta de fortalecimiento detallada. Recomendamos revisarlo antes de avanzar con la postulaci\u00f3n formal.
        </p>
        <p style="margin:0 0 24px;font-size:12px;color:#9CA3AF;line-height:1.55">
          <strong>Adjunto HTML:</strong> descarg\u00e1 el archivo y abrilo con <strong>Chrome, Safari o Edge</strong> (no con Bloc de notas ni vista previa sin navegador). Con <strong>PDF</strong> pod\u00e9s abrirlo con cualquier lector.
        </p>

        <!-- CONSULTORIA CTA -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px">
          <tr><td style="background:#F3F4F6;border:1px solid #E5E7EB;border-radius:10px;padding:20px 24px;text-align:center">
            <p style="margin:0 0 12px;font-size:14px;color:#444444;line-height:1.6">\u00bfNecesita apoyo para fortalecer la postulaci\u00f3n?</p>
            <a href="https://cal.com/zenti" style="display:inline-block;padding:12px 28px;background:#F26C22;color:#ffffff;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">Agendar consultor\u00eda estrat\u00e9gica</a>
          </td></tr>
        </table>

      </td></tr>

      <!-- DIVIDER -->
      <tr><td style="padding:0 32px"><div style="height:1px;background:#E5E7EB"></div></td></tr>

      <!-- SIGNATURE -->
      <tr><td style="padding:24px 32px 28px">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;padding-right:12px">
            <div style="width:32px;height:32px;border-radius:8px;background:#F26C22;text-align:center;line-height:32px">
              <span style="font-size:14px;font-weight:900;color:#111111">Z</span>
            </div>
          </td>
          <td style="vertical-align:middle">
            <div style="font-size:13px;font-weight:700;color:#111111;letter-spacing:.06em">ZENTI</div>
            <div style="font-size:12px;color:#9CA3AF;line-height:1.4">Evaluaci\u00f3n t\u00e9cnico-estrat\u00e9gica<br/>de postulaciones a fondos de innovaci\u00f3n</div>
          </td>
        </tr></table>
      </td></tr>

    </table>
  </td></tr>
</table>`;

return [
  {
    json: {
      ...c,
      drive_link: link,
      drive_download_link: linkDownload || null,
      email_subject: subject,
      email_html,
      formato_entrega: fmt,
    },
    binary: attachBin,
  },
];
