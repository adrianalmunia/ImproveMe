const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Comprueba el número de registros en cada tabla de la base de datos
 */
async function comprobar() {
  try {
    const u = await prisma.usuarios.count();
    const e = await prisma.entradas_diario.count();
    const m = await prisma.sesiones_meditacion.count();
    const rh = await prisma.registros_habitos.count();
    const rd = await prisma.registros_diarias.count();
    const h = await prisma.habitos.count();
    
    console.log({ 
      usuarios: u, 
      entradas: e, 
      meditaciones: m, 
      registros_habitos: rh, 
      registros_diarias: rd, 
      habitos: h 
    });
  } catch (error) {
    console.error('Error al comprobar datos:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

comprobar();
