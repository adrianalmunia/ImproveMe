const { obtenerResumenCalendario } = require('../servicios/servicioCalendario');

/**
 * Controlador: Obtener resumen mensual para el calendario
 * GET /api/calendario/:usuarioId?mes=4&anio=2026
 */
async function controlarObtenerCalendario(req, res) {
    try {
        const usuarioId = req.usuarioId;
        const { mes, anio } = req.query;

        if (!mes || !anio) {
            return res.status(400).json({ error: 'Faltan parámetros (mes, anio)' });
        }

        const resumen = await obtenerResumenCalendario(usuarioId, parseInt(mes), parseInt(anio));
        
        return res.status(200).json(resumen);
    } catch (error) {
        console.error('Error en controlador calendario:', error.message);
        return res.status(500).json({ 
            error: 'Error al obtener datos del calendario',
            mensaje: error.message 
        });
    }
}

module.exports = {
    controlarObtenerCalendario
};
