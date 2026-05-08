const { obtenerEstadisticasGenerales } = require('../backend/src/servicios/servicioEstadisticas');

async function test() {
  try {
    // Probamos con el ID de usuario 1 (ajustar si es necesario)
    const stats = await obtenerEstadisticasGenerales(3, 30);
    console.log("Stats length:", stats.animoEvolucion.length);
    console.log("First item:", stats.animoEvolucion[0]);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
