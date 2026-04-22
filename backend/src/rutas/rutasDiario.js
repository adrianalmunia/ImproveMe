const express = require('express');
const router = express.Router();
const controladorDiario = require('../controladores/controladorDiario');

// Ruta para guardar o actualizar la entrada de hoy
router.post('/', controladorDiario.guardarEntradaDiaria);

// Ruta para obtener la entrada de hoy de un usuario específico
router.get('/hoy/:usuarioId', controladorDiario.obtenerEntradaHoy);

module.exports = router;
