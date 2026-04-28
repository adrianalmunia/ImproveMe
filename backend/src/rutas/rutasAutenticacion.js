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
    controlarObtenerPerfil,
    controlarActualizarPerfil,
    controlarEliminarPerfil
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

/**
 * PUT /api/autenticacion/perfil
 * Actualiza el perfil del usuario autenticado (ej: puntos de experiencia)
 * Requiere: Authorization: Bearer {token}
 */
router.put('/perfil', verificarAutenticacion, controlarActualizarPerfil);

/**
 * DELETE /api/autenticacion/perfil
 * Elimina la cuenta del usuario autenticado permanentemente
 * Requiere: Authorization: Bearer {token}
 */
router.delete('/perfil', verificarAutenticacion, controlarEliminarPerfil);

module.exports = router;
