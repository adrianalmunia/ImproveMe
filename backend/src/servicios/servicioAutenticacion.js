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
const { generarToken } = require('../configuracion/autenticacion_jwt');
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
                { nombre_usuario: nombreUsuario },
                { correo: email }
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
            nombre_usuario: nombreUsuario,
            correo: email,
            alias: nombreUsuario, // Inicialmente el alias es el nombre de usuario
            contrasena_hash: passwordEncriptada,
            puntos_experiencia: 0
        },
        select: {
            id: true,
            nombre_usuario: true,
            correo: true,
            alias: true,
            puntos_experiencia: true,
            fecha_registro: true
        }
    });

    // 5. GENERAR TOKEN JWT
    const token = generarToken(nuevoUsuario.id);

    // 6. RETORNAR DATOS (NUNCA devolver password o password_hash)
    return {
        usuario: nuevoUsuario,
        token: token,
        mensaje: 'Registro exitoso'
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
        where: { correo: email },
        select: {
            id: true,
            nombre_usuario: true,
            correo: true,
            alias: true,
            contrasena_hash: true,
            puntos_experiencia: true
        }
    });

    // 3. VERIFICAR QUE USUARIO EXISTA
    if (!usuario) {
        throw new Error('Email o contraseña incorrectos');
    }

    // 4. VERIFICAR CONTRASEÑA USANDO BCRYPT
    const passwordCorrecta = await bcrypt.compare(password, usuario.contrasena_hash);

    if (!passwordCorrecta) {
        throw new Error('Email o contraseña incorrectos');
    }

    // 5. GENERAR TOKEN JWT
    const token = generarToken(usuario.id);

    // 6. RETORNAR DATOS (sin password)
    const { contrasena_hash, ...usuarioSeguro } = usuario;
    return {
        usuario: usuarioSeguro,
        token: token,
        mensaje: 'Sesión iniciada exitosamente'
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
            nombre_usuario: true,
            correo: true,
            alias: true,
            puntos_experiencia: true,
            fecha_registro: true
        }
    });

    if (!usuario) {
        throw new Error('Usuario no encontrado');
    }

    return usuario;
}

async function actualizarPerfilUsuario(idUsuario, datos) {
    const dataAActualizar = {};

    // 0. VERIFICAR CONTRASEÑA ACTUAL SI SE CAMBIAN DATOS SENSIBLES
    const requiereVerificacion = datos.nombre_usuario || datos.correo || datos.contrasena || datos.alias;

    if (requiereVerificacion) {
        if (!datos.contrasena_actual) {
            throw new Error('Se requiere la contraseña actual para confirmar los cambios');
        }

        const usuarioActual = await prisma.usuarios.findUnique({
            where: { id: idUsuario },
            select: { contrasena_hash: true, nombre_usuario: true, correo: true }
        });

        const passwordCorrecta = await bcrypt.compare(datos.contrasena_actual, usuarioActual.contrasena_hash);
        if (!passwordCorrecta) {
            throw new Error('La contraseña actual es incorrecta');
        }

        // 1. VALIDACIONES Y PREPARACIÓN DE DATOS
        if (datos.nombre_usuario !== undefined && datos.nombre_usuario !== usuarioActual.nombre_usuario) {
            if (!validarNombreUsuario(datos.nombre_usuario)) {
                throw new Error('El nombre de usuario debe tener 3-20 caracteres (solo letras, números y _)');
            }
            const existe = await prisma.usuarios.findUnique({ where: { nombre_usuario: datos.nombre_usuario } });
            if (existe) throw new Error('El nombre de usuario ya está en uso');
            dataAActualizar.nombre_usuario = datos.nombre_usuario;
        }

        if (datos.correo !== undefined && datos.correo !== usuarioActual.correo) {
            if (!validarEmail(datos.correo)) {
                throw new Error('El email no tiene formato válido');
            }
            const existe = await prisma.usuarios.findUnique({ where: { correo: datos.correo } });
            if (existe) throw new Error('El correo electrónico ya está en uso');
            dataAActualizar.correo = datos.correo;
        }

        if (datos.contrasena !== undefined && datos.contrasena !== '') {
            const validacionPassword = validarContraseña(datos.contrasena);
            if (!validacionPassword.esValida) {
                throw new Error(validacionPassword.errores.join('; '));
            }
            dataAActualizar.contrasena_hash = await bcrypt.hash(datos.contrasena, VUELTAS_BCRYPT);
        }

        if (datos.alias !== undefined) {
            dataAActualizar.alias = datos.alias;
        }
    }

    if (datos.puntos_experiencia !== undefined) {
        dataAActualizar.puntos_experiencia = datos.puntos_experiencia;
    }

    // Si no hay nada que actualizar, retornamos el usuario actual
    if (Object.keys(dataAActualizar).length === 0) {
        return await obtenerPerfilUsuario(idUsuario);
    }

    // 2. EJECUTAR ACTUALIZACIÓN
    const usuarioActualizado = await prisma.usuarios.update({
        where: { id: idUsuario },
        data: dataAActualizar,
        select: {
            id: true,
            nombre_usuario: true,
            correo: true,
            alias: true,
            puntos_experiencia: true,
            fecha_registro: true
        }
    });

    if (!usuarioActualizado) {
        throw new Error('No se pudo actualizar el usuario');
    }

    return usuarioActualizado;
}

async function eliminarUsuario(idUsuario, contrasena) {
    if (!contrasena) {
        throw new Error('Se requiere la contraseña para eliminar la cuenta');
    }

    const usuarioActual = await prisma.usuarios.findUnique({
        where: { id: idUsuario },
        select: { contrasena_hash: true }
    });

    if (!usuarioActual) {
        throw new Error('Usuario no encontrado');
    }

    const passwordCorrecta = await bcrypt.compare(contrasena, usuarioActual.contrasena_hash);
    if (!passwordCorrecta) {
        throw new Error('La contraseña es incorrecta');
    }

    // Prisma manejará el borrado en cascada si está configurado en el schema
    const usuarioEliminado = await prisma.usuarios.delete({
        where: { id: idUsuario }
    });

    if (!usuarioEliminado) {
        throw new Error('No se pudo eliminar el usuario');
    }

    return { mensaje: 'Cuenta eliminada permanentemente' };
}

/**
 * Recopila toda la información de un usuario para su exportación
 * @param {number} idUsuario - ID del usuario
 * @returns {object} Objeto con todos los datos del usuario
 */
async function exportarDatosUsuario(idUsuario) {
    // 1. Obtener datos básicos del perfil
    const perfil = await prisma.usuarios.findUnique({
        where: { id: idUsuario },
        select: {
            nombre_usuario: true,
            correo: true,
            puntos_experiencia: true,
            fecha_registro: true
        }
    });

    if (!perfil) throw new Error('Usuario no encontrado');

    // 2. Obtener todas las entradas de diario (con sus archivos multimedia)
    const entradasDiario = await prisma.entradas_diario.findMany({
        where: { usuario_id: idUsuario },
        include: { archivos_multimedia: true },
        orderBy: { fecha: 'desc' }
    });

    // 3. Obtener todas las sesiones de meditación
    const sesionesMeditacion = await prisma.sesiones_meditacion.findMany({
        where: { usuario_id: idUsuario },
        orderBy: { fecha: 'desc' }
    });

    // 4. Obtener todos los hábitos
    const habitos = await prisma.habitos.findMany({
        where: { usuario_id: idUsuario }
    });

    // 5. Obtener todas las tareas y diarias
    const tareas = await prisma.tareas_diarias.findMany({
        where: { usuario_id: idUsuario }
    });

    // Retornamos el paquete completo
    return {
        usuario: perfil,
        fecha_exportacion: new Date().toISOString(),
        diario: entradasDiario,
        meditacion: sesionesMeditacion,
        habitos: habitos,
        tareas: tareas,
        info: "Datos exportados desde ImproveMe - Tu mejor versión empieza hoy."
    };
}

module.exports = {
    registrarUsuario,
    iniciarSesion,
    obtenerPerfilUsuario,
    actualizarPerfilUsuario,
    eliminarUsuario,
    exportarDatosUsuario
};
