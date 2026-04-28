const express = require('express');
const router = express.Router();
const { controlarObtenerCalendario } = require('../controladores/controladorCalendario');
const { verificarAutenticacion } = require('../middleware/autenticacion');

// Ruta protegida: requiere token JWT
router.get('/:usuarioId', verificarAutenticacion, controlarObtenerCalendario);

module.exports = router;
