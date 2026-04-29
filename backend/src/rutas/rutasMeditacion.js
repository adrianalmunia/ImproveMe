const express = require('express');
const router = express.Router();
const controladorMeditacion = require('../controladores/controladorMeditacion');
const { verificarAutenticacion } = require('../middleware/autenticacion');

// Todas las rutas de meditación requieren autenticación
router.use(verificarAutenticacion);

// Registrar una sesión de meditación completada
router.post('/', controladorMeditacion.registrarSesion);

// Obtener historial de sesiones de un usuario
router.get('/historial/:usuarioId', controladorMeditacion.obtenerHistorial);

// Obtener estadísticas resumen
router.get('/estadisticas/:usuarioId', controladorMeditacion.obtenerEstadisticas);

module.exports = router;
