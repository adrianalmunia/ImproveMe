const { obtenerGamificacion, sincronizarGamificacion } = require('../servicios/servicioTareas');

async function controlarObtenerGamificacion(req, res) {
    try {
        const idUsuario = req.usuarioId;
        const datos = await obtenerGamificacion(idUsuario);
        return res.status(200).json(datos);
    } catch (error) {
        console.error('Error al obtener gamificacion:', error);
        return res.status(500).json({ error: 'Error del servidor' });
    }
}

async function controlarSincronizarGamificacion(req, res) {
    try {
        const idUsuario = req.usuarioId;
        const datos = req.body;
        const nuevosDatos = await sincronizarGamificacion(idUsuario, datos);
        return res.status(200).json(nuevosDatos);
    } catch (error) {
        console.error('Error al sincronizar gamificacion:', error);
        return res.status(500).json({ error: 'Error al sincronizar datos' });
    }
}

module.exports = {
    controlarObtenerGamificacion,
    controlarSincronizarGamificacion
};
