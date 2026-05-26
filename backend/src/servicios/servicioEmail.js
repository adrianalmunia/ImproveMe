const nodemailer = require('nodemailer');

const enviarReporteError = async (datos) => {
  const { descripcion, infoTecnica } = datos;

  const usuario = process.env.EMAIL_USUARIO;
  const password = process.env.EMAIL_PASSWORD;
  const destino = process.env.EMAIL_DESTINO || usuario || 'adrianalmuniapiertolas@gmail.com';

  if (!usuario || !password) {
    console.error('[Email] Error: No se han configurado las credenciales de correo (EMAIL_USUARIO / EMAIL_PASSWORD).');
    throw new Error('Configuración de correo incompleta en el servidor.');
  }

  console.log(`[Email] Enviando reporte de error a ${destino} a través de Gmail SMTP (Nodemailer)...`);

  const transportar = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // false para puerto 587
    auth: {
      user: usuario,
      pass: password
    },
    tls: {
      rejectUnauthorized: false // Evita problemas con certificados SSL locales
    }
  });

  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="text-align: center; border-bottom: 2px solid #4F99CC; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #4F99CC; margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">🚨 Reporte de Incidencia - ImproveMe</h2>
      </div>
      <p style="font-size: 15px; line-height: 1.6;">Se ha reportado un nuevo error desde la aplicación. A continuación se detallan los datos de la incidencia:</p>
      
      <p style="font-weight: bold; font-size: 14px; color: #555; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Descripción del Error</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #EF4444; font-size: 14px; line-height: 1.6; color: #334155;">
        ${descripcion.replace(/\n/g, '<br>')}
      </div>
      
      <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; color: #1e293b; font-size: 16px;">💻 Información Técnica del Dispositivo</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px;">
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; font-weight: bold; color: #64748b; width: 120px;">Navegador:</td><td style="padding: 8px 0; color: #334155;">${infoTecnica?.agente || 'No especificado'}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Sistema:</td><td style="padding: 8px 0; color: #334155;">${infoTecnica?.plataforma || 'No especificado'}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Resolución:</td><td style="padding: 8px 0; color: #334155;">${infoTecnica?.resolucion || 'No especificado'}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Idioma:</td><td style="padding: 8px 0; color: #334155;">${infoTecnica?.idioma || 'No especificado'}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; font-weight: bold; color: #64748b;">URL de Origen:</td><td style="padding: 8px 0; color: #4F99CC; word-break: break-all;">${infoTecnica?.url || 'No especificada'}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Fecha y Hora:</td><td style="padding: 8px 0; color: #334155;">${new Date().toLocaleString('es-ES')}</td></tr>
      </table>
      <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
        Este es un correo automático generado por el soporte técnico de ImproveMe.
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Soporte ImproveMe" <${usuario}>`,
    to: destino,
    subject: '🚨 NUEVO REPORTE DE ERROR - ImproveMe',
    html: htmlContent
  };

  const resultado = await transportar.sendMail(mailOptions);
  console.log(`[Email] Reporte enviado con éxito a través de Gmail SMTP! ID: ${resultado.messageId}`);
  return resultado;
};

module.exports = {
  enviarReporteError
};

