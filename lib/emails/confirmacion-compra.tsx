type Boleto = {
  id: string
  codigo_qr: string
  tipo_nombre: string
}

type Props = {
  nombreCliente: string
  nombreEvento: string
  fecha: string
  hora: string
  ubicacion: string
  total: number
  boletos: Boleto[]
  baseUrl: string
}

const NARANJA = '#E85D20'

export function emailConfirmacionCompra({
  nombreCliente,
  nombreEvento,
  fecha,
  hora,
  baseUrl,
  ubicacion,
  total,
  boletos,
}: Props): string {
  const totalFmt = total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const boletosHTML = boletos
    .map(
      (b, i) => `
      <tr>
        <td style="padding:0 0 14px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                 style="background:#ffffff; border:1px solid #ececec; border-left:4px solid ${NARANJA}; border-radius:12px;">
            <tr>
              <td style="padding:18px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="vertical-align:middle;">
                      <p style="margin:0 0 4px; font-size:11px; font-weight:700; letter-spacing:0.12em; color:${NARANJA}; text-transform:uppercase;">Boleto ${i + 1} de ${boletos.length}</p>
                      <p style="margin:0 0 6px; font-size:16px; font-weight:700; color:#1a1a1a;">${b.tipo_nombre}</p>
                      <p style="margin:0; font-size:12px; color:#9a9a9a; font-family:'Courier New',monospace; letter-spacing:0.04em;">${b.codigo_qr}</p>
                    </td>
                    <td align="right" style="vertical-align:middle; white-space:nowrap;">
                      <a href="${baseUrl}/boleto/${b.id}"
                         style="display:inline-block; padding:11px 18px; background:${NARANJA}; color:#ffffff; font-size:13px; font-weight:700; border-radius:8px; text-decoration:none;">
                        Ver QR &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <title>Tus boletos para ${nombreEvento}</title>
</head>
<body style="margin:0; padding:0; background:#f4f1ee; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preheader oculto -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">Tu compra está confirmada. Aquí están tus boletos con código QR para ${nombreEvento}.</div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:36px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:580px; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 4px 24px rgba(40,15,0,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:#2a1206; background:linear-gradient(135deg,#3B1A08 0%,#7C2E0A 45%,#C45515 80%,#E07830 110%); padding:44px 32px 40px; text-align:center;">
              <table cellpadding="0" cellspacing="0" role="presentation" align="center">
                <tr>
                  <td align="center">
                    <div style="width:60px; height:60px; line-height:60px; margin:0 auto 18px; background:rgba(255,255,255,0.16); border-radius:50%; font-size:30px; color:#ffffff; text-align:center;">&#10003;</div>
                    <p style="margin:0 0 6px; font-size:12px; font-weight:700; letter-spacing:0.18em; color:rgba(255,255,255,0.65); text-transform:uppercase;">Compra confirmada</p>
                    <h1 style="margin:0; font-size:26px; line-height:1.2; color:#ffffff; font-weight:800;">&iexcl;Ya tienes tus boletos!</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:34px 32px 8px;">
              <p style="margin:0 0 26px; font-size:16px; line-height:1.6; color:#3a3a3a;">
                Hola <strong>${nombreCliente}</strong>, tu pago se realiz&oacute; con &eacute;xito.
                Aqu&iacute; tienes ${boletos.length === 1 ? 'tu boleto' : `tus ${boletos.length} boletos`} para
                <strong style="color:#1a1a1a;">${nombreEvento}</strong>.
              </p>

              <!-- Detalle del evento -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#fbf6f2; border:1px solid #f1e4da; border-radius:14px; margin-bottom:30px;">
                <tr>
                  <td style="padding:22px 24px;">
                    <p style="margin:0 0 10px; font-size:11px; font-weight:700; color:${NARANJA}; text-transform:uppercase; letter-spacing:0.12em;">Detalles del evento</p>
                    <p style="margin:0 0 14px; font-size:20px; font-weight:800; color:#1a1a1a; line-height:1.25;">${nombreEvento}</p>
                    <p style="margin:0 0 6px; font-size:14px; color:#4b4b4b;">&#128197;&nbsp;&nbsp;${fecha} &middot; ${hora}</p>
                    <p style="margin:0; font-size:14px; color:#4b4b4b;">&#128205;&nbsp;&nbsp;${ubicacion}</p>
                  </td>
                </tr>
              </table>

              <!-- Boletos -->
              <p style="margin:0 0 14px; font-size:13px; font-weight:700; color:#1a1a1a; text-transform:uppercase; letter-spacing:0.08em;">
                ${boletos.length === 1 ? 'Tu boleto' : 'Tus boletos'}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                ${boletosHTML}
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:12px 0 4px; border-top:2px solid #efefef;">
                <tr>
                  <td style="padding-top:18px; font-size:15px; font-weight:600; color:#1a1a1a;">Total pagado</td>
                  <td align="right" style="padding-top:18px; font-size:20px; font-weight:800; color:${NARANJA};">$${totalFmt} <span style="font-size:13px; font-weight:600; color:#9a9a9a;">MXN</span></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Aviso de acceso -->
          <tr>
            <td style="padding:20px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#1a0a00; border-radius:14px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px; font-size:14px; font-weight:700; color:#ffffff;">&#128241; C&oacute;mo entrar al evento</p>
                    <p style="margin:0; font-size:13px; line-height:1.6; color:rgba(255,255,255,0.7);">
                      Abre cada boleto con el bot&oacute;n &ldquo;Ver QR&rdquo; y muestra el c&oacute;digo en tu celular en la entrada.
                      Guarda este correo: tus boletos siempre estar&aacute;n disponibles desde estos enlaces.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#faf7f4; padding:24px 32px; text-align:center; border-top:1px solid #f0eae5;">
              <p style="margin:0 0 4px; font-size:13px; font-weight:700; color:#1a1a1a; letter-spacing:0.06em;">NOMBRE ORGANIZACIÓN</p>
              <p style="margin:0; font-size:12px; color:#a8a8a8;">&copy; ${new Date().getFullYear()} &middot; Todos los derechos reservados</p>
            </td>
          </tr>

        </table>

        <p style="margin:18px 0 0; font-size:11px; color:#b5ada6; max-width:580px;">
          Recibiste este correo porque compraste boletos para ${nombreEvento}.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}
