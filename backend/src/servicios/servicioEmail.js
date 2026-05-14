const nodemailer = require('nodemailer');

const transportar = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USUARIO, // Ej: tu-correo@gmail.com
    pass: process.env.EMAIL_PASSWORD  // Ej: contraseña de aplicación de Google
  }
});

const enviarReporteError = async (datos) => {
  const { descripcion, infoTecnica } = datos;

  const mailOptions = {
    from: `"Soporte ImproveMe" <${process.env.EMAIL_USUARIO}>`,
    to: process.env.EMAIL_DESTINO || 'adrianalmuniapiertolas@gmail.com',
    subject: 'NUEVO REPORTE DE ERROR - ImproveMe',
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2C4159;">Reporte de Incidencia</h2>
        <p><strong>Descripción:</strong></p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          ${descripcion.replace(/\n/g, '<br>')}
        </div>
        
        <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Información Técnica</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 5px; font-weight: bold;">Agente:</td><td>${infoTecnica.agente}</td></tr>
          <tr><td style="padding: 5px; font-weight: bold;">Plataforma:</td><td>${infoTecnica.plataforma}</td></tr>
          <tr><td style="padding: 5px; font-weight: bold;">Resolución:</td><td>${infoTecnica.resolucion}</td></tr>
          <tr><td style="padding: 5px; font-weight: bold;">Idioma:</td><td>${infoTecnica.idioma}</td></tr>
          <tr><td style="padding: 5px; font-weight: bold;">URL:</td><td>${infoTecnica.url}</td></tr>
          <tr><td style="padding: 5px; font-weight: bold;">Fecha:</td><td>${new Date().toLocaleString()}</td></tr>
        </table>
      </div>
    `
  };

  return transportar.sendMail(mailOptions);
};

module.exports = {
  enviarReporteError
};
