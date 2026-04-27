// ================================================================================
// CONTROLADOR DE AUTENTICACIÓN
// ================================================================================
// El controlador es la capa que conecta las rutas HTTP con la lógica de negocio.
// Recibe solicitudes, las valida, llama a servicios, y devuelve respuestas.

const {
    registrarUsuario,
    iniciarSesion,
    obtenerPerfilUsuario,
    actualizarPerfilUsuario
} = require('../servicios/servicioAutenticacion');

/**
 * Controlador: Registrar un nuevo usuario
 * POST /api/autenticacion/registro
 * Body esperado: { nombreUsuario, email, password }
 */
async function controlarRegistro(req, res) {
    try {
        const { nombre_usuario, correo, contrasena } = req.body;

        // Llamamos al servicio para registrar
        const resultado = await registrarUsuario(nombre_usuario, correo, contrasena);

        // Si todo es correcto, devolvemos 201 (Created)
        return res.status(201).json(resultado);
    } catch (error) {
        console.error('Error en registro:', error.message);

        // Devolvemos el error con código 400 (Bad Request)
        return res.status(400).json({
            error: 'Registro fallido',
            mensaje: error.message
        });
    }
}

/**
 * Controlador: Iniciar sesión (login)
 * POST /api/autenticacion/login
 * Body esperado: { correo, contrasena }
 */
async function controlarLogin(req, res) {
    try {
        const { correo, contrasena } = req.body;

        // Llamamos al servicio para iniciar sesión
        const resultado = await iniciarSesion(correo, contrasena);

        // Si todo es correcto, devolvemos 200 (OK)
        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error en login:', error.message);

        // Devolvemos el error con código 401 (Unauthorized)
        return res.status(401).json({
            error: 'Login fallido',
            mensaje: error.message
        });
    }
}

/**
 * Controlador: Obtener perfil del usuario autenticado
 * GET /api/autenticacion/perfil
 * Headers esperado: Authorization: Bearer {token}
 * (El middleware verificarAutenticacion ya validó el token)
 */
async function controlarObtenerPerfil(req, res) {
    try {
        // El middleware añadió req.usuarioId con el ID del usuario del token
        const idUsuario = req.usuarioId;

        // Llamamos al servicio para obtener el perfil
        const usuario = await obtenerPerfilUsuario(idUsuario);

        // Devolvemos los datos del usuario
        return res.status(200).json({
            usuario: usuario,
            mensaje: 'Perfil obtenido'
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error.message);

        return res.status(404).json({
            error: 'No encontrado',
            mensaje: error.message
        });
    }
}

/**
 * Controlador: Actualizar perfil del usuario autenticado
 * PUT /api/autenticacion/perfil
 */
async function controlarActualizarPerfil(req, res) {
    try {
        const idUsuario = req.usuarioId;
        const datos = req.body;

        const usuarioActualizado = await actualizarPerfilUsuario(idUsuario, datos);

        return res.status(200).json({
            usuario: usuarioActualizado,
            mensaje: 'Perfil actualizado correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error.message);
        return res.status(400).json({
            error: 'No se pudo actualizar',
            mensaje: error.message
        });
    }
}

module.exports = {
    controlarRegistro,
    controlarLogin,
    controlarObtenerPerfil,
    controlarActualizarPerfil
};
