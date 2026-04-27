// ================================================================================
// CONTROLADOR DE MEDITACIÓN
// ================================================================================
// Gestiona el registro y consulta de sesiones de meditación completadas.

const prisma = require('../configuracion/baseDatos');

/**
 * Registra una sesión de meditación completada
 * Recibe: usuario_id, duracion_segundos, segundos_completados, tecnica_respiracion, pista_musica
 */
async function registrarSesion(req, res) {
    const { usuario_id, duracion_segundos, segundos_completados, tecnica_respiracion, pista_musica } = req.body;

    if (!usuario_id || !duracion_segundos || !tecnica_respiracion) {
        return res.status(400).json({ error: "Faltan campos obligatorios (usuario_id, duracion_segundos, tecnica_respiracion)" });
    }

    try {
        const sesion = await prisma.sesiones_meditacion.create({
            data: {
                usuario_id: parseInt(usuario_id),
                duracion_segundos: parseInt(duracion_segundos),
                segundos_completados: parseInt(segundos_completados || duracion_segundos),
                tecnica_respiracion,
                pista_musica: pista_musica || null,
            }
        });

        res.status(201).json({ mensaje: "Sesión de meditación registrada", sesion });
    } catch (error) {
        console.error("Error al registrar sesión de meditación:", error);
        res.status(500).json({ error: "No se pudo registrar la sesión de meditación" });
    }
}

/**
 * Obtiene el historial de sesiones de meditación de un usuario
 * Query params opcionales: limite (default 30)
 */
async function obtenerHistorial(req, res) {
    const { usuarioId } = req.params;
    const limite = parseInt(req.query.limite) || 30;

    try {
        const sesiones = await prisma.sesiones_meditacion.findMany({
            where: { usuario_id: parseInt(usuarioId) },
            orderBy: { fecha: 'desc' },
            take: limite,
        });

        res.status(200).json(sesiones);
    } catch (error) {
        console.error("Error al obtener historial de meditación:", error);
        res.status(500).json({ error: "Error al obtener el historial de meditación" });
    }
}

/**
 * Obtiene estadísticas resumen de meditación de un usuario
 * Devuelve: total de sesiones, minutos totales, racha actual
 */
async function obtenerEstadisticas(req, res) {
    const { usuarioId } = req.params;

    try {
        const [totalSesiones, agregados] = await Promise.all([
            prisma.sesiones_meditacion.count({
                where: { usuario_id: parseInt(usuarioId) }
            }),
            prisma.sesiones_meditacion.aggregate({
                where: { usuario_id: parseInt(usuarioId) },
                _sum: { segundos_completados: true },
            })
        ]);

        const segundosTotales = agregados._sum.segundos_completados || 0;

        res.status(200).json({
            total_sesiones: totalSesiones,
            segundos_totales: segundosTotales,
            minutos_totales: Math.floor(segundosTotales / 60),
        });
    } catch (error) {
        console.error("Error al obtener estadísticas de meditación:", error);
        res.status(500).json({ error: "Error al obtener las estadísticas" });
    }
}

module.exports = {
    registrarSesion,
    obtenerHistorial,
    obtenerEstadisticas,
};
