const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script de diagnóstico para verificar el estado de la base de datos
 */
async function diagnostico() {
  console.log('--- DIAGNÓSTICO DE BASE DE DATOS ---');
  try {
    const totalSesiones = await prisma.sesiones_meditacion.count();
    const ultimaSesion = await prisma.sesiones_meditacion.findFirst({
      orderBy: { id: 'desc' }
    });

    console.log(`Total de sesiones registradas: ${totalSesiones}`);
    
    if (ultimaSesion) {
      console.log('Última sesión registrada:');
      console.log(`- ID: ${ultimaSesion.id}`);
      console.log(`- Usuario ID: ${ultimaSesion.usuario_id}`);
      console.log(`- Fecha: ${ultimaSesion.fecha}`);
      console.log(`- Duración: ${ultimaSesion.duracion_segundos}s`);
      console.log(`- Completado: ${ultimaSesion.segundos_completados}s`);
    } else {
      console.log('No hay sesiones registradas aún.');
    }

    const totalUsuarios = await prisma.usuarios.count();
    console.log(`Total de usuarios: ${totalUsuarios}`);

  } catch (error) {
    console.error('ERROR EN EL DIAGNÓSTICO:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnostico();
