const { obtenerEstadisticasGenerales } = require('../servicios/servicioEstadisticas');

/**
 * GET /api/estadisticas/:usuarioId
 */
async function controlarObtenerEstadisticas(req, res) {
    try {
        const usuarioId = parseInt(req.params.usuarioId);
        if (!usuarioId) {
            return res.status(400).json({ error: 'ID de usuario no válido' });
        }

        const dias = parseInt(req.query.dias) || 30;
        const stats = await obtenerEstadisticasGenerales(usuarioId, dias);
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error en controlador estadisticas:', error.message);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
}

module.exports = {
    controlarObtenerEstadisticas
};
