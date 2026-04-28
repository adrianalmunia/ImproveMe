const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Verifica todas las sesiones de meditación registradas en la base de datos
 */
async function verificarSesiones() {
  try {
    const sesiones = await prisma.sesiones_meditacion.findMany({
        orderBy: { fecha: 'desc' }
    });
    console.log(`Total de sesiones en la BD: ${sesiones.length}`);
    sesiones.forEach(s => {
        console.log(`ID: ${s.id}, Usuario: ${s.usuario_id}, Fecha: ${s.fecha}, Segundos: ${s.segundos_completados}`);
    });
  } catch (error) {
    console.error('Error al verificar sesiones:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verificarSesiones();
