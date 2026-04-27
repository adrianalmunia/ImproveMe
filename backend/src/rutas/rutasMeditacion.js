const express = require('express');
const router = express.Router();
const controladorMeditacion = require('../controladores/controladorMeditacion');

// Registrar una sesión de meditación completada
router.post('/', controladorMeditacion.registrarSesion);

// Obtener historial de sesiones de un usuario (query param opcional: ?limite=30)
router.get('/historial/:usuarioId', controladorMeditacion.obtenerHistorial);

// Obtener estadísticas resumen de meditación de un usuario
router.get('/estadisticas/:usuarioId', controladorMeditacion.obtenerEstadisticas);

module.exports = router;
