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
        fechaCreacion: h.fecha_creacion ? h.fecha_creacion.getTime() : Date.now()
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

        if (datos.habitos && datos.habitos.length > 0) {
            await tx.habitos.createMany({
                data: datos.habitos.map(h => ({
                    usuario_id: usuarioId,
                    nombre: h.nombre,
                    racha: h.racha,
                    racha_anterior: h.rachaAnterior || 0,
                    estado: h.estado,
                    fecha_creacion: new Date(h.fechaCreacion || Date.now())
                }))
            });
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
