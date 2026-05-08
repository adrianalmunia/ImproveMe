const prisma = require('../configuracion/baseDatos');

/**
 * Obtiene estadísticas detalladas para el usuario
 */
async function obtenerEstadisticasGenerales(usuarioId, dias = 30) {
    // 1. Definición de rangos temporales (ajustados a inicio/fin de día para no perder datos)
    const hoy = new Date();
    const fechaFin = new Date(hoy);
    fechaFin.setHours(23, 59, 59, 999);
    
    const fechaInicio = new Date();
    fechaInicio.setDate(hoy.getDate() - dias);
    fechaInicio.setHours(0, 0, 0, 0);
    
    const fechaInicioPrevia = new Date(fechaInicio);
    fechaInicioPrevia.setDate(fechaInicioPrevia.getDate() - dias);
    fechaInicioPrevia.setHours(0, 0, 0, 0);

    // 2. Evolución del Ánimo (rango seleccionado)
    console.log(`[Stats Debug] Usuario: ${usuarioId}, Rango: ${dias} días`);
    console.log(`[Stats Debug] Buscando entre: ${fechaInicio.toISOString()} y ${fechaFin.toISOString()}`);

    const entradasDiario = await prisma.entradas_diario.findMany({
        where: {
            usuario_id: usuarioId,
            fecha: { gte: fechaInicio, lte: fechaFin }
        },
        orderBy: { fecha: 'asc' },
        select: { fecha: true, puntuacion_animo: true, horas_sueno: true }
    });

    console.log(`[Stats Debug] Entradas encontradas: ${entradasDiario.length}`);

    // 3. Obtener Hábitos con registros en el rango actual Y el anterior
    const habitos = await prisma.habitos.findMany({
        where: { usuario_id: usuarioId },
        include: {
            registros_cumplimiento: {
                where: {
                    fecha: {
                        gte: fechaInicioPrevia,
                        lte: fechaFin
                    },
                    estado: 'positivo'
                },
                select: { fecha: true }
            }
        }
    });

    const statsHabitos = habitos.map(h => {
        const registrosEnRango = h.registros_cumplimiento.filter(r => new Date(r.fecha) >= fechaInicio);
        const registrosEnRangoPrevio = h.registros_cumplimiento.filter(r => new Date(r.fecha) >= fechaInicioPrevia && new Date(r.fecha) < fechaInicio);
        
        return {
            id: h.id,
            nombre: h.nombre,
            total: registrosEnRango.length,
            totalPrevio: registrosEnRangoPrevio.length,
            diasCompletados: registrosEnRango.map(r => {
                const f = new Date(r.fecha);
                const y = f.getUTCFullYear();
                const m = String(f.getUTCMonth() + 1).padStart(2, '0');
                const d = String(f.getUTCDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            })
        };
    });

    // 4. Rachas actuales de hábitos y diarias
    const diarias = await prisma.tareas_diarias.findMany({
        where: { usuario_id: usuarioId }
    });

    const rachasActuales = [
        ...habitos.map(h => ({ nombre: h.nombre, racha: h.racha || 0, tipo: 'habito' })),
        ...diarias.map(d => ({ nombre: d.nombre, racha: d.racha || 0, tipo: 'diaria' }))
    ].sort((a, b) => b.racha - a.racha);

    // 5. Comparación periodo actual vs periodo anterior (Ánimo)
    const entradasParaComparar = await prisma.entradas_diario.findMany({
        where: {
            usuario_id: usuarioId,
            fecha: { gte: fechaInicioPrevia, lte: fechaFin }
        },
        orderBy: { fecha: 'asc' },
        select: { fecha: true, puntuacion_animo: true }
    });

    const periodoActual = entradasParaComparar.filter(e => new Date(e.fecha) >= fechaInicio);
    const periodoAnterior = entradasParaComparar.filter(e => new Date(e.fecha) >= fechaInicioPrevia && new Date(e.fecha) < fechaInicio);

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

    // 6. Correlación Hábitos vs Ánimo
    const registrosHabitos = await prisma.registros_habitos.findMany({
        where: {
            habito: { usuario_id: usuarioId },
            fecha: { gte: fechaInicio, lte: fechaFin }
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

    // 7. Correlación Sueño vs Ánimo
    const suenoAnimo = entradasDiario.map(e => ({
        x: parseFloat(e.horas_sueno),
        y: e.puntuacion_animo
    }));

    // 8. Mejor racha histórica
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

    // 9. Estadísticas de Meditación
    const [sesionesChart, todasLasSesiones, usuario] = await Promise.all([
        prisma.sesiones_meditacion.findMany({
            where: {
                usuario_id: usuarioId,
                fecha: { gte: fechaInicio, lte: fechaFin }
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

    const medDetallePorDia = {};
    sesionesChart.forEach(s => {
        const f = s.fecha;
        const fechaUTC = `${f.getUTCFullYear()}-${String(f.getUTCMonth() + 1).padStart(2, '0')}-${String(f.getUTCDate()).padStart(2, '0')}`;
        const mins = Math.round(s.segundos_completados / 60);
        
        if (!medDetallePorDia[fechaUTC]) {
            medDetallePorDia[fechaUTC] = { total: 0, sesiones: [] };
        }
        medDetallePorDia[fechaUTC].total += mins;
        medDetallePorDia[fechaUTC].sesiones.push({ 
            minutos: mins, 
            tecnica: s.tecnica_respiracion 
        });
    });

    // 10. Cálculo de racha de meditación
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
                const fActual = new Date(fechasUnicas[i]);
                const fSiguiente = new Date(fechasUnicas[i + 1]);
                const diff = Math.round((fActual - fSiguiente) / (1000 * 60 * 60 * 24));
                if (diff === 1) rachaMedCalc++;
                else break;
            }
        }
    }

    const rachaFinal = (usuario && usuario.racha_meditacion !== null) ? usuario.racha_meditacion : rachaMedCalc;

    // 11. Respuesta unificada con los nombres de claves esperados por el frontend
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
            totalMinutosHistorico: minutosTotalesMeditacion,
            totalMinutosPeriodo: Math.round(sesionesChart.reduce((acc, curr) => acc + curr.segundos_completados, 0) / 60),
            rachaActual: rachaFinal,
            evolucion: Object.keys(medDetallePorDia).map(fecha => ({
                fecha,
                minutos: medDetallePorDia[fecha].total,
                sesiones: medDetallePorDia[fecha].sesiones
            })),
            tecnicas: (() => {
                const tecnicasCount = {};
                sesionesChart.forEach(s => {
                    const t = s.tecnica_respiracion || 'desconocida';
                    tecnicasCount[t] = (tecnicasCount[t] || 0) + 1;
                });
                return tecnicasCount;
            })()
        }
    };
}

module.exports = {
    obtenerEstadisticasGenerales
};
