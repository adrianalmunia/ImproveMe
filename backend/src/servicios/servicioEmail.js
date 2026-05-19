const enviarReporteError = async (datos) => {
  const { descripcion, infoTecnica } = datos;
  const destino = process.env.EMAIL_DESTINO || 'adrianalmuniapiertolas@gmail.com';

  console.log(`[Email] Enviando reporte de error a ${destino} a través de FormSubmit.co...`);

  // Enviamos los datos en formato JSON mediante un POST HTTPS a FormSubmit
  const respuesta = await fetch(`https://formsubmit.co/ajax/${destino}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      _subject: '🚨 NUEVO REPORTE DE ERROR - ImproveMe',
      _honey: '', // Campo trampa anti-spam
      descripcion: descripcion,
      navegador: infoTecnica?.agente || 'No especificado',
      sistema: infoTecnica?.plataforma || 'No especificado',
      resolucion: infoTecnica?.resolucion || 'No especificado',
      idioma: infoTecnica?.idioma || 'No especificado',
      url_origen: infoTecnica?.url || 'No especificada',
      fecha_reporte: new Date().toLocaleString('es-ES')
    })
  });

  const resultado = await respuesta.json();

  if (!respuesta.ok || resultado.success === 'false') {
    throw new Error(resultado.message || 'Error al procesar el envío en FormSubmit');
  }

  console.log(`[Email] Reporte enviado con éxito a través de FormSubmit!`);
  return resultado;
};

module.exports = {
  enviarReporteError
};
