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
            const multimedia = [];
            
            if (req.files.imagen) {
                multimedia.push({
                    entrada_id: entrada.id,
                    tipo_archivo: 'imagen',
                    url_archivo: `/uploads/${req.files.imagen[0].filename}`
                });
            }

            if (req.files.audio) {
                multimedia.push({
                    entrada_id: entrada.id,
                    tipo_archivo: 'audio',
                    url_archivo: `/uploads/${req.files.audio[0].filename}`
                });
            }

            if (multimedia.length > 0) {
                // Para simplificar, si ya existen archivos para esta entrada, los borramos antes de meter los nuevos
                // (O podrías gestionarlo de forma que se acumulen)
                await prisma.multimedia.deleteMany({
                    where: { entrada_id: entrada.id }
                });

                await prisma.multimedia.createMany({
                    data: multimedia
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

module.exports = {
    guardarEntradaDiaria,
    obtenerEntradaHoy
};
