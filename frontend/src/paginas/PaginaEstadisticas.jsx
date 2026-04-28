import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bar, 
  Line, 
  Radar, 
  Doughnut,
  Scatter
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  ArcElement
} from 'chart.js';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import * as servicioAPI from '../servicios/servicioAPI';
import { 
  TrendingUp, 
  Target, 
  Activity, 
  Moon, 
  Smile, 
  Calendar,
  ChevronRight,
  Zap,
  Flame,
  Award,
  Flower2
} from 'lucide-react';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const coloresMood = {
  1: '#EF4444', // Fatal
  2: '#F97316', // Mal
  3: '#FACC15', // Decente
  4: '#90BE6D', // Bien
  5: '#4D908E', // Genial
};

const obtenerColorSueno = (horas) => {
  const h = parseFloat(horas);
  // Interpolar entre Azul (#4F99CC) y Morado (#6366F1)
  // De 4 horas (azul) a 10 horas (morado)
  const ratio = Math.min(Math.max((h - 4) / 6, 0), 1);
  const r = Math.round(79 + (99 - 79) * ratio);
  const g = Math.round(153 + (102 - 153) * ratio);
  const b = Math.round(204 + (241 - 204) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
};

const PaginaEstadisticas = () => {
  const { usuario, token } = useAutenticacion();
  const [stats, setStats] = useState(null);
  const [estaCargando, setEstaCargando] = useState(true);

  useEffect(() => {
    const cargarStats = async () => {
      if (!usuario || !token) {
        setEstaCargando(false);
        return;
      }
      try {
        setEstaCargando(true);
        const data = await servicioAPI.obtenerEstadisticasGenerales(usuario.id, token);
        console.log("Stats recibidas:", data);
        setStats(data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setEstaCargando(false);
      }
    };
    cargarStats();
  }, [usuario, token]);

  // Si no hay datos, mostramos el estado de carga o el mensaje de error
  if (estaCargando) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#4F99CC] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-black text-[#2C4159] uppercase tracking-widest">Analizando tu progreso...</p>
        </div>
      </div>
    );
  }

  // VALIDACIÓN DE DATOS MÍNIMOS
  if (!stats || !stats.animoEvolucion || stats.animoEvolucion.length < 2) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-neutral-50 p-10 text-center">
        <div className="w-24 h-24 bg-white rounded-[32px] shadow-sm flex items-center justify-center mb-6 border border-dashed border-gray-200">
          <Activity size={48} className="text-gray-200" />
        </div>
        <h2 className="text-2xl font-black text-[#2C4159] mb-2 uppercase tracking-tight">Faltan datos para el análisis</h2>
        <p className="text-gray-400 max-w-sm font-medium">
          Necesitamos al menos 2 registros diarios para empezar a generar tus estadísticas. 
          ¡Sigue escribiendo en tu diario y vuelve pronto!
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 bg-[#4F99CC] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:scale-105 transition-transform"
        >
          Actualizar
        </button>
      </div>
    );
  }

  // CONFIGURACIONES DE GRÁFICOS
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#2C4159',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 12,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' }
      }
    }
  };

  // 1. Datos Evolución Ánimo
  const dataAnimo = {
    labels: stats?.animoEvolucion.map(e => new Date(e.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Estado de Ánimo',
        data: stats?.animoEvolucion.map(e => e.valor),
        borderColor: '#4F99CC',
        segment: {
          borderColor: ctx => {
            const val = ctx.p1.parsed.y;
            return coloresMood[Math.round(val)] || '#4F99CC';
          }
        },
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          
          // Gradiente vertical: Rojo (abajo) -> Verde (arriba)
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)');   // Fatal
          gradient.addColorStop(0.25, 'rgba(249, 115, 22, 0.2)'); // Mal
          gradient.addColorStop(0.5, 'rgba(250, 204, 21, 0.2)');  // Decente
          gradient.addColorStop(0.75, 'rgba(144, 190, 109, 0.2)'); // Bien
          gradient.addColorStop(1, 'rgba(77, 144, 142, 0.2)');    // Genial
          
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: stats?.animoEvolucion.map(e => coloresMood[e.valor] || '#4F99CC'),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 9,
        borderWidth: 4
      }
    ]
  };

  // 2. Datos Cumplimiento Hábitos
  const dataHabitos = {
    labels: stats?.cumplimientoHabitos.map(h => h.nombre),
    datasets: [
      {
        data: stats?.cumplimientoHabitos.map(h => h.porcentaje),
        backgroundColor: [
          '#4F99CC', '#C6A55E', '#2C4159', '#F97316', '#10B981', '#6366F1'
        ],
        borderRadius: 12,
        barThickness: 20
      }
    ]
  };

  // 3. Radar Correlación (Promedio Animo Con vs Sin Hábito)
  const habitosNombres = Object.keys(stats?.correlacionHabitoAnimo || {});
  const dataRadar = {
    labels: habitosNombres,
    datasets: [
      {
        label: 'Con Hábito',
        data: habitosNombres.map(n => stats.correlacionHabitoAnimo[n].con),
        backgroundColor: 'rgba(79, 153, 204, 0.2)',
        borderColor: '#4F99CC',
        pointBackgroundColor: '#4F99CC',
      },
      {
        label: 'Sin Hábito',
        data: habitosNombres.map(n => stats.correlacionHabitoAnimo[n].sin),
        backgroundColor: 'rgba(198, 165, 94, 0.2)',
        borderColor: '#C6A55E',
        pointBackgroundColor: '#C6A55E',
      }
    ]
  };

  // 4. Datos Meditación
  const dataMeditacion = {
    labels: stats?.meditacion?.evolucion?.map(e => new Date(e.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })) || [],
    datasets: [
      {
        label: 'Minutos Meditados',
        data: stats?.meditacion?.evolucion?.map(e => e.minutos) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#10B981',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  return (
    <div className="h-full w-full bg-neutral-50 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
      
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-black text-[#2C4159] tracking-tight">
          Tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F99CC] to-[#C6A55E]">Evolución</span>
        </h1>
        <p className="text-gray-500 font-medium mt-1">Análisis detallado de tus hábitos y bienestar emocional.</p>
      </header>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KPI Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#4F99CC]">
              <Smile size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ánimo Promedio</p>
              <p className="text-2xl font-black text-[#2C4159] leading-tight">
                {(stats?.animoEvolucion.reduce((acc, curr) => acc + curr.valor, 0) / (stats?.animoEvolucion.length || 1)).toFixed(1)}
              </p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
              <Moon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sueño Promedio</p>
              <p className="text-2xl font-black text-[#2C4159] leading-tight">
                {(stats?.animoEvolucion.reduce((acc, curr) => acc + curr.sueno, 0) / (stats?.animoEvolucion.length || 1)).toFixed(1)}h
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Target size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hábitos Activos</p>
              <p className="text-2xl font-black text-[#2C4159] leading-tight">{stats?.cumplimientoHabitos.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registros (30d)</p>
              <p className="text-2xl font-black text-[#2C4159] leading-tight">{stats?.animoEvolucion.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Flower2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Racha Zen</p>
              <p className="text-2xl font-black text-[#2C4159] leading-tight">{stats?.meditacion?.rachaActual || 0} días</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Meditado</p>
              <p className="text-2xl font-black text-[#2C4159] leading-tight">{stats?.meditacion?.totalMinutos || 0} min</p>
            </div>
          </div>
        </div>

        {/* Resumen Semanal vs Mensual */}
        <div className="lg:col-span-1 bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black text-[#2C4159] mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-[#4F99CC]" />
              Resumen Temporal
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Esta Semana</p>
                  <p className="text-3xl font-black text-[#4F99CC]">
                    {(stats?.animoEvolucion.slice(-7).reduce((acc, curr) => acc + curr.valor, 0) / (Math.min(stats?.animoEvolucion.length, 7) || 1)).toFixed(1)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">+12% vs mes</p>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  className="h-full bg-gradient-to-r from-[#4F99CC] to-[#C6A55E]" 
                />
              </div>
              
              <div className="pt-4 border-t border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Más consistentes ahora</p>
                <div className="space-y-3">
                  {stats?.cumplimientoHabitos.filter(h => h.porcentaje === stats.cumplimientoHabitos[0]?.porcentaje).slice(0, 2).map(h => (
                    <div key={h.nombre} className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                          <Flame size={16} />
                       </div>
                       <div>
                          <p className="text-[12px] font-black text-[#2C4159]">{h.nombre}</p>
                          <p className="text-[9px] font-bold text-gray-400">{h.porcentaje}%</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {stats?.mejorHabitoHistorico && (
                <div className="pt-4 border-t border-gray-50 mt-2">
                  <p className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#C6A55E] to-[#4F99CC] uppercase tracking-widest mb-2">Tu récord histórico</p>
                  <div className="bg-gradient-to-br from-neutral-50 to-white p-3 rounded-2xl border border-[#C6A55E]/20 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-[#C6A55E]">
                      <Award size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#2C4159] leading-tight">{stats.mejorHabitoHistorico.nombre}</p>
                      <p className="text-[10px] font-bold text-[#C6A55E] uppercase">Racha: {stats.mejorHabitoHistorico.racha} días</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Evolución Ánimo */}
        <div className="lg:col-span-2 bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-[#2C4159] flex items-center gap-2">
              <TrendingUp size={20} className="text-[#4F99CC]" />
              Bienestar Emocional
            </h2>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                <div className="w-2 h-2 rounded-full bg-[#4F99CC]" /> Ánimo
              </span>
            </div>
          </div>
          <div className="h-[280px]">
            <Line data={dataAnimo} options={chartOptions} />
          </div>
        </div>

        {/* Cumplimiento de Hábitos */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 h-[400px]">
          <h2 className="text-xl font-black text-[#2C4159] mb-6 flex items-center gap-2">
            <Target size={20} className="text-[#C6A55E]" />
            Consistencia
          </h2>
          <div className="h-[280px]">
            <Bar 
              data={dataHabitos} 
              options={{
                ...chartOptions,
                indexAxis: 'y',
                plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, displayColors: true } }
              }} 
            />
          </div>
        </div>

        {/* Correlación Radar */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 h-[450px]">
          <h2 className="text-xl font-black text-[#2C4159] mb-2 flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" />
            Impacto Vital
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-6">¿Cómo afectan tus hábitos a tu humor?</p>
          <div className="h-[280px] flex items-center justify-center">
            <Radar 
              data={dataRadar} 
              options={{
                ...chartOptions,
                scales: {
                  r: {
                    angleLines: { color: 'rgba(0,0,0,0.05)' },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    pointLabels: { font: { size: 10, weight: 'bold' } },
                    ticks: { display: false }
                  }
                }
              }} 
            />
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#4F99CC]">
              <div className="w-2 h-2 rounded-full bg-[#4F99CC]" /> Días CON hábito
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#C6A55E]">
              <div className="w-2 h-2 rounded-full bg-[#C6A55E]" /> Días SIN hábito
            </span>
          </div>
        </div>

        {/* Meditación Dashboard */}
        <div className="lg:col-span-1 bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-xl font-black text-[#2C4159] mb-2 flex items-center gap-2">
            <Flower2 size={20} className="text-teal-500" />
            Paz Mental
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">Tu compromiso con el mindfulness</p>
          <div className="h-[200px] mb-4">
            <Bar 
              data={dataMeditacion} 
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, tooltip: { ...chartOptions.plugins.tooltip, displayColors: true } }
              }} 
            />
          </div>
          <div className="mt-auto">
            <div className="bg-teal-50/50 rounded-3xl border border-teal-100 p-5 flex flex-col items-center justify-center gap-1">
              <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] text-center">Meditación hoy</span>
              <div className="flex items-center gap-2">
                <Flower2 size={16} className="text-teal-500" />
                <span className="text-3xl font-black text-teal-900 leading-none">
                  {(() => {
                    const ahora = new Date();
                    const hoyStr = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
                    return stats?.meditacion?.evolucion?.find(e => e.fecha === hoyStr)?.minutos || 0;
                  })()}
                  <span className="text-xs ml-1 text-teal-700/60 font-bold uppercase">min</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Análisis de Sueño vs Ánimo */}
        <div className="lg:col-span-2 bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 h-[450px]">
          <h2 className="text-xl font-black text-[#2C4159] mb-2 flex items-center gap-2">
            <Moon size={20} className="text-indigo-500" />
            Descanso vs Ánimo
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-6">Relación entre horas dormidas y bienestar</p>
          <div className="h-[300px]">
            <Scatter 
              data={{
                datasets: [{
                  label: 'Días',
                  data: stats?.correlacionSuenoAnimo,
                  backgroundColor: stats?.correlacionSuenoAnimo.map(d => obtenerColorSueno(d.x)),
                  pointRadius: 8,
                  pointHoverRadius: 10,
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.8)'
                }]
              }} 
              options={{
                ...chartOptions,
                scales: {
                  x: {
                    ...chartOptions.scales.x,
                    title: { display: true, text: 'Horas de sueño', font: { size: 10, weight: 'bold' } }
                  },
                  y: {
                    ...chartOptions.scales.y,
                    title: { display: true, text: 'Puntos de ánimo', font: { size: 10, weight: 'bold' } }
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Sección de Insights / Recomendaciones */}
        <div className="lg:col-span-3 bg-gradient-to-r from-[#2C4159] to-[#1A2836] rounded-[40px] p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 z-10">
            <span className="bg-[#4F99CC] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
              Insight de la semana
            </span>
            <h3 className="text-3xl font-black mb-4 leading-tight">
              Tus niveles de ánimo suben un <span className="text-[#C6A55E]">15%</span> cuando completas tus hábitos por la mañana.
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-xl">
              Según tus últimos 30 días, la consistencia en el hábito de "{stats?.cumplimientoHabitos[0]?.nombre || 'Meditación'}" es el factor que más influye positivamente en tu bienestar general.
            </p>
            <button className="bg-white text-[#2C4159] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#4F99CC] hover:text-white transition-all shadow-xl">
              Ver plan de optimización
            </button>
          </div>
          <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-[#4F99CC] to-[#C6A55E] flex items-center justify-center p-4 relative shrink-0">
             <Award size={80} className="text-white drop-shadow-lg" />
             <div className="absolute inset-0 border-4 border-white/10 rounded-full animate-ping" />
          </div>
          <Activity className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5" />
        </div>

      </div>
      
      {/* Footer / Padding */}
      <div className="h-20" />
    </div>
  );
};

export default PaginaEstadisticas;
