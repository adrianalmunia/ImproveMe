// ================================================================================
// UTILIDADES: VALIDADORES DE DATOS
// ================================================================================
// Estas funciones validan que los datos que recibimos sean correctos
// antes de procesarlos. Esto previene errores y ataques de inyección.

/**
 * Valida que un email tenga formato correcto
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido, false si no
 */
function validarEmail(email) {
    // Expresión regular para emails
    const expresionEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresionEmail.test(email);
}

/**
 * Valida que una contraseña cumpla con requisitos mínimos
 * @param {string} password - Contraseña a validar
 * @returns {object} { esValida: boolean, errores: [] }
 */
function validarContraseña(password) {
    const errores = [];

    if (!password || password.length < 8) {
        errores.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
        errores.push('La contraseña debe incluir al menos una mayúscula');
    }

    if (!/[0-9]/.test(password)) {
        errores.push('La contraseña debe incluir al menos un número');
    }

    return {
        esValida: errores.length === 0,
        errores
    };
}

/**
 * Valida que un nombre de usuario sea válido
 * @param {string} nombreUsuario - Nombre a validar
 * @returns {boolean} true si es válido, false si no
 */
function validarNombreUsuario(nombreUsuario) {
    // Solo letras, números y guiones bajos, entre 3 y 20 caracteres
    const expresion = /^[a-zA-Z0-9_]{3,20}$/;
    return expresion.test(nombreUsuario);
}

module.exports = {
    validarEmail,
    validarContraseña,
    validarNombreUsuario
};
