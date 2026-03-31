/**
 * Nodo: 🔗 Preparar email ZENTI.start
 *
 * Email ejecutivo advisory — identidad visual ZENTI oficial.
 * Header blanco con wordmark + linea naranjo. Cards con radius 14px.
 * Roadmap en tabla con filas alternadas. Brechas con bullet naranjo.
 * Font: Arial, Helvetica, sans-serif. Width: 640px.
 */
const d = $input.first().json;
let prep = {};
try { prep = $('\u2699\ufe0f Preparar Datos Start').first().json; } catch (_) { prep = {}; }

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const email       = prep.email || d.email || '';
const instrumento = d.instrumento_recomendado || '';
const alternativo = d.instrumento_alternativo || '';
const por_que     = d.por_que || '';
const brechas     = d.brechas || [];
const roadmap     = d.roadmap || [];
const sector      = d.sector || prep.sector || '';
const etapa       = d.etapa || prep.etapa || '';
const fecha       = d.fecha || new Date().toISOString().slice(0, 10);
const ideaCorta   = (prep.idea || '').slice(0, 400).replace(/\s+/g, ' ').trim();
const nombreCorto = (prep.equipo || 'equipo').split(/[,\s]+/)[0];

const subject = 'ZENTI | Diagn\u00f3stico de viabilidad y match de instrumento';
const CTA_URL = 'https://cal.com/zenti';

const brechasRows = brechas.slice(0, 6).map((b, i) => {
  const txt = typeof b === 'string' ? b : (b.texto || b.descripcion || String(b));
  const pb = i < brechas.length - 1 ? '12px' : '0';
  return '<tr><td style="padding:0 0 ' + pb + ' 0;font-size:15px;line-height:1.6;color:#444444"><span style="color:#F26C22;font-weight:700">\u2022</span> ' + esc(txt) + '</td></tr>';
}).join('');

const roadmapRows = roadmap.slice(0, 7).map((r, i) => {
  const titulo = typeof r === 'string' ? r : (r.titulo || r.title || 'Paso ' + (i + 1));
  const detalle = typeof r === 'string' ? '' : (r.detalle || r.descripcion || '');
  const bg = i % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
  const border = i > 0 ? 'border-top:1px solid #E5E7EB;' : '';
  return '<tr style="background-color:' + bg + '">' +
    '<td style="width:54px;vertical-align:top;padding:18px 16px;font-size:22px;font-weight:700;color:#F26C22;' + border + '">' + (i + 1) + '</td>' +
    '<td style="padding:18px 18px 18px 0;' + border + '">' +
    '<div style="font-size:16px;font-weight:700;color:#111111;margin-bottom:6px">' + esc(titulo) + '</div>' +
    (detalle ? '<div style="font-size:14px;line-height:1.7;color:#444444">' + esc(detalle) + '</div>' : '') +
    '</td></tr>';
}).join('');

const email_html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ZENTI | Diagn\u00f3stico de viabilidad y match de instrumento</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F5;font-family:Arial,Helvetica,sans-serif;color:#444444">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F5F5F5;margin:0;padding:24px 0">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="width:640px;max-width:640px;background-color:#FFFFFF;border-collapse:collapse;border-radius:16px;overflow:hidden">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 18px 40px;background-color:#FFFFFF">
              <div style="font-size:28px;font-weight:700;letter-spacing:0.5px;color:#111111">ZENTI</div>
              <div style="margin-top:12px;width:100%;height:4px;background-color:#F26C22;border-radius:999px"></div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:8px 40px 8px 40px">
              <div style="font-size:28px;line-height:1.2;font-weight:700;color:#111111">Diagn\u00f3stico de viabilidad y match de instrumento</div>
            </td>
          </tr>

          <!-- Metadata -->
          <tr>
            <td style="padding:0 40px 24px 40px">
              <div style="font-size:14px;line-height:1.6;color:#6B7280">
                <strong style="color:#444444">Fecha:</strong> ${esc(fecha)} &nbsp;\u00b7&nbsp;
                ${sector ? '<strong style="color:#444444">Sector:</strong> ' + esc(sector) + ' &nbsp;\u00b7&nbsp;' : ''}
                ${etapa ? '<strong style="color:#444444">Etapa:</strong> ' + esc(etapa) : ''}
              </div>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding:0 40px 24px 40px">
              <div style="font-size:16px;line-height:1.7;color:#444444">
                Hola <strong style="color:#111111">${esc(nombreCorto)}</strong>,
                <br/><br/>
                Revisamos tu iniciativa con una l\u00f3gica de evaluaci\u00f3n orientada a instrumentos de innovaci\u00f3n y validaci\u00f3n tecnol\u00f3gica. A continuaci\u00f3n, compartimos una lectura ejecutiva del nivel de ajuste de tu proyecto y las principales brechas a resolver antes de estructurar una postulaci\u00f3n competitiva.
              </div>
            </td>
          </tr>

          <!-- Idea summary -->
          ${ideaCorta ? `<tr>
            <td style="padding:0 40px 28px 40px">
              <div style="font-size:13px;font-weight:700;letter-spacing:0.3px;text-transform:uppercase;color:#111111;margin-bottom:10px">S\u00edntesis de la idea</div>
              <div style="background-color:#F3F4F6;border-radius:14px;padding:20px 22px;font-size:15px;line-height:1.7;color:#444444">${esc(ideaCorta)}${prep.idea && prep.idea.length > 400 ? '\u2026' : ''}</div>
            </td>
          </tr>` : ''}

          <!-- Match result -->
          <tr>
            <td style="padding:0 40px 28px 40px">
              <div style="font-size:13px;font-weight:700;letter-spacing:0.3px;text-transform:uppercase;color:#111111;margin-bottom:10px">Resultado consolidado</div>
              <div style="background-color:#F3F4F6;border-radius:14px;padding:22px">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr><td style="padding:0 0 14px 0;font-size:14px;color:#6B7280">Instrumento recomendado</td></tr>
                  <tr><td style="padding:0 0 18px 0;font-size:24px;line-height:1.2;font-weight:700;color:#F26C22">${esc(instrumento)}</td></tr>
                  ${alternativo && alternativo !== '\u2014' ? '<tr><td style="padding:0 0 10px 0;font-size:14px;color:#6B7280">Segunda opci\u00f3n sugerida</td></tr><tr><td style="font-size:18px;line-height:1.3;font-weight:700;color:#111111">' + esc(alternativo) + '</td></tr>' : ''}
                </table>
              </div>
            </td>
          </tr>

          <!-- Expert judgment -->
          ${por_que ? `<tr>
            <td style="padding:0 40px 28px 40px">
              <div style="font-size:13px;font-weight:700;letter-spacing:0.3px;text-transform:uppercase;color:#111111;margin-bottom:10px">Juicio experto ZENTI</div>
              <div style="background-color:#FFFFFF;border:1px solid #E5E7EB;border-left:5px solid #F26C22;border-radius:14px;padding:22px;font-size:15px;line-height:1.7;color:#444444">${esc(por_que.length > 600 ? por_que.slice(0, 597) + '...' : por_que)}</div>
            </td>
          </tr>` : ''}

          <!-- Gaps -->
          ${brechasRows ? `<tr>
            <td style="padding:0 40px 28px 40px">
              <div style="font-size:13px;font-weight:700;letter-spacing:0.3px;text-transform:uppercase;color:#111111;margin-bottom:12px">Brechas cr\u00edticas de postulaci\u00f3n</div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${brechasRows}</table>
            </td>
          </tr>` : ''}

          <!-- Roadmap -->
          ${roadmapRows ? `<tr>
            <td style="padding:0 40px 28px 40px">
              <div style="font-size:13px;font-weight:700;letter-spacing:0.3px;text-transform:uppercase;color:#111111;margin-bottom:12px">Ruta de fortalecimiento recomendada</div>
              <div style="border:1px solid #E5E7EB;border-radius:14px;overflow:hidden">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse">${roadmapRows}</table>
              </div>
            </td>
          </tr>` : ''}

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px 40px">
              <div style="font-size:13px;font-weight:700;letter-spacing:0.3px;text-transform:uppercase;color:#111111;margin-bottom:12px">Pr\u00f3ximo paso sugerido por ZENTI</div>
              <div style="font-size:15px;line-height:1.7;color:#444444;margin-bottom:18px">Una sesi\u00f3n de estructuraci\u00f3n puede ayudarte a transformar esta base en una postulaci\u00f3n m\u00e1s s\u00f3lida, alineada con el instrumento y mejor preparada para evaluaci\u00f3n.</div>
              <a href="${esc(CTA_URL)}" target="_blank" style="display:inline-block;background-color:#F26C22;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:14px 22px;border-radius:10px">Agendar sesi\u00f3n de estructuraci\u00f3n</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px 40px;border-top:1px solid #E5E7EB">
              <div style="font-size:16px;font-weight:700;color:#111111;margin-bottom:6px">ZENTI</div>
              <div style="font-size:14px;line-height:1.6;color:#6B7280;margin-bottom:14px">Plataforma de inteligencia para innovaci\u00f3n y fondos p\u00fablicos.</div>
              <div style="font-size:12px;line-height:1.6;color:#9CA3AF">Este documento es orientativo y no constituye asesor\u00eda legal ni garant\u00eda de adjudicaci\u00f3n. Las bases oficiales de cada instrumento prevalecen siempre.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

return [{
  json: {
    email,
    email_subject: subject,
    email_html,
    instrumento_recomendado: instrumento,
    instrumento_alternativo: alternativo,
  },
}];
