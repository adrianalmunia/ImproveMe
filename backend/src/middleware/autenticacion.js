// ================================================================================
// MIDDLEWARE DE AUTENTICACIÓN CON JWT
// ================================================================================
// Este middleware se ejecuta ANTES de que lleguen a las rutas protegidas.
// Su trabajo es verificar que el usuario haya enviado un token JWT válido.
//
// Estructura esperada:
// - Cliente envía: Authorization: Bearer {token}
// - Middleware extrae el token, lo valida
// - Si es válido, permite el acceso y agrega el usuarioId al objeto req
// - Si no es válido, rechaza la solicitud con error 401

const { validarToken } = require('../configuracion/jwt');

/**
 * Middleware que verifica la autenticación del usuario
 * Debe colocarse en rutas protegidas
 *
 * Ejemplo de uso en una ruta:
 *   app.get('/api/perfil', verificarAutenticacion, controladorPerfil);
 */
function verificarAutenticacion(req, res, siguiente) {
    try {
        // 1. Extraemos el header 'Authorization' que el cliente envía
        const cabecera = req.headers.authorization;

        // 2. Validamos que la cabecera exista
        if (!cabecera) {
            return res.status(401).json({
                error: 'No autenticado',
                mensaje: 'Debes enviar un token JWT en el header Authorization'
            });
        }

        // 3. Extraemos el token del formato "Bearer {token}"
        // Los headers llegan así: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        const partes = cabecera.split(' ');
        if (partes.length !== 2 || partes[0] !== 'Bearer') {
            return res.status(401).json({
                error: 'Formato inválido',
                mensaje: 'El header debe tener el formato: Authorization: Bearer {token}'
            });
        }

        const token = partes[1];

        // 4. Validamos el token
        const datos = validarToken(token);

        // 5. Si todo es correcto, guardamos el ID del usuario en req
        // para que los controladores posteriores lo puedan usar
        req.usuarioId = datos.idUsuario;
        req.token = token;

        // 6. Pasamos el control al siguiente middleware o controlador
        siguiente();
    } catch (error) {
        console.error('Error en autenticación:', error.message);
        return res.status(401).json({
            error: 'Autenticación fallida',
            mensaje: error.message
        });
    }
}

module.exports = {
    verificarAutenticacion
};
