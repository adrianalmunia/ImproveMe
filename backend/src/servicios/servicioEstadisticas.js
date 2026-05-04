const prisma = require('../configuracion/baseDatos');

/**
 * Obtiene estadísticas detalladas para el usuario
 */
async function obtenerEstadisticasGenerales(usuarioId, dias = 30) {
    // 1. Evolución del Ánimo (rango seleccionado)
    const hoy = new Date();
    const haceRangoDias = new Date();
    haceRangoDias.setDate(hoy.getDate() - dias);

    const entradasDiario = await prisma.entradas_diario.findMany({
        where: {
            usuario_id: usuarioId,
            fecha: { gte: haceRangoDias }
        },
        orderBy: { fecha: 'asc' },
        select: { fecha: true, puntuacion_animo: true, horas_sueno: true }
    });

    // 2. Tasa de Cumplimiento de Hábitos
    const habitos = await prisma.habitos.findMany({
        where: { usuario_id: usuarioId },
        include: {
            registros_cumplimiento: {
                where: { fecha: { gte: haceRangoDias } }
            }
        }
    });

    const statsHabitos = habitos.map(h => {
        const completados = h.registros_cumplimiento.filter(r => r.estado === 'positivo').length;
        // Calculamos el porcentaje basado en el rango solicitado
        const totalDias = dias;
        return {
            nombre: h.nombre,
            porcentaje: Math.round((completados / totalDias) * 100),
            total: completados
        };
    });

    // 2b. Rachas actuales de hábitos y diarias (para "Más consistentes ahora")
    const diarias = await prisma.tareas_diarias.findMany({
        where: { usuario_id: usuarioId }
    });

    const rachasActuales = [
        ...habitos.map(h => ({ nombre: h.nombre, racha: h.racha || 0, tipo: 'habito' })),
        ...diarias.map(d => ({ nombre: d.nombre, racha: d.racha || 0, tipo: 'diaria' }))
    ].sort((a, b) => b.racha - a.racha);

    // 2c. Comparación periodo actual vs periodo anterior
    const haceDobleRango = new Date();
    haceDobleRango.setDate(hoy.getDate() - (dias * 2));

    // Necesitamos volver a consultar o filtrar de una lista más larga
    const entradasParaComparar = await prisma.entradas_diario.findMany({
        where: {
            usuario_id: usuarioId,
            fecha: { gte: haceDobleRango }
        },
        orderBy: { fecha: 'asc' },
        select: { fecha: true, puntuacion_animo: true }
    });

    const periodoActual = entradasParaComparar.filter(e => e.fecha >= haceRangoDias);
    const periodoAnterior = entradasParaComparar.filter(e => e.fecha >= haceDobleRango && e.fecha < haceRangoDias);

    const avgActual = periodoActual.length > 0
        ? periodoActual.reduce((acc, e) => acc + e.puntuacion_animo, 0) / periodoActual.length
        : null;
    const avgAnterior = periodoAnterior.length > 0
        ? periodoAnterior.reduce((acc, e) => acc + e.puntuacion_animo, 0) / periodoAnterior.length
        : null;

    let comparacionTemporal = null;
    if (avgActual !== null && avgAnterior !== null && avgAnterior > 0) {
        comparacionTemporal = Math.round(((avgActual - avgAnterior) / avgAnterior) * 100);
    }

    // 3. Correlación Hábitos vs Ánimo
    // Promedio de ánimo en días con hábitos completados vs días sin ellos
    const registrosHabitos = await prisma.registros_habitos.findMany({
        where: {
            habito: { usuario_id: usuarioId },
            fecha: { gte: haceRangoDias }
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

    // 4. Correlación Sueño vs Ánimo
    const suenoAnimo = entradasDiario.map(e => ({
        x: parseFloat(e.horas_sueno),
        y: e.puntuacion_animo
    }));

    // 5. Mejor racha histórica (puede ser hábito o tarea diaria)
    const [mejorHabitoHistorico, mejorDiariaHistorica] = await Promise.all([
        prisma.habitos.findFirst({
            where: { usuario_id: usuarioId },
            orderBy: [
                { racha: 'desc' },
                { racha_anterior: 'desc' }
            ]
        }),
        prisma.tareas_diarias.findFirst({
            where: { usuario_id: usuarioId },
            orderBy: { racha: 'desc' }
        })
    ]);

    let mejorRachaHistorica = null;
    const rachaHabito = mejorHabitoHistorico ? Math.max(mejorHabitoHistorico.racha, mejorHabitoHistorico.racha_anterior) : 0;
    const rachaDiaria = mejorDiariaHistorica ? mejorDiariaHistorica.racha : 0;

    if (rachaHabito >= rachaDiaria && mejorHabitoHistorico) {
        mejorRachaHistorica = {
            nombre: mejorHabitoHistorico.nombre,
            racha: rachaHabito
        };
    } else if (mejorDiariaHistorica) {
        mejorRachaHistorica = {
            nombre: mejorDiariaHistorica.nombre,
            racha: rachaDiaria
        };
    }

    // 6. Estadísticas de Meditación y Datos de Usuario
    const [sesionesChart, todasLasSesiones, usuario] = await Promise.all([
        prisma.sesiones_meditacion.findMany({
            where: {
                usuario_id: usuarioId,
                fecha: { gte: haceRangoDias }
            },
            orderBy: { fecha: 'asc' }
        }),
        prisma.sesiones_meditacion.findMany({
            where: { usuario_id: usuarioId },
            orderBy: { fecha: 'desc' },
            select: { fecha: true, segundos_completados: true }
        }),
        prisma.usuarios.findUnique({
            where: { id: usuarioId },
            select: { racha_meditacion: true }
        })
    ]);

    const minutosTotalesMeditacion = Math.round(todasLasSesiones.reduce((acc, curr) => acc + curr.segundos_completados, 0) / 60);

    const medDatosPorDia = {};
    sesionesChart.forEach(s => {
        // Normalizar fecha a YYYY-MM-DD usando UTC para consistencia con el calendario
        const f = s.fecha;
        const fechaUTC = `${f.getUTCFullYear()}-${String(f.getUTCMonth() + 1).padStart(2, '0')}-${String(f.getUTCDate()).padStart(2, '0')}`;
        const mins = Math.round(s.segundos_completados / 60);
        medDatosPorDia[fechaUTC] = (medDatosPorDia[fechaUTC] || 0) + mins;
    });

    // 7. Cálculo de racha de meditación real (para validación y log)
    const fechasUnicas = [...new Set(todasLasSesiones.map(s => {
        const f = s.fecha;
        return `${f.getUTCFullYear()}-${String(f.getUTCMonth() + 1).padStart(2, '0')}-${String(f.getUTCDate()).padStart(2, '0')}`;
    }))].sort().reverse();
    
    let rachaMedCalc = 0;
    const ahora = new Date();
    const hoyStr = `${ahora.getUTCFullYear()}-${String(ahora.getUTCMonth() + 1).padStart(2, '0')}-${String(ahora.getUTCDate()).padStart(2, '0')}`;
    const ayer = new Date(ahora);
    ayer.setUTCDate(ahora.getUTCDate() - 1);
    const ayerStr = `${ayer.getUTCFullYear()}-${String(ayer.getUTCMonth() + 1).padStart(2, '0')}-${String(ayer.getUTCDate()).padStart(2, '0')}`;

    if (fechasUnicas.length > 0) {
        if (fechasUnicas[0] === hoyStr || fechasUnicas[0] === ayerStr) {
            rachaMedCalc = 1;
            for (let i = 0; i < fechasUnicas.length - 1; i++) {
                const actual = new Date(fechasUnicas[i]);
                const siguiente = new Date(fechasUnicas[i + 1]);
                const diff = Math.round((actual - siguiente) / (1000 * 60 * 60 * 24));
                if (diff === 1) rachaMedCalc++;
                else break;
            }
        }
    }

    // Usamos el valor de la BD si existe, si no el calculado
    const rachaFinal = (usuario && usuario.racha_meditacion !== null) ? usuario.racha_meditacion : rachaMedCalc;

    console.log(`[Stats] Usuario ${usuarioId}: Racha DB: ${usuario?.racha_meditacion}, Racha Calc: ${rachaMedCalc}`);

    // Respuesta unificada con TODOS los datos
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
        mejorHabitoHistorico: mejorRachaHistorica,
        rachasActuales,
        comparacionTemporal,
        meditacion: {
            totalMinutos: minutosTotalesMeditacion,
            rachaActual: rachaFinal,
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
