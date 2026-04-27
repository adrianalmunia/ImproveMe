const express = require('express');
const router = express.Router();
const { verificarAutenticacion } = require('../middleware/autenticacion');
const {
    controlarObtenerGamificacion,
    controlarSincronizarGamificacion
} = require('../controladores/controladorTareas');

router.get('/', verificarAutenticacion, controlarObtenerGamificacion);
router.put('/sincronizar', verificarAutenticacion, controlarSincronizarGamificacion);

module.exports = router;
