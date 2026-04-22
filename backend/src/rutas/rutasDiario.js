const express = require('express');
const router = express.Router();
const controladorDiario = require('../controladores/controladorDiario');
const upload = require('../middleware/configuracionMulter');

// Ruta para guardar o actualizar la entrada de hoy (con soporte para archivos)
router.post('/', upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), controladorDiario.guardarEntradaDiaria);

// Ruta para obtener la entrada de hoy de un usuario específico
router.get('/hoy/:usuarioId', controladorDiario.obtenerEntradaHoy);

// Ruta para obtener entradas de un mes específico (requiere query params: ?mes=MM&anio=YYYY)
router.get('/mes/:usuarioId', controladorDiario.obtenerEntradasPorMes);

module.exports = router;
