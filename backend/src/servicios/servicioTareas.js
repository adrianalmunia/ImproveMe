const prisma = require('../configuracion/baseDatos');

async function obtenerGamificacion(usuarioId) {
    const habitosDB = await prisma.habitos.findMany({ where: { usuario_id: usuarioId } });
    const diariasDB = await prisma.tareas_diarias.findMany({ where: { usuario_id: usuarioId } });
    const tareasDB = await prisma.tareas_pendientes.findMany({ where: { usuario_id: usuarioId } });
    
    // Mapear nombres a los que espera el frontend
    const habitos = habitosDB.map(h => ({
        id: h.id,
        nombre: h.nombre,
        racha: h.racha,
        rachaAnterior: h.racha_anterior,
        estado: h.estado,
        tipo: 'habito',
        fechaCreacion: h.fecha_creacion ? h.fecha_creacion.getTime() : Date.now(),
        frecuenciaSemanal: h.frecuencia_semanal || 7
    }));

    const diarias = diariasDB.map(d => ({
        id: d.id,
        nombre: d.nombre,
        completada: d.completada,
        racha: d.racha,
        tipo: 'diaria',
        fechaCreacion: d.fecha_creacion ? d.fecha_creacion.getTime() : Date.now()
    }));

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
    // Sincronización completa: Borramos las tareas antiguas e insertamos la foto exacta del frontend
    await prisma.$transaction(async (tx) => {
        await tx.habitos.deleteMany({ where: { usuario_id: usuarioId } });
        await tx.tareas_diarias.deleteMany({ where: { usuario_id: usuarioId } });
        await tx.tareas_pendientes.deleteMany({ where: { usuario_id: usuarioId } });

        const ahora = new Date();
        const hoy = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()));

        if (datos.habitos && datos.habitos.length > 0) {
            await tx.habitos.createMany({
                data: datos.habitos.map(h => ({
                    usuario_id: usuarioId,
                    nombre: h.nombre,
                    racha: h.racha,
                    racha_anterior: h.rachaAnterior || 0,
                    estado: h.estado,
                    fecha_creacion: new Date(h.fechaCreacion || Date.now()),
                    frecuencia_semanal: h.frecuenciaSemanal || 7
                }))
            });

            // GUARDAR HISTÓRICO: Para cada hábito con estado, creamos/actualizamos registro
            for (const h of datos.habitos) {
                if (h.estado) {
                    // Buscamos el hábito recién creado (por nombre y usuario ya que acabamos de recrearlos)
                    const habitoRecienCreado = await tx.habitos.findFirst({
                        where: { usuario_id: usuarioId, nombre: h.nombre }
                    });
                    
                    if (habitoRecienCreado) {
                        await tx.registros_habitos.upsert({
                            where: { habito_id_fecha: { habito_id: habitoRecienCreado.id, fecha: hoy } },
                            update: { estado: h.estado },
                            create: { habito_id: habitoRecienCreado.id, fecha: hoy, estado: h.estado }
                        });
                    }
                }
            }
        }
        
        if (datos.diarias && datos.diarias.length > 0) {
            await tx.tareas_diarias.createMany({
                data: datos.diarias.map(d => ({
                    usuario_id: usuarioId,
                    nombre: d.nombre,
                    completada: d.completada,
                    racha: d.racha,
                    fecha_creacion: new Date(d.fechaCreacion || Date.now())
                }))
            });

            // GUARDAR HISTÓRICO DIARIAS
            for (const d of datos.diarias) {
                const diariaRecienCreada = await tx.tareas_diarias.findFirst({
                    where: { usuario_id: usuarioId, nombre: d.nombre }
                });
                if (diariaRecienCreada) {
                    await tx.registros_diarias.upsert({
                        where: { diaria_id_fecha: { diaria_id: diariaRecienCreada.id, fecha: hoy } },
                        update: { fue_completada: d.completada },
                        create: { diaria_id: diariaRecienCreada.id, fecha: hoy, fue_completada: d.completada }
                    });
                }
            }
        }

        if (datos.tareas && datos.tareas.length > 0) {
            await tx.tareas_pendientes.createMany({
                data: datos.tareas.map(t => ({
                    usuario_id: usuarioId,
                    nombre: t.nombre,
                    completada: t.completada,
                    prioridad: t.prioridad,
                    fecha_creacion: new Date(t.fechaCreacion || Date.now())
                }))
            });
        }
    });

    return await obtenerGamificacion(usuarioId);
}

module.exports = {
    obtenerGamificacion,
    sincronizarGamificacion
};
