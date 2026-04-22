const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function guardarEntradaDiaria(req, res) {
    const { usuario_id, puntuacion_animo, horas_sueno, contenido_texto } = req.body;

    if (!usuario_id) {
        return res.status(400).json({ error: "El ID de usuario es obligatorio" });
    }

    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

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

        // 2. Procesar archivos multimedia si existen
        if (req.files) {
            
            if (req.files.imagen) {
                // Borrar la imagen anterior si existe
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
            }

            if (req.files.audio) {
                // Borrar el audio anterior si existe
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
            }
        }

        res.status(200).json({ mensaje: "Entrada guardada correctamente", entrada });
    } catch (error) {
        console.error("Error al guardar entrada:", error);
        res.status(500).json({ error: "No se pudo guardar la entrada diaria" });
    }
}

async function obtenerEntradaHoy(req, res) {
    const { usuarioId } = req.params;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

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
        // Crear fechas de inicio y fin del mes
        const fechaInicio = new Date(anio, mes - 1, 1);
        const fechaFin = new Date(anio, mes, 1);

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
