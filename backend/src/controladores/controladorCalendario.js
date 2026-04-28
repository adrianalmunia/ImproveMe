const { obtenerResumenCalendario } = require('../servicios/servicioCalendario');

/**
 * Controlador: Obtener resumen mensual para el calendario
 * GET /api/calendario/:usuarioId?mes=4&anio=2026
 */
async function controlarObtenerCalendario(req, res) {
    try {
        const usuarioId = parseInt(req.params.usuarioId);
        const { mes, anio } = req.query;

        if (!usuarioId || !mes || !anio) {
            return res.status(400).json({ error: 'Faltan parámetros (usuarioId, mes, anio)' });
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
