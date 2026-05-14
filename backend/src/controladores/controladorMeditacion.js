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
    console.log(`[Meditación] Body recibido:`, req.body);
    const { duracion_segundos, segundos_completados, tecnica_respiracion, pista_musica } = req.body || {};
    const usuario_id = req.usuarioId;

    if (!duracion_segundos || !tecnica_respiracion) {
        return res.status(400).json({ error: "Faltan campos obligatorios (duracion_segundos, tecnica_respiracion)" });
    }

    try {
        console.log(`[Meditación] Registrando sesión para usuario ${usuario_id}:`, req.body);

        // 1. Crear el registro de la sesión
        const sesion = await prisma.sesiones_meditacion.create({
            data: {
                usuario_id: parseInt(usuario_id),
                duracion_segundos: parseInt(duracion_segundos),
                segundos_completados: parseInt(segundos_completados || duracion_segundos),
                tecnica_respiracion,
                pista_musica: pista_musica || null,
            }
        });

        // 2. Dar recompensa de XP (ejemplo: 50 XP por sesión completada)
        // Solo damos XP si ha meditado al menos el 80% del tiempo configurado
        const porcentajeCompletado = (sesion.segundos_completados / sesion.duracion_segundos) * 100;
        let xpGanada = 0;

        if (porcentajeCompletado >= 80) {
            xpGanada = 50;
            await prisma.usuarios.update({
                where: { id: parseInt(usuario_id) },
                data: { puntos_experiencia: { increment: xpGanada } }
            });
            console.log(`[Meditación] Usuario ${usuario_id} ganó ${xpGanada} XP`);
        }

        // 3. Calcular y actualizar racha de meditación en la tabla usuarios
        const todasLasSesiones = await prisma.sesiones_meditacion.findMany({
            where: { usuario_id: parseInt(usuario_id) },
            select: { fecha: true },
            orderBy: { fecha: 'desc' }
        });

        const fechasUnicas = [...new Set(todasLasSesiones.map(s => {
            const f = s.fecha;
            return `${f.getUTCFullYear()}-${String(f.getUTCMonth() + 1).padStart(2, '0')}-${String(f.getUTCDate()).padStart(2, '0')}`;
        }))].sort().reverse();

        let nuevaRacha = 0;
        const ahora = new Date();
        const hoyStr = `${ahora.getUTCFullYear()}-${String(ahora.getUTCMonth() + 1).padStart(2, '0')}-${String(ahora.getUTCDate()).padStart(2, '0')}`;
        const ayer = new Date(ahora);
        ayer.setUTCDate(ahora.getUTCDate() - 1);
        const ayerStr = `${ayer.getUTCFullYear()}-${String(ayer.getUTCMonth() + 1).padStart(2, '0')}-${String(ayer.getUTCDate()).padStart(2, '0')}`;

        if (fechasUnicas.length > 0) {
            // Comprobamos si la última sesión fue hoy o ayer
            if (fechasUnicas[0] === hoyStr || fechasUnicas[0] === ayerStr) {
                nuevaRacha = 1;
                for (let i = 0; i < fechasUnicas.length - 1; i++) {
                    // Usamos fechas UTC puras para evitar desfases de zona horaria
                    const actual = new Date(fechasUnicas[i] + 'T00:00:00Z');
                    const siguiente = new Date(fechasUnicas[i + 1] + 'T00:00:00Z');
                    const diff = Math.round((actual.getTime() - siguiente.getTime()) / (1000 * 60 * 60 * 24));
                    if (diff === 1) nuevaRacha++;
                    else if (diff > 0) break; // Si la diferencia es mayor a 1, la racha se rompe
                }
            }
        }

        await prisma.usuarios.update({
            where: { id: parseInt(usuario_id) },
            data: { racha_meditacion: nuevaRacha }
        });

        console.log(`[Meditación] Racha actualizada para usuario ${usuario_id}: ${nuevaRacha} días`);

        console.log(`[Meditación] Sesión guardada con ID: ${sesion.id}`);
        res.status(201).json({
            mensaje: "Sesión de meditación registrada",
            sesion,
            xp_ganada: xpGanada,
            nueva_racha: nuevaRacha
        });
    } catch (error) {
        console.error("Error al registrar sesión de meditación:", error);
        res.status(500).json({ error: "No se pudo registrar la sesión de meditación", detalle: error.message });
    }
}

/**
 * Obtiene el historial de sesiones de meditación de un usuario
 * Query params opcionales: limite (default 30)
 */
async function obtenerHistorial(req, res) {
    const usuarioId = req.usuarioId;
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
