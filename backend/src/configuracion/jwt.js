// ================================================================================
// CONFIGURACIÓN DE JWT (JSON WEB TOKENS)
// ================================================================================
// Los JWT nos permiten autenticar usuarios sin necesidad de almacenar sesiones
// en el servidor, haciendo la app más escalable.
//
// Proceso:
// 1. Usuario inicia sesión (envía email + password)
// 2. Validamos sus credenciales en la BD
// 3. Creamos un JWT con su ID de usuario
// 4. Le devolvemos el token
// 5. En cada solicitud posterior, envía el token en los headers
// 6. Nosotros validamos el token para identificar al usuario

require('dotenv').config();
const jwt = require('jsonwebtoken');

// Claves secretas (en producción, guardarlas en variables de entorno)
const CLAVE_SECRETA = process.env.JWT_SECRETO || 'tu-clave-super-secreta-aqui-cambiala-en-produccion';
const TIEMPO_EXPIRACION = '7d'; // El token expira después de 7 días

/**
 * Genera un token JWT para un usuario
 * @param {number} idUsuario - ID único del usuario en la base de datos
 * @returns {string} Token JWT firmado
 */
function generarToken(idUsuario) {
    try {
        const token = jwt.sign(
            { idUsuario }, // Payload (datos que van dentro del token)
            CLAVE_SECRETA, // Firma (clave secreta que solo conoce el servidor)
            { expiresIn: TIEMPO_EXPIRACION } // Opciones (cuándo expira)
        );
        return token;
    } catch (error) {
        console.error('Error al generar token:', error.message);
        throw new Error('No se pudo generar el token de autenticación');
    }
}

/**
 * Valida un token JWT y extrae los datos del usuario
 * @param {string} token - Token JWT a validar
 * @returns {object} Datos decodificados del token { idUsuario, iat, exp }
 */
function validarToken(token) {
    try {
        const datos = jwt.verify(token, CLAVE_SECRETA);
        return datos;
    } catch (error) {
        console.error('Error al validar token:', error.message);
        throw new Error('Token inválido o expirado');
    }
}

module.exports = {
    generarToken,
    validarToken,
    CLAVE_SECRETA,
    TIEMPO_EXPIRACION
};
