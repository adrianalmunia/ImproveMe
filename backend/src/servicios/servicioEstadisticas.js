const prisma = require('../configuracion/baseDatos');

/**
 * Obtiene estadísticas detalladas para el usuario
 */
async function obtenerEstadisticasGenerales(usuarioId) {
    // 1. Evolución del Ánimo (últimos 30 días)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    const entradasDiario = await prisma.entradas_diario.findMany({
        where: {
            usuario_id: usuarioId,
            fecha: { gte: hace30Dias }
        },
        orderBy: { fecha: 'asc' },
        select: { fecha: true, puntuacion_animo: true, horas_sueno: true }
    });

    // 2. Tasa de Cumplimiento de Hábitos
    const habitos = await prisma.habitos.findMany({
        where: { usuario_id: usuarioId },
        include: {
            registros_cumplimiento: {
                where: { fecha: { gte: hace30Dias } }
            }
        }
    });

    const statsHabitos = habitos.map(h => {
        const completados = h.registros_cumplimiento.filter(r => r.estado === 'positivo').length;
        const totalDias = 30; // Simplificado
        return {
            nombre: h.nombre,
            porcentaje: Math.round((completados / totalDias) * 100),
            total: completados
        };
    });

    // 3. Correlación Hábitos vs Ánimo
    // Promedio de ánimo en días con hábitos completados vs días sin ellos
    const registrosHabitos = await prisma.registros_habitos.findMany({
        where: {
            habito: { usuario_id: usuarioId },
            fecha: { gte: hace30Dias }
        },
        include: { habito: true }
    });

    const correlacion = {};
    habitos.forEach(h => {
        const diasConHabito = registrosHabitos.filter(r => r.habito_id === h.id && r.estado === 'positivo').map(r => r.fecha.toISOString().split('T')[0]);
        
        const animoCon = entradasDiario.filter(e => diasConHabito.includes(e.fecha.toISOString().split('T')[0]));
        const animoSin = entradasDiario.filter(e => !diasConHabito.includes(e.fecha.toISOString().split('T')[0]));

        const avgCon = animoCon.length > 0 ? animoCon.reduce((acc, curr) => acc + curr.puntuacion_animo, 0) / animoCon.length : 0;
        const avgSin = animoSin.length > 0 ? animoSin.reduce((acc, curr) => acc + curr.puntuacion_animo, 0) / animoSin.length : 0;

        correlacion[h.nombre] = {
            con: parseFloat(avgCon.toFixed(1)),
            sin: parseFloat(avgSin.toFixed(1))
        };
    });

    const suenoAnimo = entradasDiario.map(e => ({
        x: parseFloat(e.horas_sueno),
        y: e.puntuacion_animo
    }));

    // 5. Mejor hábito histórico (basado en racha)
    const mejorHabitoHistorico = await prisma.habitos.findFirst({
        where: { usuario_id: usuarioId },
        orderBy: [
            { racha: 'desc' },
            { racha_anterior: 'desc' }
        ]
    });

    return {
        animoEvolucion: entradasDiario.map(e => ({
            fecha: e.fecha.toISOString().split('T')[0],
            valor: e.puntuacion_animo,
            sueno: parseFloat(e.horas_sueno)
        })),
        cumplimientoHabitos: statsHabitos,
        correlacionHabitoAnimo: correlacion,
        correlacionSuenoAnimo: suenoAnimo,
        mejorHabitoHistorico: mejorHabitoHistorico ? {
            nombre: mejorHabitoHistorico.nombre,
            racha: Math.max(mejorHabitoHistorico.racha, mejorHabitoHistorico.racha_anterior)
        } : null
    };

    // 6. Estadísticas de Meditación
    const [sesionesChart, todasLasSesiones] = await Promise.all([
        prisma.sesiones_meditacion.findMany({
            where: {
                usuario_id: usuarioId,
                fecha: { gte: hace30Dias }
            },
            orderBy: { fecha: 'asc' }
        }),
        prisma.sesiones_meditacion.findMany({
            where: { usuario_id: usuarioId },
            orderBy: { fecha: 'desc' },
            select: { fecha: true, segundos_completados: true }
        })
    ]);

    const minutosTotalesMeditacion = Math.round(todasLasSesiones.reduce((acc, curr) => acc + curr.segundos_completados, 0) / 60);

    const medDatosPorDia = {};
    sesionesChart.forEach(s => {
        // Normalizar fecha a YYYY-MM-DD
        const f = s.fecha;
        const fechaLocal = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
        const mins = Math.round(s.segundos_completados / 60);
        medDatosPorDia[fechaLocal] = (medDatosPorDia[fechaLocal] || 0) + mins;
    });

    // 7. Cálculo de racha de meditación real (basado en todos los registros históricos)
    const fechasUnicas = [...new Set(todasLasSesiones.map(s => {
        const f = s.fecha;
        return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
    }))].sort().reverse();
    
    let rachaMed = 0;
    const ahora = new Date();
    const hoyStr = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
    const ayer = new Date();
    ayer.setDate(ahora.getDate() - 1);
    const ayerStr = `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`;

    if (fechasUnicas.length > 0) {
        if (fechasUnicas[0] === hoyStr || fechasUnicas[0] === ayerStr) {
            rachaMed = 1;
            for (let i = 0; i < fechasUnicas.length - 1; i++) {
                const actual = new Date(fechasUnicas[i]);
                const siguiente = new Date(fechasUnicas[i + 1]);
                const diff = Math.round((actual - siguiente) / (1000 * 60 * 60 * 24));
                
                if (diff === 1) {
                    rachaMed++;
                } else {
                    break;
                }
            }
        }
    }

    console.log(`[Stats] Usuario ${usuarioId}: ${todasLasSesiones.length} sesiones, Racha: ${rachaMed}, Hoy: ${medDatosPorDia[hoyStr] || 0} min`);

    return {
        animoEvolucion: entradasDiario.map(e => {
            const f = e.fecha;
            return {
                fecha: `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`,
                valor: e.puntuacion_animo,
                sueno: parseFloat(e.horas_sueno)
            };
        }),
        cumplimientoHabitos: statsHabitos,
        correlacionHabitoAnimo: correlacion,
        correlacionSuenoAnimo: suenoAnimo,
        mejorHabitoHistorico: mejorHabitoHistorico ? {
            nombre: mejorHabitoHistorico.nombre,
            racha: Math.max(mejorHabitoHistorico.racha, mejorHabitoHistorico.racha_anterior)
        } : null,
        meditacion: {
            totalMinutos: minutosTotalesMeditacion,
            rachaActual: rachaMed,
            evolucion: Object.keys(medDatosPorDia).map(fecha => ({
                fecha,
                minutos: medDatosPorDia[fecha]
            }))
        }
    };
}

module.exports = {
    obtenerEstadisticasGenerales
};
