const express = require('express');
const router = express.Router();
const { controlarObtenerEstadisticas } = require('../controladores/controladorEstadisticas');
const { verificarAutenticacion } = require('../middleware/autenticacion');

router.get('/:usuarioId', verificarAutenticacion, controlarObtenerEstadisticas);

module.exports = router;
