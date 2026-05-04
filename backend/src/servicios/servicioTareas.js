const prisma = require('../configuracion/baseDatos');

// Helper: obtiene la fecha de hoy en UTC (medianoche UTC)
// Usa métodos UTC consistentemente para evitar desfases por zona horaria del servidor
function obtenerHoyUTC() {
    const ahora = new Date();
    return new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()));
}

async function obtenerGamificacion(usuarioId) {
    const hoy = obtenerHoyUTC();

    const habitosDB = await prisma.habitos.findMany({
        where: { usuario_id: usuarioId },
        include: {
            registros_cumplimiento: {
                where: { fecha: hoy },
                take: 1
            }
        }
    });
    const diariasDB = await prisma.tareas_diarias.findMany({
        where: { usuario_id: usuarioId },
        include: {
            registros_cumplimiento: {
                where: { fecha: hoy },
                take: 1
            }
        }
    });
    const tareasDB = await prisma.tareas_pendientes.findMany({ where: { usuario_id: usuarioId } });

    // Para hábitos: el estado de HOY se lee del registro diario, no de la tabla principal.
    // Si no hay registro para hoy → el hábito se muestra como no marcado (null).
    const habitos = habitosDB.map(h => {
        const registroHoy = h.registros_cumplimiento[0] || null;
        return {
            id: h.id,
            nombre: h.nombre,
            racha: h.racha,
            rachaAnterior: h.racha_anterior,
            estado: registroHoy ? registroHoy.estado : null,
            tipo: 'habito',
            fechaCreacion: h.fecha_creacion ? h.fecha_creacion.getTime() : Date.now(),
            frecuenciaSemanal: h.frecuencia_semanal || 7
        };
    });

    // Para diarias: la completitud de HOY se lee del registro diario.
    // Si no hay registro para hoy → la diaria se muestra como no completada.
    const diarias = diariasDB.map(d => {
        const registroHoy = d.registros_cumplimiento[0] || null;
        return {
            id: d.id,
            nombre: d.nombre,
            completada: registroHoy ? registroHoy.fue_completada : false,
            racha: d.racha,
            tipo: 'diaria',
            fechaCreacion: d.fecha_creacion ? d.fecha_creacion.getTime() : Date.now()
        };
    });

    // Las tareas pendientes (To-Dos) NO se reinician: se mantienen hasta que se borren.
    const tareas = tareasDB.map(t => ({
        id: t.id,
        nombre: t.nombre,
        completada: t.completada,
        prioridad: t.prioridad,
        tipo: 'tarea',
        fechaCreacion: t.fecha_creacion ? t.fecha_creacion.getTime() : Date.now()
    }));

    return { habitos, diarias, tareas };
}

async function sincronizarGamificacion(usuarioId, datos) {
    const hoy = obtenerHoyUTC();

    // Protección contra datos nulos/undefined
    const habitosRecibidos = datos.habitos || [];
    const diariasRecibidas = datos.diarias || [];
    const tareasRecibidas = datos.tareas || [];

    await prisma.$transaction(async (tx) => {
        // --- 1. PROCESAR HÁBITOS ---
        const habitosExistentes = await tx.habitos.findMany({ where: { usuario_id: usuarioId } });
        const idsExistentesHabitos = new Set(habitosExistentes.map(h => h.id));

        // IDs que el frontend reconoce como existentes en BD (no temporales)
        const idsHabitosConservar = habitosRecibidos
            .filter(h => typeof h.id === 'number' && h.id < 1000000000000 && idsExistentesHabitos.has(h.id))
            .map(h => h.id);

        // Eliminar solo si el frontend envía al menos un item con ID real (de BD).
        // Si todos los IDs son temporales (nuevos), NO eliminamos nada todavía.
        // Esto evita el bug de deleteMany con notIn:[] que borra TODOS los registros.
        if (habitosRecibidos.length === 0 || idsHabitosConservar.length > 0) {
            await tx.habitos.deleteMany({
                where: { usuario_id: usuarioId, id: { notIn: idsHabitosConservar } }
            });
        }

        for (const h of habitosRecibidos) {
            let habitoId;
            const existeEnBD = typeof h.id === 'number' && h.id < 1000000000000 && idsExistentesHabitos.has(h.id);

            if (existeEnBD) {
                const actualizado = await tx.habitos.update({
                    where: { id: h.id },
                    data: {
                        nombre: h.nombre,
                        racha: h.racha || 0,
                        racha_anterior: h.rachaAnterior || 0,
                        estado: h.estado,
                        frecuencia_semanal: h.frecuenciaSemanal || 7
                    }
                });
                habitoId = actualizado.id;
            } else {
                const nuevo = await tx.habitos.create({
                    data: {
                        usuario_id: usuarioId,
                        nombre: h.nombre,
                        racha: h.racha || 0,
                        racha_anterior: h.rachaAnterior || 0,
                        estado: h.estado,
                        fecha_creacion: new Date(h.fechaCreacion || Date.now()),
                        frecuencia_semanal: h.frecuenciaSemanal || 7
                    }
                });
                habitoId = nuevo.id;
            }

            // Guardar Histórico de Hábito para hoy
            if (h.estado) {
                await tx.registros_habitos.upsert({
                    where: { habito_id_fecha: { habito_id: habitoId, fecha: hoy } },
                    update: { estado: h.estado },
                    create: { habito_id: habitoId, fecha: hoy, estado: h.estado }
                });
            } else {
                await tx.registros_habitos.deleteMany({
                    where: { habito_id: habitoId, fecha: hoy }
                });
            }
        }

        // --- 2. PROCESAR DIARIAS ---
        const diariasExistentes = await tx.tareas_diarias.findMany({ where: { usuario_id: usuarioId } });
        const idsExistentesDiarias = new Set(diariasExistentes.map(d => d.id));

        const idsDiariasConservar = diariasRecibidas
            .filter(d => typeof d.id === 'number' && d.id < 1000000000000 && idsExistentesDiarias.has(d.id))
            .map(d => d.id);

        // Igual protección: solo eliminar si hay IDs reales o la lista está vacía
        if (diariasRecibidas.length === 0 || idsDiariasConservar.length > 0) {
            await tx.tareas_diarias.deleteMany({
                where: { usuario_id: usuarioId, id: { notIn: idsDiariasConservar } }
            });
        }

        for (const d of diariasRecibidas) {
            let diariaId;
            const existeEnBD = typeof d.id === 'number' && d.id < 1000000000000 && idsExistentesDiarias.has(d.id);

            if (existeEnBD) {
                const actualizado = await tx.tareas_diarias.update({
                    where: { id: d.id },
                    data: {
                        nombre: d.nombre,
                        completada: d.completada || false,
                        racha: d.racha || 0
                    }
                });
                diariaId = actualizado.id;
            } else {
                const nuevo = await tx.tareas_diarias.create({
                    data: {
                        usuario_id: usuarioId,
                        nombre: d.nombre,
                        completada: d.completada || false,
                        racha: d.racha || 0,
                        fecha_creacion: new Date(d.fechaCreacion || Date.now())
                    }
                });
                diariaId = nuevo.id;
            }

            // Guardar Histórico Diarias (solo si está completada, para no crear registros vacíos)
            if (d.completada) {
                await tx.registros_diarias.upsert({
                    where: { diaria_id_fecha: { diaria_id: diariaId, fecha: hoy } },
                    update: { fue_completada: true },
                    create: { diaria_id: diariaId, fecha: hoy, fue_completada: true }
                });
            } else {
                // Si no está completada, eliminar el registro de hoy si existía
                await tx.registros_diarias.deleteMany({
                    where: { diaria_id: diariaId, fecha: hoy }
                });
            }
        }

        // --- 3. PROCESAR TAREAS PENDIENTES (To-Dos) ---
        const tareasExistentes = await tx.tareas_pendientes.findMany({ where: { usuario_id: usuarioId } });
        const idsExistentesTareas = new Set(tareasExistentes.map(t => t.id));

        const idsTareasConservar = tareasRecibidas
            .filter(t => typeof t.id === 'number' && t.id < 1000000000000 && idsExistentesTareas.has(t.id))
            .map(t => t.id);

        // Igual protección para tareas pendientes
        if (tareasRecibidas.length === 0 || idsTareasConservar.length > 0) {
            await tx.tareas_pendientes.deleteMany({
                where: { usuario_id: usuarioId, id: { notIn: idsTareasConservar } }
            });
        }

        for (const t of tareasRecibidas) {
            const existeEnBD = typeof t.id === 'number' && t.id < 1000000000000 && idsExistentesTareas.has(t.id);
            if (existeEnBD) {
                await tx.tareas_pendientes.update({
                    where: { id: t.id },
                    data: {
                        nombre: t.nombre,
                        completada: t.completada || false,
                        prioridad: t.prioridad || 'media'
                    }
                });
            } else {
                await tx.tareas_pendientes.create({
                    data: {
                        usuario_id: usuarioId,
                        nombre: t.nombre,
                        completada: t.completada || false,
                        prioridad: t.prioridad || 'media',
                        fecha_creacion: new Date(t.fechaCreacion || Date.now())
                    }
                });
            }
        }
    });

    return await obtenerGamificacion(usuarioId);
}

module.exports = {
    obtenerGamificacion,
    sincronizarGamificacion
};
