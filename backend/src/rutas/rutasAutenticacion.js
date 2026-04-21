// ================================================================================
// RUTAS DE AUTENTICACIÓN
// ================================================================================
// Aquí definimos los endpoints (rutas) de autenticación.
// Cada ruta está conectada a un controlador.

const express = require('express');
const router = express.Router();
const { verificarAutenticacion } = require('../middleware/autenticacion');
const {
    controlarRegistro,
    controlarLogin,
    controlarObtenerPerfil
} = require('../controladores/controladorAutenticacion');

// ============ RUTAS PÚBLICAS (no requieren autenticación) ============

/**
 * POST /api/autenticacion/registro
 * Permite a cualquier persona crear una nueva cuenta
 */
router.post('/registro', controlarRegistro);

/**
 * POST /api/autenticacion/login
 * Permite a usuarios registrados iniciar sesión
 */
router.post('/login', controlarLogin);

// ============ RUTAS PROTEGIDAS (requieren autenticación) ============

/**
 * GET /api/autenticacion/perfil
 * Obtiene el perfil del usuario autenticado
 * Requiere: Authorization: Bearer {token}
 */
router.get('/perfil', verificarAutenticacion, controlarObtenerPerfil);

module.exports = router;
