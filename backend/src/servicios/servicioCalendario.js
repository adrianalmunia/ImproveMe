const prisma = require('../configuracion/baseDatos');

// Helper: misma lógica que servicioTareas para fechas UTC consistentes
function obtenerHoyUTC() {
    const ahora = new Date();
    return new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()));
}

/**
 * Obtiene un resumen de toda la actividad del usuario en un mes específico
 * @param {number} usuarioId 
 * @param {number} mes (1-12)
 * @param {number} anio 
 */
async function obtenerResumenCalendario(usuarioId, mes, anio) {
    // Usar UTC para el rango de fechas para evitar problemas de zona horaria
    const fechaInicio = new Date(Date.UTC(anio, mes - 1, 1));
    const fechaFin = new Date(Date.UTC(anio, mes, 1));

    // 1. Obtener Entradas de Diario (Mood, Sueño)
    const entradasDiario = await prisma.entradas_diario.findMany({
        where: {
            usuario_id: usuarioId,
            fecha: { gte: fechaInicio, lt: fechaFin }
        },
        include: { archivos_multimedia: true }
    });

    // 2. Obtener Sesiones de Meditación
    const sesionesMeditacion = await prisma.sesiones_meditacion.findMany({
        where: {
            usuario_id: usuarioId,
            fecha: { gte: fechaInicio, lt: fechaFin }
        }
    });

    // 3. Obtener Registros Históricos de Hábitos
    const registrosHabitos = await prisma.registros_habitos.findMany({
        where: {
            fecha: { gte: fechaInicio, lt: fechaFin },
            habito: { usuario_id: usuarioId }
        },
        include: { habito: true }
    });

    // 4. Obtener Registros Históricos de Tareas Diarias
    const registrosDiarias = await prisma.registros_diarias.findMany({
        where: {
            fecha: { gte: fechaInicio, lt: fechaFin },
            diaria: { usuario_id: usuarioId }
        },
        include: { diaria: true }
    });

    // Organizar datos por fecha (YYYY-MM-DD)
    const resumen = {};

    // Helper para formatear fecha como clave (YYYY-MM-DD)
    // Importante: El calendario frontend usa la fecha local, por lo que aquí 
    // debemos ser cuidadosos para que coincida con la percepción del usuario.
    const aClaveFecha = (f) => {
        const d = new Date(f);
        // Usamos métodos UTC para asegurar consistencia con el almacenamiento en BD
        const anio = d.getUTCFullYear();
        const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dia = String(d.getUTCDate()).padStart(2, '0');
        return `${anio}-${mes}-${dia}`;
    };

    const hoyClave = aClaveFecha(new Date());

    // Procesar Diario
    entradasDiario.forEach(e => {
        const key = aClaveFecha(e.fecha);
        if (!resumen[key]) resumen[key] = { diario: null, meditación: [], habitos: [], diarias: [] };
        resumen[key].diario = {
            id: e.id,
            animo: e.puntuacion_animo,
            sueno: e.horas_sueno,
            contenido: e.contenido_texto,
            multimedia: e.archivos_multimedia
        };
    });

    // Procesar Meditación
    sesionesMeditacion.forEach(s => {
        const key = aClaveFecha(s.fecha);
        if (!resumen[key]) resumen[key] = { diario: null, meditación: [], habitos: [], diarias: [] };
        resumen[key].meditación.push({
            id: s.id,
            duracion: s.duracion_segundos,
            completado: s.segundos_completados,
            tecnica: s.tecnica_respiracion
        });
    });

    // Procesar Hábitos (Histórico)
    registrosHabitos.forEach(r => {
        const key = aClaveFecha(r.fecha);
        if (!resumen[key]) resumen[key] = { diario: null, meditación: [], habitos: [], diarias: [] };
        resumen[key].habitos.push({
            id: r.id,
            nombre: r.habito.nombre,
            estado: r.estado
        });
    });

    // Procesar Diarias (Histórico)
    registrosDiarias.forEach(r => {
        const key = aClaveFecha(r.fecha);
        if (!resumen[key]) resumen[key] = { diario: null, meditación: [], habitos: [], diarias: [] };
        resumen[key].diarias.push({
            id: r.id,
            nombre: r.diaria.nombre,
            completada: r.fue_completada
        });
    });

    return resumen;
}

module.exports = {
    obtenerResumenCalendario
};
