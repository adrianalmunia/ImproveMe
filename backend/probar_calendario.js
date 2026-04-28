const fetch = require('node-fetch');

/**
 * Prueba la ruta del calendario para el usuario ID: 1
 */
async function probar() {
  try {
    // Nota: Requiere un token JWT válido para funcionar en rutas protegidas
    const respuesta = await fetch('http://localhost:3000/api/calendario/1?mes=4&anio=2026', {
      headers: { 'Authorization': 'Bearer <NECESITA_TOKEN_AQUI>' }
    });
    const datos = await respuesta.json();
    console.log('Datos del calendario:', datos);
  } catch (error) {
    console.error('Error al probar el calendario:', error.message);
  }
}

// probar();
