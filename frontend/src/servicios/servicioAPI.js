// ================================================================================
// SERVICIO DE API - COMUNICACIÓN CON EL BACKEND
// ================================================================================
// Este servicio centraliza TODAS las comunicaciones con el backend.
// Así, si cambiamos la URL o la forma de hacer requests, solo editamos aquí.

const URL_BASE = 'http://localhost:3000/api';

// Opciones por defecto para todas las solicitudes
const OPCIONES_DEFECTO = {
    headers: {
        'Content-Type': 'application/json',
    },
};

/**
 * Realiza una solicitud genérica al API
 * @param {string} ruta - Ruta relativa (ej: 'autenticacion/login')
 * @param {string} metodo - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} datos - Datos a enviar (solo para POST/PUT)
 * @param {string} token - Token JWT (para rutas protegidas)
 * @returns {object} Respuesta del servidor
 */
async function realizarSolicitud(ruta, metodo = 'GET', datos = null, token = null, keepalive = false) {
    try {
        const opciones = {
            ...OPCIONES_DEFECTO,
            method: metodo,
            keepalive: keepalive,
        };

        // Si hay un token, lo añadimos al header de autorización
        // Esto es necesario para rutas protegidas
        if (token) {
            opciones.headers.Authorization = `Bearer ${token}`;
        }

        // Si hay datos, los procesamos
        if (datos) {
            if (datos instanceof FormData) {
                // Si es FormData, dejamos que el navegador gestione el Content-Type (para multipart/form-data)
                // y no lo stringificamos
                opciones.body = datos;
                delete opciones.headers['Content-Type'];
            } else {
                opciones.body = JSON.stringify(datos);
            }
        }

        // Realizamos la solicitud
        const respuesta = await fetch(`${URL_BASE}/${ruta}`, opciones);

        // Convertimos la respuesta a JSON
        const datosRespuesta = await respuesta.json();

        // Si la respuesta no fue OK (200-299), lanzamos un error
        if (!respuesta.ok) {
            throw new Error(
                datosRespuesta.mensaje ||
                datosRespuesta.error ||
                'Error desconocido del servidor'
            );
        }

        // Devolvemos los datos si todo fue bien
        return datosRespuesta;
    } catch (error) {
        // Si hay error de red o parsing JSON, lo mostramos
        console.error('Error en solicitud:', error.message);
        throw error;
    }
}

// ============ FUNCIONES DE AUTENTICACIÓN ============

// ============ FUNCIONES DE AUTENTICACIÓN ============

/**
 * Registra un nuevo usuario
 * @param {string} nombreUsuario - Nombre de usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña sin encriptar
 */
export async function registrarUsuario(nombreUsuario, email, password) {
    return realizarSolicitud('autenticacion/registro', 'POST', {
        nombre_usuario: nombreUsuario,
        correo: email,
        contrasena: password,
    });
}

/**
 * Inicia sesión con email y contraseña
 */
export async function iniciarSesion(email, password) {
    return realizarSolicitud('autenticacion/login', 'POST', {
        correo: email,
        contrasena: password,
    });
}

/**
 * Obtiene el perfil del usuario autenticado
 * @param {string} token - Token JWT del usuario
 * @returns {object} { usuario, mensaje }
 */
export async function obtenerPerfilUsuario(token) {
    return realizarSolicitud('autenticacion/perfil', 'GET', null, token);
}

/**
 * Actualiza el perfil del usuario autenticado (ej: puntos_experiencia)
 * @param {object} datos - Datos a actualizar
 * @param {string} token - Token JWT del usuario
 * @returns {object} { usuario, mensaje }
 */
export async function actualizarPerfil(datos, token) {
    return realizarSolicitud('autenticacion/perfil', 'PUT', datos, token);
}

// ============ FUNCIONES DE HÁBITOS ============
// (Se irán añadiendo según se avance)

/**
 * Obtiene todos los hábitos del usuario autenticado
 * @param {string} token - Token JWT del usuario
 * @returns {object} { habitos, mensaje }
 */
// ============ FUNCIONES DE GAMIFICACIÓN (HÁBITOS, DIARIAS, TAREAS) ============

/**
 * Obtiene toda la información de gamificación del usuario
 * @param {string} token - Token JWT del usuario
 * @returns {object} { habitos, diarias, tareas }
 */
export async function obtenerGamificacion(token) {
    return realizarSolicitud('tareas', 'GET', null, token);
}

/**
 * Sincroniza toda la información de gamificación del usuario
 * @param {object} datos - { habitos, diarias, tareas }
 * @param {string} token - Token JWT del usuario
 * @returns {object} { habitos, diarias, tareas } (datos actualizados con nuevas IDs si las hay)
 */
export async function sincronizarGamificacion(datos, token, keepalive = false) {
    return realizarSolicitud('tareas/sincronizar', 'PUT', datos, token, keepalive);
}

// ============ FUNCIONES DE DIARIO ============

/**
 * Guarda o actualiza la entrada de diario de hoy (soporta FormData para archivos)
 */
export async function guardarEntradaDiaria(datosEntrada, token) {
    return realizarSolicitud('diario', 'POST', datosEntrada, token);
}

/**
 * Obtiene la entrada de diario de hoy para un usuario
 */
export async function obtenerEntradaHoy(usuarioId, token) {
    return realizarSolicitud(`diario/hoy/${usuarioId}`, 'GET', null, token);
}

/**
 * Obtiene las entradas de un mes específico para un usuario
 */
export async function obtenerEntradasPorMes(usuarioId, mes, anio, token) {
    return realizarSolicitud(`diario/mes/${usuarioId}?mes=${mes}&anio=${anio}`, 'GET', null, token);
}

// ============ FUNCIONES DE MEDITACIÓN ============

/**
 * Registra una sesión de meditación completada
 * @param {object} datosSesion - { usuario_id, duracion_segundos, segundos_completados, tecnica_respiracion, pista_musica }
 */
export async function registrarSesionMeditacion(datosSesion, token) {
    return realizarSolicitud('meditacion', 'POST', datosSesion, token);
}

/**
 * Obtiene el historial de sesiones de meditación de un usuario
 * @param {number} usuarioId - ID del usuario
 * @param {string} token - Token JWT
 * @param {number} limite - Número máximo de sesiones a devolver (default 30)
 */
export async function obtenerHistorialMeditacion(usuarioId, token, limite = 30) {
    return realizarSolicitud(`meditacion/historial/${usuarioId}?limite=${limite}`, 'GET', null, token);
}

/**
 * Obtiene estadísticas resumen de meditación de un usuario
 * @param {number} usuarioId - ID del usuario
 * @param {string} token - Token JWT
 */
export async function obtenerEstadisticasMeditacion(usuarioId, token) {
    return realizarSolicitud(`meditacion/estadisticas/${usuarioId}`, 'GET', null, token);
}

/**
 * Obtiene el resumen de actividad para el calendario
 */
export async function obtenerResumenCalendario(usuarioId, mes, anio, token) {
    return realizarSolicitud(`calendario/${usuarioId}?mes=${mes}&anio=${anio}`, 'GET', null, token);
}

/**
 * Obtiene las estadísticas generales del usuario
 */
export async function obtenerEstadisticasGenerales(usuarioId, token) {
    return realizarSolicitud(`estadisticas/${usuarioId}`, 'GET', null, token);
}

/**
 * Elimina la cuenta del usuario autenticado permanentemente
 * @param {string} token - Token JWT del usuario
 */
export async function eliminarCuenta(token) {
    return realizarSolicitud('autenticacion/perfil', 'DELETE', null, token);
}

/**
 * Obtiene todos los datos del usuario para su exportación
 */
export async function exportarDatos(token) {
    return realizarSolicitud('autenticacion/exportar', 'GET', null, token);
}

export default {
    registrarUsuario,
    iniciarSesion,
    obtenerPerfilUsuario,
    actualizarPerfil,
    eliminarCuenta,
    exportarDatos,
    obtenerGamificacion,
    sincronizarGamificacion,
    guardarEntradaDiaria,
    obtenerEntradaHoy,
    obtenerEntradasPorMes,
    registrarSesionMeditacion,
    obtenerHistorialMeditacion,
    obtenerEstadisticasMeditacion,
    obtenerResumenCalendario,
    obtenerEstadisticasGenerales,
};
