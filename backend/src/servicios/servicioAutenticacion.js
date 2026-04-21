// ================================================================================
// SERVICIO DE AUTENTICACIÓN
// ================================================================================
// Aquí va toda la lógica de negocio relacionada con usuarios:
// - Registrar nuevos usuarios
// - Validar credenciales en login
// - Encriptar contraseñas con Bcrypt
// - Generar tokens JWT
//
// Este servicio es INDEPENDIENTE de Express, por lo que podría
// reutilizarse en otras partes de la app o en APIs diferentes.

const bcrypt = require('bcrypt');
const prisma = require('../configuracion/baseDatos');
const { generarToken } = require('../configuracion/jwt');
const { validarEmail, validarContraseña, validarNombreUsuario } = require('../utilidades/validadores');

// Número de vueltas para el hash de Bcrypt (más alto = más seguro pero más lento)
const VUELTAS_BCRYPT = 10;

/**
 * Registra un nuevo usuario en la base de datos
 * @param {string} nombreUsuario - Nombre de usuario único
 * @param {string} email - Email único
 * @param {string} password - Contraseña sin encriptar
 * @returns {object} Datos del usuario creado y su token JWT
 */
async function registrarUsuario(nombreUsuario, email, password) {
    // 1. VALIDAR ENTRADA
    if (!nombreUsuario || !email || !password) {
        throw new Error('Todos los campos son obligatorios');
    }

    if (!validarNombreUsuario(nombreUsuario)) {
        throw new Error(
            'El nombre de usuario debe tener 3-20 caracteres (solo letras, números y _)'
        );
    }

    if (!validarEmail(email)) {
        throw new Error('El email no tiene formato válido');
    }

    const validacionPassword = validarContraseña(password);
    if (!validacionPassword.esValida) {
        throw new Error(validacionPassword.errores.join('; '));
    }

    // 2. VERIFICAR SI USUARIO/EMAIL YA EXISTE
    const usuarioExistente = await prisma.usuarios.findFirst({
        where: {
            OR: [
                { username: nombreUsuario },
                { email: email }
            ]
        }
    });

    if (usuarioExistente) {
        throw new Error('El usuario o email ya está registrado');
    }

    // 3. ENCRIPTAR CONTRASEÑA
    const passwordEncriptada = await bcrypt.hash(password, VUELTAS_BCRYPT);

    // 4. CREAR USUARIO EN BD
    const nuevoUsuario = await prisma.usuarios.create({
        data: {
            username: nombreUsuario,
            email: email,
            password_hash: passwordEncriptada,
            puntos_xp: 0
        },
        select: {
            id: true,
            username: true,
            email: true,
            puntos_xp: true,
            fecha_registro: true
        }
    });

    // 5. GENERAR TOKEN JWT
    const token = generarToken(nuevoUsuario.id);

    // 6. RETORNAR DATOS (NUNCA devolver password o password_hash)
    return {
        usuario: nuevoUsuario,
        token: token,
        mensaje: '✅ Registro exitoso'
    };
}

/**
 * Verifica las credenciales de un usuario (login)
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña sin encriptar
 * @returns {object} Datos del usuario y su token JWT
 */
async function iniciarSesion(email, password) {
    // 1. VALIDAR ENTRADA
    if (!email || !password) {
        throw new Error('Email y contraseña son obligatorios');
    }

    if (!validarEmail(email)) {
        throw new Error('El email no tiene formato válido');
    }

    // 2. BUSCAR USUARIO POR EMAIL
    const usuario = await prisma.usuarios.findUnique({
        where: { email: email },
        select: {
            id: true,
            username: true,
            email: true,
            password_hash: true,
            puntos_xp: true
        }
    });

    // 3. VERIFICAR QUE USUARIO EXISTA
    if (!usuario) {
        throw new Error('Email o contraseña incorrectos');
    }

    // 4. VERIFICAR CONTRASEÑA USANDO BCRYPT
    const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordCorrecta) {
        throw new Error('Email o contraseña incorrectos');
    }

    // 5. GENERAR TOKEN JWT
    const token = generarToken(usuario.id);

    // 6. RETORNAR DATOS (sin password)
    const { password_hash, ...usuarioSeguro } = usuario;
    return {
        usuario: usuarioSeguro,
        token: token,
        mensaje: '✅ Sesión iniciada exitosamente'
    };
}

/**
 * Obtiene la información pública de un usuario por su ID
 * @param {number} idUsuario - ID del usuario
 * @returns {object} Datos públicos del usuario
 */
async function obtenerPerfilUsuario(idUsuario) {
    const usuario = await prisma.usuarios.findUnique({
        where: { id: idUsuario },
        select: {
            id: true,
            username: true,
            email: true,
            puntos_xp: true,
            fecha_registro: true
        }
    });

    if (!usuario) {
        throw new Error('Usuario no encontrado');
    }

    return usuario;
}

module.exports = {
    registrarUsuario,
    iniciarSesion,
    obtenerPerfilUsuario
};
