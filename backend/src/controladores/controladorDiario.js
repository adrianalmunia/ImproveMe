const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function guardarEntradaDiaria(req, res) {
    const { usuario_id, puntuacion_animo, horas_sueno, contenido_texto } = req.body;

    if (!usuario_id) {
        return res.status(400).json({ error: "El ID de usuario es obligatorio" });
    }

    try {
        // Intentamos crear la entrada (o actualizarla si ya existe para hoy)
        // El esquema tiene un @@unique([usuario_id, fecha])
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

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
