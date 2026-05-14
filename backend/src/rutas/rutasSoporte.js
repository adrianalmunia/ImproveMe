const express = require('express');
const router = express.Router();
const { enviarReporteError } = require('../servicios/servicioEmail');

router.post('/reportar-error', async (req, res) => {
  try {
    const { descripcion, infoTecnica } = req.body;

    if (!descripcion) {
      return res.status(400).json({ mensaje: 'La descripción es obligatoria' });
    }

    await enviarReporteError({ descripcion, infoTecnica });

    res.status(200).json({ mensaje: 'Reporte enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar el reporte:', error);
    res.status(500).json({ mensaje: 'Error al enviar el reporte', error: error.message });
  }
});

module.exports = router;
