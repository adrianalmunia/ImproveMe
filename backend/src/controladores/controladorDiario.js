const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function guardarEntradaDiaria(req, res) {
    const { usuario_id, puntuacion_animo, horas_sueno, contenido_texto } = req.body;

    if (!usuario_id) {
        return res.status(400).json({ error: "El ID de usuario es obligatorio" });
    }

    try {
        // Creamos la fecha "hoy" normalizada a medianoche UTC para evitar desfases de zona horaria
        const ahora = new Date();
        const hoy = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()));

        // Verificar si ya existe una entrada para hoy antes de hacer el upsert
        const entradaExistente = await prisma.entradas_diario.findUnique({
            where: {
                usuario_id_fecha: {
                    usuario_id: parseInt(usuario_id),
                    fecha: hoy
                }
            }
        });

        const esNuevaEntrada = !entradaExistente;
        let xpGanada = 0;
        let usuarioActualizado = null;

        // 1. Guardar o actualizar la entrada principal
        const entrada = await prisma.entradas_diario.upsert({
            where: {
                usuario_id_fecha: {
                    usuario_id: parseInt(usuario_id),
                    fecha: hoy
                }
            },
            update: {
                puntuacion_animo: parseInt(puntuacion_animo),
                horas_sueno: parseFloat(horas_sueno),
                contenido_texto: contenido_texto
            },
            create: {
                usuario_id: parseInt(usuario_id),
                puntuacion_animo: parseInt(puntuacion_animo),
                horas_sueno: parseFloat(horas_sueno),
                contenido_texto: contenido_texto,
                fecha: hoy
            }
        });

        // 2. Si es nueva entrada, otorgar XP
        if (esNuevaEntrada) {
            xpGanada = 100;
            usuarioActualizado = await prisma.usuarios.update({
                where: { id: parseInt(usuario_id) },
                data: {
                    puntos_experiencia: {
                        increment: xpGanada
                    }
                }
            });
        }

        // 3. Procesar archivos multimedia... (el resto del código sigue igual)
        const { borrar_imagen, borrar_audio } = req.body;
        // ... (continúa el procesamiento de multimedia)

        // Manejo de Imagen
        if (req.files?.imagen) {
            // Borrar la imagen anterior si existe y guardar la nueva
            await prisma.multimedia.deleteMany({
                where: { entrada_id: entrada.id, tipo_archivo: 'imagen' }
            });
            
            await prisma.multimedia.create({
                data: {
                    entrada_id: entrada.id,
                    tipo_archivo: 'imagen',
                    url_archivo: `/uploads/${req.files.imagen[0].filename}`
                }
            });
        } else if (borrar_imagen === 'true') {
            // Si el usuario marcó borrar y no hay archivo nuevo
            await prisma.multimedia.deleteMany({
                where: { entrada_id: entrada.id, tipo_archivo: 'imagen' }
            });
        }

        // Manejo de Audio
        if (req.files?.audio) {
            // Borrar el audio anterior si existe y guardar el nuevo
            await prisma.multimedia.deleteMany({
                where: { entrada_id: entrada.id, tipo_archivo: 'audio' }
            });
            
            await prisma.multimedia.create({
                data: {
                    entrada_id: entrada.id,
                    tipo_archivo: 'audio',
                    url_archivo: `/uploads/${req.files.audio[0].filename}`
                }
            });
        } else if (borrar_audio === 'true') {
            // Si el usuario marcó borrar y no hay archivo nuevo
            await prisma.multimedia.deleteMany({
                where: { entrada_id: entrada.id, tipo_archivo: 'audio' }
            });
        }

        res.status(200).json({ 
            mensaje: "Entrada guardada correctamente", 
            entrada,
            xpGanada,
            nuevoTotalXP: usuarioActualizado ? usuarioActualizado.puntos_experiencia : null
        });
    } catch (error) {
        console.error("Error al guardar entrada:", error);
        res.status(500).json({ error: "No se pudo guardar la entrada diaria" });
    }
}

async function obtenerEntradaHoy(req, res) {
    const { usuarioId } = req.params;
    const ahora = new Date();
    const hoy = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()));

    try {
        const entrada = await prisma.entradas_diario.findUnique({
            where: {
                usuario_id_fecha: {
                    usuario_id: parseInt(usuarioId),
                    fecha: hoy
                }
            },
            include: {
                archivos_multimedia: true
            }
        });
        res.json(entrada || null);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la entrada de hoy" });
    }
}

async function obtenerEntradasPorMes(req, res) {
    const { usuarioId } = req.params;
    const { mes, anio } = req.query;

    if (!usuarioId || !mes || !anio) {
        return res.status(400).json({ error: "Faltan parámetros (usuarioId, mes, anio)" });
    }

    try {
        // Crear fechas de inicio y fin del mes en UTC para coincidir con el almacenamiento
        const fechaInicio = new Date(Date.UTC(anio, mes - 1, 1));
        const fechaFin = new Date(Date.UTC(anio, mes, 1));

        const entradas = await prisma.entradas_diario.findMany({
            where: {
                usuario_id: parseInt(usuarioId),
                fecha: {
                    gte: fechaInicio,
                    lt: fechaFin
                }
            },
            include: {
                archivos_multimedia: true
            },
            orderBy: {
                fecha: 'desc'
            }
        });

        res.status(200).json(entradas);
    } catch (error) {
        console.error("Error al obtener entradas por mes:", error);
        res.status(500).json({ error: "Error al obtener las entradas del mes" });
    }
}

module.exports = {
    guardarEntradaDiaria,
    obtenerEntradaHoy,
    obtenerEntradasPorMes
};
