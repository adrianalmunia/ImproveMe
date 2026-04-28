const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Simula el cálculo de estadísticas para un usuario específico (ID: 1)
 * Útil para depurar problemas de visualización en el dashboard
 */
async function simularEstadisticas() {
  const usuarioId = 1;
  const hoy = new Date();
  const hace30Dias = new Date();
  hace30Dias.setDate(hoy.getDate() - 30);

  try {
    const sesiones = await prisma.sesiones_meditacion.findMany({
        where: { usuario_id: usuarioId },
        orderBy: { fecha: 'desc' }
    });

    console.log("Sesiones encontradas:", sesiones.length);
    
    const medDatosPorDia = {};
    sesiones.forEach(s => {
        // Usamos formato ISO (sv-SE) para coherencia con el frontend
        const fechaLocal = s.fecha.toLocaleDateString('sv-SE'); 
        const mins = Math.round(s.segundos_completados / 60);
        medDatosPorDia[fechaLocal] = (medDatosPorDia[fechaLocal] || 0) + mins;
        console.log(`Fecha Original: ${s.fecha}, Formato Local: ${fechaLocal}, Minutos: ${mins}`);
    });

    const hoyStr = new Date().toLocaleDateString('sv-SE');
    console.log("Hoy (formato local):", hoyStr);
    console.log("Meditación hoy:", medDatosPorDia[hoyStr] || 0, "minutos");

  } catch (error) {
    console.error('Error al simular estadísticas:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

simularEstadisticas();
