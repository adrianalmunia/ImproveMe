// ================================================================================
// SERVICIO DE IMPORTACIÓN DE DATOS
// ================================================================================
// Importa datos de un archivo JSON o CSV exportado desde ImproveMe.
// Evita duplicados comparando con los datos existentes del usuario.

const prisma = require('../configuracion/baseDatos');

/**
 * Calcula la racha actual de días consecutivos a partir de un array de fechas.
 * @param {Date[]|string[]} fechas - Array de fechas de cumplimiento
 * @returns {number} Días consecutivos desde hoy hacia atrás
 */
function calcularRacha(fechas) {
    if (!fechas || fechas.length === 0) return 0;

    // Normalizar a timestamps de medianoche UTC para evitar problemas de zona horaria
    const normalizadas = fechas.map(f => {
        const d = new Date(f);
        return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    });

    // Ordenar de más reciente a más antigua, sin duplicados
    const unicas = [...new Set(normalizadas)].sort((a, b) => b - a);

    const hoy = new Date();
    const hoyUTC = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());
    const MS_DIA = 86400000;

    let racha = 0;
    let esperado = hoyUTC;

    for (const ts of unicas) {
        const diffDias = Math.round((esperado - ts) / MS_DIA);
        if (diffDias === 0 || diffDias === 1) {
            racha++;
            esperado = ts; // el próximo día esperado es el anterior a este
        } else {
            break; // hueco en la racha → se termina
        }
    }

    return racha;
}

async function importarDatos(idUsuario, datos) {
    // Validación básica del formato
    if (!datos || typeof datos !== 'object') {
        throw new Error('Formato de datos inválido');
    }

    const resultado = {
        perfil: { actualizado: false },
        habitos: { importados: 0, omitidos: 0, registros: 0 },
        tareas_diarias: { importados: 0, omitidos: 0, registros: 0 },
        diario: { importados: 0, omitidos: 0 },
        meditacion: { importados: 0, omitidos: 0 },
        tareas_pendientes: { importados: 0, omitidos: 0 },
        errores: [],
    };

    // ── 0. PERFIL DE USUARIO (EXPERIENCIA) ────────────────────────────────────
    if (datos.usuario && typeof datos.usuario.puntos_experiencia === 'number') {
        try {
            await prisma.usuarios.update({
                where: { id: idUsuario },
                data: { puntos_experiencia: datos.usuario.puntos_experiencia }
            });
            resultado.perfil.actualizado = true;
        } catch (err) {
            resultado.errores.push(`Error al actualizar XP: ${err.message}`);
        }
    }

    // ── 1. HÁBITOS + REGISTROS DE CUMPLIMIENTO ────────────────────────────────
    if (Array.isArray(datos.habitos)) {
        for (const h of datos.habitos) {
            if (!h.nombre || typeof h.nombre !== 'string') continue;
            try {
                let habitoId;
                const existe = await prisma.habitos.findFirst({
                    where: { usuario_id: idUsuario, nombre: h.nombre.substring(0, 100) }
                });

                if (!existe) {
                    const nuevo = await prisma.habitos.create({
                        data: {
                            usuario_id: idUsuario,
                            nombre: h.nombre.substring(0, 100),
                            estado: h.estado || null,
                            frecuencia_semanal: parseInt(h.frecuencia_semanal) || 7,
                        }
                    });
                    habitoId = nuevo.id;
                    resultado.habitos.importados++;
                } else {
                    habitoId = existe.id;
                    resultado.habitos.omitidos++;
                }

                // Importar registros de cumplimiento y recalcular racha
                if (habitoId && Array.isArray(h.registros) && h.registros.length > 0) {
                    for (const fechaStr of h.registros) {
                        try {
                            const fecha = new Date(fechaStr);
                            if (isNaN(fecha.getTime())) continue;
                            fecha.setHours(0, 0, 0, 0);
                            // upsert evita el error de constraint único al reimportar
                            await prisma.registros_habitos.upsert({
                                where: { habito_id_fecha: { habito_id: habitoId, fecha } },
                                update: {},
                                create: { habito_id: habitoId, fecha, estado: h.estado || null },
                            });
                            resultado.habitos.registros++;
                        } catch (_) { /* omitir */ }
                    }
                    // Recalcular racha usando todos los registros del hábito
                    const todos = await prisma.registros_habitos.findMany({
                        where: { habito_id: habitoId },
                        select: { fecha: true },
                        orderBy: { fecha: 'desc' },
                    });
                    const nuevaRacha = calcularRacha(todos.map(r => r.fecha));
                    await prisma.habitos.update({ where: { id: habitoId }, data: { racha: nuevaRacha } });
                }
            } catch (err) {
                resultado.errores.push(`Hábito "${h.nombre}": ${err.message}`);
            }
        }
    }

    // ── 2. TAREAS DIARIAS + REGISTROS ──────────────────────────────────────────
    if (Array.isArray(datos.tareas_diarias)) {
        for (const t of datos.tareas_diarias) {
            if (!t.nombre || typeof t.nombre !== 'string') continue;
            try {
                let diariaId;
                const existe = await prisma.tareas_diarias.findFirst({
                    where: { usuario_id: idUsuario, nombre: t.nombre.substring(0, 100) }
                });
                if (!existe) {
                    const nueva = await prisma.tareas_diarias.create({
                        data: { usuario_id: idUsuario, nombre: t.nombre.substring(0, 100) }
                    });
                    diariaId = nueva.id;
                    resultado.tareas_diarias.importados++;
                } else {
                    diariaId = existe.id;
                    resultado.tareas_diarias.omitidos++;
                }

                // Importar registros de diaria y recalcular racha
                if (diariaId && Array.isArray(t.registros) && t.registros.length > 0) {
                    for (const fechaStr of t.registros) {
                        try {
                            const fecha = new Date(fechaStr);
                            if (isNaN(fecha.getTime())) continue;
                            fecha.setHours(0, 0, 0, 0);
                            await prisma.registros_diarias.upsert({
                                where: { diaria_id_fecha: { diaria_id: diariaId, fecha } },
                                update: {},
                                create: { diaria_id: diariaId, fecha, fue_completada: true },
                            });
                            resultado.tareas_diarias.registros++;
                        } catch (_) { /* omitir */ }
                    }
                    const todos = await prisma.registros_diarias.findMany({
                        where: { diaria_id: diariaId, fue_completada: true },
                        select: { fecha: true },
                        orderBy: { fecha: 'desc' },
                    });
                    const nuevaRacha = calcularRacha(todos.map(r => r.fecha));
                    await prisma.tareas_diarias.update({ where: { id: diariaId }, data: { racha: nuevaRacha } });
                }
            } catch (err) {
                resultado.errores.push(`Tarea Diaria "${t.nombre}": ${err.message}`);
            }
        }
    }

    // ── 3. ENTRADAS DE DIARIO ─────────────────────────────────────────────────
    if (Array.isArray(datos.diario)) {
        for (const entrada of datos.diario) {
            if (!entrada.fecha) continue;
            try {
                const fecha = new Date(entrada.fecha);
                if (isNaN(fecha.getTime())) continue;

                const existe = await prisma.entradas_diario.findFirst({
                    where: { usuario_id: idUsuario, fecha: fecha }
                });

                if (!existe) {
                    await prisma.entradas_diario.create({
                        data: {
                            usuario_id: idUsuario,
                            fecha: fecha,
                            puntuacion_animo: entrada.puntuacion_animo != null ? parseInt(entrada.puntuacion_animo) : null,
                            horas_sueno: entrada.horas_sueno != null ? parseFloat(entrada.horas_sueno) : null,
                            contenido_texto: entrada.contenido_texto || null,
                        }
                    });
                    resultado.diario.importados++;
                } else {
                    resultado.diario.omitidos++;
                }
            } catch (err) {
                resultado.errores.push(`Entrada diario ${entrada.fecha}: ${err.message}`);
            }
        }
    }

    // ── 4. SESIONES DE MEDITACIÓN ─────────────────────────────────────────────
    if (Array.isArray(datos.meditacion)) {
        for (const sesion of datos.meditacion) {
            try {
                const fechaSesion = sesion.fecha ? new Date(sesion.fecha) : null;
                if (fechaSesion && !isNaN(fechaSesion.getTime())) {
                    const existe = await prisma.sesiones_meditacion.findFirst({
                        where: {
                            usuario_id: idUsuario,
                            fecha: fechaSesion,
                            duracion_segundos: parseInt(sesion.duracion_segundos) || 0,
                        }
                    });
                    if (existe) {
                        resultado.meditacion.omitidos++;
                        continue;
                    }
                }
                await prisma.sesiones_meditacion.create({
                    data: {
                        usuario_id: idUsuario,
                        duracion_segundos: parseInt(sesion.duracion_segundos) || 0,
                        segundos_completados: parseInt(sesion.segundos_completados) || 0,
                        tecnica_respiracion: sesion.tecnica_respiracion || 'equilibrio',
                        pista_musica: sesion.pista_musica || null,
                        fecha: fechaSesion || new Date(),
                    }
                });
                resultado.meditacion.importados++;
            } catch (err) {
                resultado.errores.push(`Sesión meditación: ${err.message}`);
            }
        }
    }

    // ── 5. TAREAS PENDIENTES (TO-DOS) ─────────────────────────────────────────
    if (Array.isArray(datos.tareas_pendientes)) {
        for (const tp of datos.tareas_pendientes) {
            if (!tp.nombre || tp.completada) continue;
            try {
                const existe = await prisma.tareas_pendientes.findFirst({
                    where: { usuario_id: idUsuario, nombre: tp.nombre, completada: false }
                });
                if (!existe) {
                    await prisma.tareas_pendientes.create({
                        data: {
                            usuario_id: idUsuario,
                            nombre: tp.nombre,
                            prioridad: tp.prioridad || "media",
                            completada: false,
                        }
                    });
                    resultado.tareas_pendientes.importados++;
                } else {
                    resultado.tareas_pendientes.omitidos++;
                }
            } catch (err) {
                resultado.errores.push(`Tarea Pendiente "${tp.nombre}": ${err.message}`);
            }
        }
    }

    const totalImportados = resultado.habitos.importados + resultado.tareas_diarias.importados
        + resultado.diario.importados + resultado.meditacion.importados + resultado.tareas_pendientes.importados;

    return {
        resultado,
        totalImportados,
        mensaje: `Importación completada: ${totalImportados} elementos añadidos.`
    };
}

module.exports = { importarDatos };
