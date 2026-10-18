/**
 * Servicio de envío de correos electrónicos transaccionales usando Brevo (Sendinblue) REST API v3
 */

interface SendEmailParams {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

export async function sendBrevoEmail({ toEmail, toName, subject, htmlContent }: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  // En Brevo, el remitente debe ser un correo verificado de la cuenta para que el relay no lo rechace en cola.
  // alexanderst2005@gmail.com es el remitente verificado y muestra el nombre oficial "Lumira Beauty".
  const envSender = process.env.BREVO_SENDER_EMAIL?.trim();
  const senderEmail = envSender || 'alexanderst2005@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'Lumira Beauty';

  if (!apiKey) {
    console.warn('[Brevo] BREVO_API_KEY no está configurada en las variables de entorno. El correo no se envió.');
    return { success: false, error: 'BREVO_API_KEY no configurada' };
  }

  if (!toEmail || !toEmail.includes('@')) {
    console.warn('[Brevo] Dirección de correo inválida:', toEmail);
    return { success: false, error: 'Correo de destinatario inválido' };
  }

  try {
    let res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail
        },
        to: [
          {
            email: toEmail.trim(),
            name: toName?.trim() || toEmail.split('@')[0]
          }
        ],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.warn('[Brevo Warning] Falló primer intento con', senderEmail, errBody);

      // Si falló por validación de remitente, reintentar con el correo verificado de la cuenta
      if (senderEmail !== 'alexanderst2005@gmail.com') {
        const retryRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': apiKey
          },
          body: JSON.stringify({
            sender: {
              name: senderName,
              email: 'alexanderst2005@gmail.com'
            },
            to: [
              {
                email: toEmail.trim(),
                name: toName?.trim() || toEmail.split('@')[0]
              }
            ],
            subject: subject,
            htmlContent: htmlContent
          })
        });

        if (retryRes.ok) {
          const retryData = await retryRes.json();
          return { success: true, messageId: retryData.messageId };
        }
      }

      return { success: false, error: `Error Brevo: ${res.status} ${errBody}` };
    }

    const data = await res.json();
    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.error('[Brevo Exception]', error);
    return { success: false, error: error.message || 'Error de conexión con Brevo' };
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Plantilla de correo para Confirmación de Pedido Recibido
 */
export async function sendOrderConfirmationEmail(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  city: string;
  address: string;
  neighborhood?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    variant?: string;
  }>;
  total: number;
}) {
  const { orderNumber, customerName, customerEmail, city, address, neighborhood, items, total } = params;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-size: 14px;">
        <strong>${item.name}</strong>
        ${item.variant ? `<br><span style="color: #6b7280; font-size: 12px;">Detalle: ${item.variant}</span>` : ''}
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6; color: #4b5563; font-size: 14px; text-align: center;">
        x${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px; text-align: right; font-weight: bold;">
        ${formatCurrency(item.price * item.quantity)}
      </td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Confirmación de Pedido - Lumira Beauty</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6;">
              
              <!-- Header / Marca -->
              <tr>
                <td style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 32px 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 2px;">LUMIRA BEAUTY</h1>
                  <p style="color: #fce7f3; margin: 6px 0 0 0; font-size: 13px; letter-spacing: 1px;">LASHES & MAKEUP</p>
                </td>
              </tr>

              <!-- Cuerpo Principal -->
              <tr>
                <td style="padding: 32px 28px;">
                  
                  <div style="text-align: center; margin-bottom: 24px;">
                    <span style="background-color: #fdf2f8; color: #be185d; font-size: 12px; font-weight: bold; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #fbcfe8;">
                      Pedido Recibido con Éxito
                    </span>
                    <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 16px 0 6px 0;">¡Gracias por tu compra, ${customerName}!</h2>
                    <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.5;">
                      Hemos registrado tu pedido <strong style="color: #db2777;">#${orderNumber}</strong>. Nuestro equipo comenzará a prepararlo de inmediato.
                    </p>
                  </div>

                  <!-- Tarjeta de Envío y Pago -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 1px solid #f3f4f6;">
                    <tr>
                      <td style="vertical-align: top; width: 50%; padding-right: 10px;">
                        <p style="color: #9ca3af; font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 0 0 4px 0; letter-spacing: 0.5px;">DIRECCIÓN DE ENVÍO</p>
                        <p style="color: #1f2937; font-size: 13px; font-weight: 600; margin: 0 0 2px 0;">${city}</p>
                        <p style="color: #4b5563; font-size: 13px; margin: 0;">${address} ${neighborhood ? `(${neighborhood})` : ''}</p>
                      </td>
                      <td style="vertical-align: top; width: 50%; padding-left: 10px;">
                        <p style="color: #9ca3af; font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 0 0 4px 0; letter-spacing: 0.5px;">MÉTODO DE PAGO</p>
                        <span style="background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 6px; border: 1px solid #a7f3d0; display: inline-block;">
                          Pago Contra Entrega
                        </span>
                      </td>
                    </tr>
                  </table>

                  <!-- Tabla de Productos -->
                  <h3 style="color: #111827; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">
                    Resumen de Productos
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                    <thead>
                      <tr style="border-bottom: 2px solid #e5e7eb;">
                        <th style="text-align: left; padding-bottom: 8px; color: #6b7280; font-size: 12px; font-weight: 600;">Producto</th>
                        <th style="text-align: center; padding-bottom: 8px; color: #6b7280; font-size: 12px; font-weight: 600;">Cant.</th>
                        <th style="text-align: right; padding-bottom: 8px; color: #6b7280; font-size: 12px; font-weight: 600;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="2" style="padding-top: 14px; color: #111827; font-size: 16px; font-weight: 700;">Total a Pagar:</td>
                        <td style="padding-top: 14px; color: #db2777; font-size: 18px; font-weight: 800; text-align: right;">${formatCurrency(total)}</td>
                      </tr>
                    </tfoot>
                  </table>

                  <!-- Botón de Contacto WhatsApp -->
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="https://wa.me/573011675661?text=Hola%20Lumira%20Beauty,%20consulto%20sobre%20mi%20pedido%20${orderNumber}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 24px; border-radius: 10px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);">
                      📲 Escríbenos por WhatsApp
                    </a>
                  </div>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f3f4f6; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                  <p style="margin: 0;">© ${new Date().getFullYear()} Lumira Beauty. Todos los derechos reservados.</p>
                  <p style="margin: 4px 0 0 0;">Si tienes alguna pregunta sobre tu pedido, estamos disponibles para atenderte.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendBrevoEmail({
    toEmail: customerEmail,
    toName: customerName,
    subject: `🛍️ Confirmación de tu Pedido #${orderNumber} - Lumira Beauty`,
    htmlContent
  });
}

/**
 * Plantilla de correo para Actualizaciones de Estado del Pedido
 */
export async function sendOrderStatusEmail(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  shippingCompany?: string;
  trackingNumber?: string;
  total?: number;
}) {
  const { orderNumber, customerName, customerEmail, status, shippingCompany, trackingNumber, total } = params;

  let statusTitle = `Tu pedido está: ${status}`;
  let statusMessage = `Te informamos que el estado de tu pedido #${orderNumber} ha sido actualizado a ${status}.`;
  let badgeBg = '#f3f4f6';
  let badgeColor = '#374151';
  let badgeBorder = '#e5e7eb';
  let iconEmoji = '📦';

  switch (status) {
    case 'Confirmado':
      statusTitle = '¡Pedido Confirmado!';
      statusMessage = 'Hemos verificado tu información y tu pedido ha sido confirmado. ¡Comenzamos a alistarlo!';
      badgeBg = '#fef9c3';
      badgeColor = '#a16207';
      badgeBorder = '#fef08a';
      iconEmoji = '✅';
      break;
    case 'En preparación':
      statusTitle = '¡Estamos preparando tu paquete!';
      statusMessage = 'Tus productos de belleza favoritos están siendo empacados con todo el cuidado de nuestro equipo.';
      badgeBg = '#eff6ff';
      badgeColor = '#1d4ed8';
      badgeBorder = '#bfdbfe';
      iconEmoji = '✨';
      break;
    case 'Enviado':
      statusTitle = '¡Tu pedido va en camino!';
      statusMessage = '¡Excelentes noticias! Tu paquete ya fue despachado y está en ruta hacia tu dirección.';
      badgeBg = '#e0e7ff';
      badgeColor = '#4338ca';
      badgeBorder = '#c7d2fe';
      iconEmoji = '🚚';
      break;
    case 'Entregado':
      statusTitle = '¡Pedido Entregado!';
      statusMessage = 'Confirmamos que tu pedido ha sido entregado exitosamente. ¡Esperamos que lo disfrutes al máximo!';
      badgeBg = '#ecfdf5';
      badgeColor = '#047857';
      badgeBorder = '#a7f3d0';
      iconEmoji = '🎉';
      break;
    case 'Cancelado':
      statusTitle = 'Pedido Cancelado';
      statusMessage = 'Te informamos que tu pedido ha sido cancelado. Si deseas reagendarlo o tienes dudas, contáctanos.';
      badgeBg = '#fee2e2';
      badgeColor = '#b91c1c';
      badgeBorder = '#fca5a5';
      iconEmoji = '⚠️';
      break;
  }

  const shippingBoxHtml = (status === 'Enviado' && (shippingCompany || trackingNumber)) ? `
    <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 18px; margin: 20px 0; text-align: left;">
      <p style="color: #5b21b6; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.5px;">
        🚚 GUÍA DE ENVÍO Y RASTREO
      </p>
      ${shippingCompany ? `<p style="color: #1e1b4b; font-size: 14px; margin: 0 0 4px 0;"><strong>Empresa Transportadora:</strong> ${shippingCompany}</p>` : ''}
      ${trackingNumber ? `<p style="color: #1e1b4b; font-size: 15px; margin: 0;"><strong>Número de Guía:</strong> <span style="background-color: #ffffff; padding: 3px 8px; border-radius: 6px; font-family: monospace; border: 1px solid #c4b5fd;">${trackingNumber}</span></p>` : ''}
    </div>
  ` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Estado de tu Pedido - Lumira Beauty</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6;">
              
              <!-- Header / Marca -->
              <tr>
                <td style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 32px 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 2px;">LUMIRA BEAUTY</h1>
                  <p style="color: #fce7f3; margin: 6px 0 0 0; font-size: 13px; letter-spacing: 1px;">ACTUALIZACIÓN DE TU ORDEN</p>
                </td>
              </tr>

              <!-- Cuerpo Principal -->
              <tr>
                <td style="padding: 32px 28px; text-align: center;">
                  
                  <div style="font-size: 40px; margin-bottom: 12px;">${iconEmoji}</div>

                  <span style="background-color: ${badgeBg}; color: ${badgeColor}; font-size: 12px; font-weight: bold; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; border: 1px solid ${badgeBorder}; display: inline-block;">
                    Estado: ${status}
                  </span>

                  <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 18px 0 8px 0;">${statusTitle}</h2>
                  <p style="color: #4b5563; font-size: 14px; margin: 0 auto; max-width: 460px; line-height: 1.6;">
                    Hola <strong>${customerName}</strong>, ${statusMessage}
                  </p>

                  <div style="background-color: #f9fafb; border-radius: 12px; padding: 14px 20px; margin: 20px 0; display: inline-block; border: 1px solid #f3f4f6;">
                    <p style="color: #6b7280; font-size: 13px; margin: 0;">
                      Orden: <strong style="color: #db2777;">#${orderNumber}</strong>
                      ${total ? ` &nbsp;•&nbsp; Total: <strong style="color: #111827;">${formatCurrency(total)}</strong>` : ''}
                    </p>
                  </div>

                  ${shippingBoxHtml}

                  <!-- Botón de Ayuda por WhatsApp -->
                  <div style="margin-top: 26px;">
                    <a href="https://wa.me/573011675661?text=Hola%20Lumira%20Beauty,%20consulto%20sobre%20el%20estado%20de%20mi%20pedido%20${orderNumber}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 24px; border-radius: 10px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);">
                      💬 ¿Tienes preguntas? Escríbenos
                    </a>
                  </div>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f3f4f6; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                  <p style="margin: 0;">© ${new Date().getFullYear()} Lumira Beauty. Todos los derechos reservados.</p>
                  <p style="margin: 4px 0 0 0;">Cuidamos cada detalle para brindarte la mejor experiencia.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendBrevoEmail({
    toEmail: customerEmail,
    toName: customerName,
    subject: `${iconEmoji} Actualización de tu Pedido #${orderNumber}: ${status} - Lumira Beauty`,
    htmlContent
  });
}
