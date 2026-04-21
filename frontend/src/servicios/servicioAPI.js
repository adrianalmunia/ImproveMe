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
async function realizarSolicitud(ruta, metodo = 'GET', datos = null, token = null) {
    try {
        const opciones = {
            ...OPCIONES_DEFECTO,
            method: metodo,
        };

        // Si hay un token, lo añadimos al header de autorización
        // Esto es necesario para rutas protegidas
        if (token) {
            opciones.headers.Authorization = `Bearer ${token}`;
        }

        // Si hay datos (POST o PUT), los convertimos a JSON
        if (datos) {
            opciones.body = JSON.stringify(datos);
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
        console.error('❌ Error en solicitud:', error.message);
        throw error;
    }
}

// ============ FUNCIONES DE AUTENTICACIÓN ============

/**
 * Registra un nuevo usuario
 * @param {string} nombreUsuario - Nombre de usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña sin encriptar
 * @returns {object} { usuario, token, mensaje }
 */
export async function registrarUsuario(nombreUsuario, email, password) {
    return realizarSolicitud('autenticacion/registro', 'POST', {
        nombreUsuario,
        email,
        password,
    });
}

/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña sin encriptar
 * @returns {object} { usuario, token, mensaje }
 */
export async function iniciarSesion(email, password) {
    return realizarSolicitud('autenticacion/login', 'POST', {
        email,
        password,
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

// ============ FUNCIONES DE HÁBITOS ============
// (Se irán añadiendo según avancemos)

/**
 * Obtiene todos los hábitos del usuario autenticado
 * @param {string} token - Token JWT del usuario
 * @returns {object} { habitos, mensaje }
 */
export async function obtenerHabitos(token) {
    return realizarSolicitud('habitos', 'GET', null, token);
}

/**
 * Crea un nuevo hábito
 * @param {object} datosHabito - { nombre, categoria, icono }
 * @param {string} token - Token JWT del usuario
 * @returns {object} { habito, mensaje }
 */
export async function crearHabito(datosHabito, token) {
    return realizarSolicitud('habitos', 'POST', datosHabito, token);
}

/**
 * Actualiza un hábito existente
 * @param {number} idHabito - ID del hábito
 * @param {object} datosActualizacion - Cambios a realizar
 * @param {string} token - Token JWT del usuario
 * @returns {object} { habito, mensaje }
 */
export async function actualizarHabito(idHabito, datosActualizacion, token) {
    return realizarSolicitud(
        `habitos/${idHabito}`,
        'PUT',
        datosActualizacion,
        token
    );
}

/**
 * Elimina un hábito
 * @param {number} idHabito - ID del hábito
 * @param {string} token - Token JWT del usuario
 * @returns {object} { mensaje }
 */
export async function eliminarHabito(idHabito, token) {
    return realizarSolicitud(`habitos/${idHabito}`, 'DELETE', null, token);
}

export default {
    registrarUsuario,
    iniciarSesion,
    obtenerPerfilUsuario,
    obtenerHabitos,
    crearHabito,
    actualizarHabito,
    eliminarHabito,
};
