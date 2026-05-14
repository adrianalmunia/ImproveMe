// ================================================================================
// SERVICIO DE AUTENTICACIÓN
// ================================================================================
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../configuracion/baseDatos');
const { generarToken } = require('../configuracion/autenticacion_jwt');
const { validarEmail, validarContraseña, validarNombreUsuario } = require('../utilidades/validadores');

const VUELTAS_BCRYPT = 10;
const clienteGoogle = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function registrarUsuario(nombreUsuario, email, password) {
    if (!nombreUsuario || !email || !password) throw new Error('Todos los campos son obligatorios');
    if (!validarNombreUsuario(nombreUsuario)) throw new Error('Nombre de usuario inválido');
    if (!validarEmail(email)) throw new Error('Email inválido');
    
    const validacionPassword = validarContraseña(password);
    if (!validacionPassword.esValida) throw new Error(validacionPassword.errores.join('; '));

    const usuarioExistente = await prisma.usuarios.findFirst({
        where: { OR: [{ nombre_usuario: nombreUsuario }, { correo: email }] }
    });
    if (usuarioExistente) throw new Error('El usuario o email ya está registrado');

    const passwordEncriptada = await bcrypt.hash(password, VUELTAS_BCRYPT);

    const nuevoUsuario = await prisma.usuarios.create({
        data: {
            nombre_usuario: nombreUsuario,
            correo: email,
            alias: nombreUsuario,
            contrasena_hash: passwordEncriptada,
            metodo_auth: "local",
            puntos_experiencia: 0
        },
        select: {
            id: true,
            nombre_usuario: true,
            correo: true,
            alias: true,
            puntos_experiencia: true,
            metodo_auth: true,
            fecha_registro: true
        }
    });

    return { usuario: nuevoUsuario, token: generarToken(nuevoUsuario.id), mensaje: 'Registro exitoso' };
}

async function iniciarSesion(email, password) {
    if (!email || !password) throw new Error('Email y contraseña son obligatorios');

    const usuario = await prisma.usuarios.findUnique({
        where: { correo: email },
        select: {
            id: true,
            nombre_usuario: true,
            correo: true,
            alias: true,
            contrasena_hash: true,
            metodo_auth: true,
            puntos_experiencia: true
        }
    });

    if (!usuario) throw new Error('Email o contraseña incorrectos');

    const passwordCorrecta = await bcrypt.compare(password, usuario.contrasena_hash);
    if (!passwordCorrecta) throw new Error('Email o contraseña incorrectos');

    const { contrasena_hash, ...usuarioSeguro } = usuario;
    return { usuario: usuarioSeguro, token: generarToken(usuario.id), mensaje: 'Sesión iniciada' };
}

async function obtenerPerfilUsuario(idUsuario) {
    const usuario = await prisma.usuarios.findUnique({
        where: { id: idUsuario },
        select: {
            id: true,
            nombre_usuario: true,
            correo: true,
            alias: true,
            metodo_auth: true,
            puntos_experiencia: true,
            fecha_registro: true
        }
    });
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario;
}

async function actualizarPerfilUsuario(idUsuario, datos) {
    const dataAActualizar = {};
    const requiereVerificacion = !!(datos.nombre_usuario || datos.correo || datos.contrasena || datos.alias);

    const usuarioActual = await prisma.usuarios.findUnique({
        where: { id: idUsuario },
        select: { contrasena_hash: true, nombre_usuario: true, correo: true, metodo_auth: true }
    });

    if (requiereVerificacion) {
        const esUsuarioGoogle = usuarioActual.metodo_auth === 'google';
        const estaEstableciendoPassPorPrimeraVez = esUsuarioGoogle && datos.contrasena && !datos.contrasena_actual;

        if (!estaEstableciendoPassPorPrimeraVez && !datos.contrasena_actual) {
            throw new Error('Se requiere la contraseña actual para confirmar los cambios');
        }

        if (!estaEstableciendoPassPorPrimeraVez) {
            const passwordCorrecta = await bcrypt.compare(datos.contrasena_actual, usuarioActual.contrasena_hash);
            if (!passwordCorrecta) throw new Error('La contraseña actual es incorrecta');
        }

        if (datos.nombre_usuario && datos.nombre_usuario !== usuarioActual.nombre_usuario) {
            if (!validarNombreUsuario(datos.nombre_usuario)) throw new Error('Nombre de usuario inválido');
            const existe = await prisma.usuarios.findUnique({ where: { nombre_usuario: datos.nombre_usuario } });
            if (existe) throw new Error('Nombre de usuario en uso');
            dataAActualizar.nombre_usuario = datos.nombre_usuario;
        }

        if (datos.correo && datos.correo !== usuarioActual.correo) {
            if (!validarEmail(datos.correo)) throw new Error('Email inválido');
            const existe = await prisma.usuarios.findUnique({ where: { correo: datos.correo } });
            if (existe) throw new Error('Email en uso');
            dataAActualizar.correo = datos.correo;
        }

        if (datos.contrasena) {
            const validacion = validarContraseña(datos.contrasena);
            if (!validacion.esValida) throw new Error(validacion.errores.join('; '));
            dataAActualizar.contrasena_hash = await bcrypt.hash(datos.contrasena, VUELTAS_BCRYPT);
        }

        if (datos.alias !== undefined) dataAActualizar.alias = datos.alias;
    }

    if (datos.puntos_experiencia !== undefined) dataAActualizar.puntos_experiencia = datos.puntos_experiencia;

    if (Object.keys(dataAActualizar).length === 0) return await obtenerPerfilUsuario(idUsuario);

    const usuarioActualizado = await prisma.usuarios.update({
        where: { id: idUsuario },
        data: dataAActualizar,
        select: {
            id: true,
            nombre_usuario: true,
            correo: true,
            alias: true,
            metodo_auth: true,
            puntos_experiencia: true,
            fecha_registro: true
        }
    });

    return usuarioActualizado;
}

async function eliminarUsuario(idUsuario, contrasena) {
    const usuarioActual = await prisma.usuarios.findUnique({
        where: { id: idUsuario },
        select: { contrasena_hash: true, metodo_auth: true }
    });

    if (!usuarioActual) throw new Error('Usuario no encontrado');

    if (usuarioActual.metodo_auth === 'local') {
        if (!contrasena) throw new Error('Se requiere contraseña');
        const correcta = await bcrypt.compare(contrasena, usuarioActual.contrasena_hash);
        if (!correcta) throw new Error('Contraseña incorrecta');
    }

    await prisma.usuarios.delete({ where: { id: idUsuario } });
    return { mensaje: 'Cuenta eliminada' };
}

async function exportarDatosUsuario(idUsuario) {
    const perfil = await prisma.usuarios.findUnique({
        where: { id: idUsuario },
        select: { nombre_usuario: true, correo: true, alias: true, puntos_experiencia: true, fecha_registro: true }
    });
    if (!perfil) throw new Error('Usuario no encontrado');

    const [diario, meditacion, habitos, tareas, tareasPendientes] = await Promise.all([
        prisma.entradas_diario.findMany({ where: { usuario_id: idUsuario }, orderBy: { fecha: 'asc' } }),
        prisma.sesiones_meditacion.findMany({ where: { usuario_id: idUsuario }, orderBy: { fecha: 'asc' } }),
        prisma.habitos.findMany({
            where: { usuario_id: idUsuario },
            include: { registros_cumplimiento: { select: { fecha: true }, orderBy: { fecha: 'asc' } } }
        }),
        prisma.tareas_diarias.findMany({
            where: { usuario_id: idUsuario },
            include: { registros_cumplimiento: { select: { fecha: true }, orderBy: { fecha: 'asc' } } }
        }),
        prisma.tareas_pendientes.findMany({ where: { usuario_id: idUsuario, completada: false } })
    ]);

    // Formato estándar de exportación/importación de ImproveMe v1.0
    return {
        formato_version: "1.0",
        aplicacion: "ImproveMe",
        fecha_exportacion: new Date().toISOString(),
        usuario: {
            nombre_usuario: perfil.nombre_usuario,
            correo: perfil.correo,
            alias: perfil.alias,
            puntos_experiencia: perfil.puntos_experiencia,
            fecha_registro: perfil.fecha_registro,
        },
        habitos: habitos.map(h => ({
            nombre: h.nombre,
            estado: h.estado,
            frecuencia_semanal: h.frecuencia_semanal,
            registros: (h.registros_cumplimiento || []).map(r =>
                new Date(r.fecha).toISOString().split('T')[0]
            ),
        })),
        tareas_diarias: tareas.map(t => ({
            nombre: t.nombre,
            registros: (t.registros_cumplimiento || []).map(r =>
                new Date(r.fecha).toISOString().split('T')[0]
            ),
        })),
        tareas_pendientes: tareasPendientes.map(tp => ({
            nombre: tp.nombre,
            prioridad: tp.prioridad,
            completada: tp.completada,
        })),
        diario: diario.map(d => ({
            fecha: d.fecha,
            puntuacion_animo: d.puntuacion_animo,
            horas_sueno: d.horas_sueno !== null ? parseFloat(d.horas_sueno) : null,
            contenido_texto: d.contenido_texto,
        })),
        meditacion: meditacion.map(m => ({
            fecha: m.fecha,
            duracion_segundos: m.duracion_segundos,
            segundos_completados: m.segundos_completados,
            tecnica_respiracion: m.tecnica_respiracion,
            pista_musica: m.pista_musica,
        })),
    };
}

async function loginConGoogle(tokenGoogle) {
    if (!tokenGoogle) throw new Error('Token no proporcionado');

    const ticket = await clienteGoogle.verifyIdToken({
        idToken: tokenGoogle,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, sub: googleId } = ticket.getPayload();

    let usuario = await prisma.usuarios.findUnique({
        where: { correo: email },
        select: { id: true, nombre_usuario: true, correo: true, alias: true, metodo_auth: true, puntos_experiencia: true, fecha_registro: true }
    });

    if (!usuario) {
        let nombreBase = (name || email.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 18);
        let nombreUsuario = nombreBase;
        let intento = 0;
        while (await prisma.usuarios.findUnique({ where: { nombre_usuario: nombreUsuario } })) {
            intento++;
            nombreUsuario = `${nombreBase}_${intento}`;
        }

        usuario = await prisma.usuarios.create({
            data: {
                nombre_usuario: nombreUsuario,
                correo: email,
                alias: name || nombreUsuario,
                contrasena_hash: await bcrypt.hash(googleId + process.env.JWT_SECRETO, VUELTAS_BCRYPT),
                metodo_auth: "google",
                puntos_experiencia: 0
            },
            select: { id: true, nombre_usuario: true, correo: true, alias: true, metodo_auth: true, puntos_experiencia: true, fecha_registro: true }
        });
    }

    return { usuario, token: generarToken(usuario.id), mensaje: 'Login exitoso' };
}

module.exports = {
    registrarUsuario,
    iniciarSesion,
    loginConGoogle,
    obtenerPerfilUsuario,
    actualizarPerfilUsuario,
    eliminarUsuario,
    exportarDatosUsuario
};
