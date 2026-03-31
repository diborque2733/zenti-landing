/**
 * Nodo: 🔗 Preparar entrega email (Diag)
 *
 * Correo ejecutivo advisory para diagnóstico ZENTI.
 * Lee datos pre-extraídos de 📦 Consolidar Diagnóstico.
 * Tokens: #111 · #F26C22 · #444 · #9CA3AF · #E5E7EB · #F3F4F6
 */
const c = $('📦 Consolidar Diagnóstico').first().json;
const d = $input.first().json;

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const fileId = d.id || d.fileId || d.file_id || (d.data && d.data.id) || '';
let link = d.webViewLink || d.webContentLink || d.webLink || d.viewLink || '';
if (!link && fileId) {
  const idClean = String(fileId).replace(/[^a-zA-Z0-9_-]/g, '');
  if (idClean) link = `https://drive.google.com/file/d/${idClean}/view`;
}
const linkDownload = d.webContentLink || '';

const nombreCorto     = String(c.nombre || 'equipo').split(/\s+/)[0];
const proyectoNombre  = c.nombre || 'tu proyecto';
const completitud     = c.completitud || 0;
const fortalezas      = c.fortalezas      || [];
const brechas         = c.brechas         || [];
const recomendaciones = c.recomendaciones || [];
const topReco         = recomendaciones[0] || '';

const descItem  = $('📥 Descargar reporte Diag').first();
let attachBin   = descItem.binary;
const fmt       = descItem.json.formato_entrega || 'html';

function normalizeBinary(bin, formato) {
  const ext = formato === 'pdf' ? 'pdf' : 'html';
  const mime = formato === 'pdf' ? 'application/pdf' : 'text/html';
  const fallbackName =
    formato === 'pdf' ? 'ZENTI-diagnostico.pdf' : 'ZENTI-diagnostico.html';
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
    html = $('🖥️ Render HTML Diagnóstico').first().json.html || '';
  } catch (_) {}
  if (html) {
    const buf = Buffer.from(html, 'utf8');
    normalizedBin = {
      data: {
        data: buf.toString('base64'),
        mimeType: 'text/html',
        fileExtension: 'html',
        fileName: 'ZENTI-diagnostico.html',
      },
    };
  }
}
attachBin = normalizedBin || {};
if (!attachBin.data || !attachBin.data.data) {
  throw new Error(
    'ZENTI diag: no hay archivo para adjuntar (revisa Descargar reporte Diag, PDFShift y Subir a Drive).',
  );
}

const subject = `ZENTI | Diagnóstico estratégico — ${proyectoNombre}`;

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
            <div style="font-size:11px;color:rgba(255,255,255,.6);margin-top:3px;letter-spacing:.04em">Diagnóstico · Investigación · Postulación</div>
          </td>
        </tr></table>
      </td></tr>

      <!-- BODY -->
      <tr><td style="padding:36px 32px 32px">

        <p style="margin:0 0 20px;font-size:16px;color:#111111">Estimado <strong>${esc(nombreCorto)}</strong>,</p>
        <p style="margin:0 0 28px;font-size:14px;color:#444444;line-height:1.7">
          El diagnóstico estratégico de <strong>${esc(proyectoNombre)}</strong> ha concluido. A continuación presentamos el resultado consolidado con el análisis del problema, brecha de innovación y solución articulada.
        </p>

        <!-- RESULTADO -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px">
          <tr><td style="background:#F3F4F6;border:1px solid #E5E7EB;border-radius:10px;padding:24px 28px">

            <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9CA3AF;margin-bottom:16px">Resultado del diagnóstico</div>

            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 12px">
              <tr><td style="font-size:12px;color:#9CA3AF;font-weight:600;letter-spacing:.05em;text-transform:uppercase;padding-bottom:4px">Completitud</td></tr>
              <tr><td style="font-size:22px;font-weight:700;color:#F26C22;padding-bottom:16px">${completitud}%</td></tr>
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="font-size:12px;color:#9CA3AF;font-weight:600;letter-spacing:.05em;text-transform:uppercase;padding-bottom:6px">Áreas diagnosticadas</td>
                <td align="right" style="font-size:18px;font-weight:700;color:#F26C22;padding-bottom:6px">${fortalezas.length}/7</td>
              </tr>
              <tr><td colspan="2" style="padding:0">
                <div style="height:6px;width:100%;border-radius:3px;background:#E5E7EB;overflow:hidden">
                  <div style="height:100%;width:${completitud}%;background:#F26C22;border-radius:3px"></div>
                </div>
              </td></tr>
            </table>

          </td></tr>
        </table>

        <!-- BRECHAS -->
        ${brechas.length > 0 ? `<div style="border:1px solid #E5E7EB;border-left:4px solid #F26C22;border-radius:8px;padding:20px 24px;margin:0 0 28px">
          <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9CA3AF;margin-bottom:10px">Brechas detectadas</div>
          ${brechas.slice(0, 3).map(b => `<p style="margin:0 0 8px;font-size:14px;color:#444444;line-height:1.7">• ${esc(b)}</p>`).join('')}
        </div>` : `<div style="border:1px solid #E5E7EB;border-left:4px solid #059669;border-radius:8px;padding:20px 24px;margin:0 0 28px">
          <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9CA3AF;margin-bottom:10px">Estado</div>
          <p style="margin:0;font-size:14px;color:#444444;line-height:1.7">Sin brechas críticas. El diagnóstico está completo para avanzar a la siguiente fase.</p>
        </div>`}

        <!-- CTA -->
        ${link ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px">
          <tr><td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr><td style="border-radius:8px;background:#F26C22">
                <a href="${esc(link)}" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:.02em">Revisar diagn\u00f3stico en Drive</a>
              </td></tr>
            </table>
          </td></tr>
        </table>
        <p style="margin:0 0 20px;font-size:12px;color:#6B7280;line-height:1.6;word-break:break-all">
          Si el bot\u00f3n no abre, copi\u00e1 este enlace:<br/>
          <a href="${esc(link)}" style="color:#F26C22;font-weight:600">${esc(link)}</a>
        </p>` : `<p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.65"><strong>Informe adjunto</strong> (${fmt === 'pdf' ? 'PDF' : 'HTML'}). Revis\u00e1 adjuntos y Spam.</p>`}
        ${linkDownload ? `<p style="margin:0 0 20px;font-size:12px;color:#6B7280;word-break:break-all">Descarga directa: <a href="${esc(linkDownload)}" style="color:#F26C22;font-weight:600">${esc(linkDownload)}</a></p>` : ''}

        <!-- RECOMENDACIÓN -->
        ${topReco ? `<div style="margin:0 0 28px">
          <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9CA3AF;margin-bottom:8px">Siguiente paso recomendado</div>
          <p style="margin:0;font-size:14px;color:#444444;line-height:1.65">${esc(topReco)}</p>
        </div>` : ''}

        <p style="margin:0;font-size:14px;color:#444444;line-height:1.65">
          El informe contiene el análisis completo del problema, causa raíz, brecha de innovación y articulación de la solución. Este diagnóstico es la base para los módulos de Research, Market y Framework.
        </p>
        <p style="margin:0 0 8px;font-size:12px;color:#9CA3AF;line-height:1.55">
          Adjunto HTML: abrir con Chrome, Safari o Edge tras descargar.
        </p>

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
            <div style="font-size:12px;color:#9CA3AF;line-height:1.4">Diagnóstico estratégico<br/>para postulaciones a fondos de innovación</div>
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
