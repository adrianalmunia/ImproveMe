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
import { useIdioma } from '../contextos/ContextoIdioma';
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
  // Días de muy poco sueño se muestran rojos
  if (h < 4) return '#EF4444';
  
  // Interpolar entre Azul (#4F99CC) y Lila (#A855F7)
  // De 4 horas (azul) a 10 horas (lila)
  const ratio = Math.min(Math.max((h - 4) / 6, 0), 1);
  const r = Math.round(79 + (168 - 79) * ratio);
  const g = Math.round(153 + (85 - 153) * ratio);
  const b = Math.round(204 + (247 - 204) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
};

const PaginaEstadisticas = () => {
  const { usuario, token } = useAutenticacion();
  const { t, idioma } = useIdioma();
  const [stats, setStats] = useState(null);
  const [estaCargando, setEstaCargando] = useState(true);
  const [rangoDias, setRangoDias] = useState(30);

  const opcionesRango = [
    { label: idioma === 'es' ? '7 Días' : '7 Days', value: 7 },
    { label: idioma === 'es' ? '15 Días' : '15 Days', value: 15 },
    { label: idioma === 'es' ? 'Mes' : 'Month', value: 30 },
    { label: idioma === 'es' ? '3 Meses' : '3 Months', value: 90 },
    { label: idioma === 'es' ? '6 Meses' : '6 Months', value: 180 },
    { label: idioma === 'es' ? 'Año' : 'Year', value: 365 },
  ];

  useEffect(() => {
    const cargarStats = async () => {
      if (!usuario || !token) {
        setEstaCargando(false);
        return;
      }
      try {
        setEstaCargando(true);
        const data = await servicioAPI.obtenerEstadisticasGenerales(usuario.id, token, rangoDias);
        console.log("Stats recibidas:", data);
        setStats(data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setEstaCargando(false);
      }
    };
    cargarStats();
  }, [usuario, token, rangoDias]);

  // Helper para truncar texto con elipsis
  const truncarLabel = (label, limite = 12) => {
    if (typeof label === 'string' && label.length > limite) {
      return label.substring(0, limite) + '...';
    }
    return label;
  };

  // Si no hay datos, mostramos el estado de carga o el mensaje de error
  if (estaCargando) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-neutral-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#4F99CC] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-black text-[#2C4159] dark:text-gray-300 uppercase tracking-widest transition-colors duration-300">
            {idioma === 'es' ? 'Analizando tu progreso...' : 'Analyzing your progress...'}
          </p>
        </div>
      </div>
    );
  }

  // VALIDACIÓN DE DATOS MÍNIMOS
  if (!stats || !stats.animoEvolucion || stats.animoEvolucion.length < 2) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-gray-900 p-10 text-center transition-colors duration-300">
        <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-[32px] shadow-sm flex items-center justify-center mb-6 border border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <Activity size={48} className="text-gray-200 dark:text-gray-600" />
        </div>
        <h2 className="text-2xl font-black text-[#2C4159] dark:text-white mb-2 uppercase tracking-tight transition-colors duration-300">
          {idioma === 'es' ? 'Faltan datos para el análisis' : 'Insufficient data for analysis'}
        </h2>
        <p className="text-gray-400 dark:text-gray-500 max-w-sm font-medium transition-colors duration-300">
          {idioma === 'es' 
            ? 'Necesitamos al menos 2 registros diarios para empezar a generar tus estadísticas. ¡Sigue escribiendo en tu diario y vuelve pronto!' 
            : 'We need at least 2 daily logs to start generating your statistics. Keep writing in your journal and come back soon!'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 bg-[#4F99CC] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:scale-105 transition-transform"
        >
          {idioma === 'es' ? 'Actualizar' : 'Refresh'}
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
        ticks: { 
          font: { size: 10, weight: 'bold' }, 
          color: '#94a3b8',
          callback: function(value) {
            const label = this.getLabelForValue(value);
            return truncarLabel(label, 15);
          }
        }
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
        label: idioma === 'es' ? 'Estado de Ánimo' : 'Mood Level',
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
        label: idioma === 'es' ? `Días completados (últimos ${rangoDias}d)` : `Days completed (last ${rangoDias}d)`,
        data: stats?.cumplimientoHabitos.map(h => h.total),
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
        label: idioma === 'es' ? 'Con Hábito' : 'With Habit',
        data: habitosNombres.map(n => stats.correlacionHabitoAnimo[n].con),
        backgroundColor: 'rgba(79, 153, 204, 0.2)',
        borderColor: '#4F99CC',
        pointBackgroundColor: '#4F99CC',
      },
      {
        label: idioma === 'es' ? 'Sin Hábito' : 'Without Habit',
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
        label: idioma === 'es' ? 'Minutos Meditados' : 'Minutes Meditated',
        data: stats?.meditacion?.evolucion?.map(e => e.minutos) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#10B981',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  // 5. Datos Distribución Ánimo (Doughnut)
  const distAnimo = [1, 2, 3, 4, 5].map(valor => {
    return stats?.animoEvolucion.filter(e => Math.round(e.valor) === valor).length;
  });

  const dataDistribucionAnimo = {
    labels: [
      idioma === 'es' ? 'Fatal' : 'Fatal',
      idioma === 'es' ? 'Mal' : 'Bad',
      idioma === 'es' ? 'Decente' : 'Decent',
      idioma === 'es' ? 'Bien' : 'Good',
      idioma === 'es' ? 'Genial' : 'Great'
    ],
    datasets: [
      {
        data: distAnimo,
        backgroundColor: Object.values(coloresMood),
        borderWidth: 0,
        hoverOffset: 15,
        borderRadius: 10,
        spacing: 5
      }
    ]
  };

  return (
    <div className="h-full w-full bg-neutral-50 dark:bg-gray-900 overflow-y-auto p-6 lg:p-10 custom-scrollbar transition-colors duration-300">
      
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#2C4159] dark:text-white tracking-tight transition-colors duration-300">
            {idioma === 'es' ? 'Tu ' : 'Your '}<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F99CC] to-[#C6A55E]">{idioma === 'es' ? 'Evolución' : 'Evolution'}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 transition-colors duration-300">
            {idioma === 'es' ? 'Análisis detallado de tus hábitos y bienestar emocional.' : 'Detailed analysis of your habits and emotional well-being.'}
          </p>
        </div>

        {/* Selector de Rango Temporal */}
        <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 self-start md:self-center transition-colors duration-300">
          {opcionesRango.map((opc) => (
            <button
              key={opc.value}
              onClick={() => setRangoDias(opc.value)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                rangoDias === opc.value
                  ? 'bg-[#2C4159] text-white shadow-md scale-105'
                  : 'text-gray-400 dark:text-gray-500 hover:text-[#2C4159] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {opc.label}
            </button>
          ))}
        </div>
      </header>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KPI Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#4F99CC]">
              <Smile size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('stats_animo_medio')}</p>
              <p className="text-2xl font-black text-[#2C4159] dark:text-white leading-tight transition-colors duration-300">
                {(stats?.animoEvolucion.reduce((acc, curr) => acc + curr.valor, 0) / (stats?.animoEvolucion.length || 1)).toFixed(1)}
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors duration-300">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
              <Moon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('stats_sueno_medio')}</p>
              <p className="text-2xl font-black text-[#2C4159] dark:text-white leading-tight transition-colors duration-300">
                {(stats?.animoEvolucion.reduce((acc, curr) => acc + curr.sueno, 0) / (stats?.animoEvolucion.length || 1)).toFixed(1)}h
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors duration-300">
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600">
              <Target size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{idioma === 'es' ? 'Hábitos Activos' : 'Active Habits'}</p>
              <p className="text-2xl font-black text-[#2C4159] dark:text-white leading-tight transition-colors duration-300">{stats?.cumplimientoHabitos.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{idioma === 'es' ? 'Registros' : 'Logs'} ({rangoDias}d)</p>
              <p className="text-2xl font-black text-[#2C4159] dark:text-white leading-tight transition-colors duration-300">{stats?.animoEvolucion.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors duration-300">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
              <Flower2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{idioma === 'es' ? 'Racha Zen' : 'Zen Streak'}</p>
              <p className="text-2xl font-black text-[#2C4159] dark:text-white leading-tight transition-colors duration-300">{stats?.meditacion?.rachaActual || 0} {idioma === 'es' ? 'días' : 'days'}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors duration-300">
            <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{idioma === 'es' ? 'Meditado (' + rangoDias + 'd)' : 'Meditated (' + rangoDias + 'd)'}</p>
              <p className="text-2xl font-black text-[#2C4159] dark:text-white leading-tight transition-colors duration-300">{stats?.meditacion?.totalMinutosPeriodo || 0} min</p>
            </div>
          </div>
        </div>

        {/* --- FILA 1 --- */}

        {/* Resumen Semanal vs Mensual */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[450px] transition-colors duration-300">
          <h2 className="text-xl font-black text-[#2C4159] dark:text-white mb-6 flex items-center gap-2 shrink-0 transition-colors duration-300">
            <Calendar size={20} className="text-[#4F99CC]" />
            {idioma === 'es' ? 'Comparativa' : 'Comparison'}
          </h2>
          
          <div className="space-y-4 shrink-0">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{idioma === 'es' ? 'Este Periodo' : 'This Period'}</p>
                <p className="text-3xl font-black text-[#4F99CC]">
                  {(stats?.animoEvolucion.reduce((acc, curr) => acc + curr.valor, 0) / (stats?.animoEvolucion.length || 1)).toFixed(1)}
                </p>
              </div>
              <div className="text-right">
                {stats?.comparacionTemporal !== null && stats?.comparacionTemporal !== undefined ? (
                  <p className={`text-[10px] font-black uppercase tracking-widest ${stats.comparacionTemporal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.comparacionTemporal >= 0 ? '+' : ''}{stats.comparacionTemporal}% {idioma === 'es' ? 'vs anterior' : 'vs previous'}
                  </p>
                ) : (
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{idioma === 'es' ? 'Sin datos previos' : 'No previous data'}</p>
                )}
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden transition-colors duration-300">
              <motion.div 
                animate={{ 
                  width: `${Math.min(100, Math.max(10, 
                    ((stats?.animoEvolucion.reduce((acc, curr) => acc + curr.valor, 0) / (stats?.animoEvolucion.length || 1)) / 5) * 100
                  ))}%` 
                }}
                className="h-full bg-gradient-to-r from-[#4F99CC] to-[#C6A55E]" 
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 pt-6 mt-4 border-t border-gray-50 dark:border-gray-700 transition-colors duration-300">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 shrink-0">{idioma === 'es' ? 'Rachas más consistentes' : 'Most consistent streaks'}</p>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {(stats?.rachasActuales || []).filter(r => r.racha > 0).length > 0 ? (
                (stats?.rachasActuales || []).filter(r => r.racha > 0).map(r => (
                  <div key={r.nombre} className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                        <Flame size={16} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black text-[#2C4159] dark:text-white truncate" title={r.nombre}>{r.nombre}</p>
                        <p className="text-[9px] font-bold text-orange-500">{r.racha} {idioma === 'es' ? (r.racha === 1 ? 'día' : 'días') : (r.racha === 1 ? 'day' : 'days')} {idioma === 'es' ? 'seguidos' : 'streak'}</p>
                     </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-gray-300 font-bold">{idioma === 'es' ? 'Aún no hay rachas activas' : 'No active streaks yet'}</p>
              )}
            </div>
          </div>

          {stats?.mejorHabitoHistorico && (
            <div className="pt-4 border-t border-gray-50 dark:border-gray-700 mt-auto shrink-0 transition-colors duration-300">
              <p className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#C6A55E] to-[#4F99CC] uppercase tracking-widest mb-2">{idioma === 'es' ? 'Tu récord histórico' : 'Your all-time record'}</p>
              <div className="bg-gradient-to-br from-neutral-50 dark:from-gray-800 to-white dark:to-gray-800 p-3 rounded-2xl border border-[#C6A55E]/20 shadow-sm flex items-center gap-3 transition-colors duration-300">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center text-[#C6A55E]">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-[#2C4159] dark:text-white leading-tight transition-colors duration-300 truncate" title={stats.mejorHabitoHistorico.nombre}>{stats.mejorHabitoHistorico.nombre}</p>
                  <p className="text-[10px] font-bold text-[#C6A55E] uppercase">{idioma === 'es' ? 'Racha' : 'Streak'}: {stats.mejorHabitoHistorico.racha} {idioma === 'es' ? 'días' : 'days'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cumplimiento de Hábitos (Consistencia) - DISEÑO PREMIUM CUSTOM */}
        <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-700 h-[450px] flex flex-col transition-colors duration-300">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-black text-[#2C4159] dark:text-white flex items-center gap-2 transition-colors duration-300">
              <Target size={20} className="text-[#C6A55E]" />
              {idioma === 'es' ? 'Consistencia' : 'Consistency'}
            </h2>
            <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 rounded-full">
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">{rangoDias} {idioma === 'es' ? 'días' : 'days'}</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-8">{idioma === 'es' ? 'Progreso de tus hábitos en el periodo' : 'Habit progress in the selected period'}</p>
          
          <div className="flex-1 overflow-y-auto scroll-personalizado pr-2 space-y-8 mt-4">
            {stats?.cumplimientoHabitos && stats.cumplimientoHabitos.length > 0 ? (
              stats.cumplimientoHabitos.map((h, idx) => {
                const pct = Math.min(100, Math.round((h.total / rangoDias) * 100));
                const pctPrevio = Math.min(100, Math.round((h.totalPrevio / rangoDias) * 100));
                const tendencia = h.totalPrevio > 0 ? Math.round(((h.total - h.totalPrevio) / h.totalPrevio) * 100) : (h.total > 0 ? 100 : 0);
                
                const colores = [
                  'text-blue-500',
                  'text-amber-500',
                  'text-emerald-500',
                  'text-purple-500',
                  'text-cyan-500'
                ];
                const colorClase = colores[idx % colores.length];

                return (
                  <div key={h.id || h.nombre} className="group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#2C4159] dark:text-gray-200 group-hover:text-[#4F99CC] transition-colors">{h.nombre}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{h.total} {idioma === 'es' ? 'días' : 'days'}</span>
                          {rangoDias <= 30 && h.totalPrevio > 0 && (
                            <span className={`flex items-center text-[9px] font-black ${tendencia >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {tendencia >= 0 ? '↑' : '↓'} {Math.abs(tendencia)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-black ${colorClase}`}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Mapa de Calor (Dots) */}
                    <div className={`flex flex-wrap gap-1 ${colorClase}`}>
                      {(() => {
                        const puntos = [];
                        const hoy = new Date();
                        for (let i = rangoDias - 1; i >= 0; i--) {
                          const d = new Date(hoy);
                          d.setDate(d.getDate() - i);
                          const fechaStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                          const completado = h.diasCompletados?.includes(fechaStr);
                          puntos.push(
                            <motion.div 
                              key={i} 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: (rangoDias - i) * 0.01 }}
                              className={`w-2.5 h-2.5 rounded-[3px] transition-all duration-300 ${
                                completado 
                                  ? 'bg-current opacity-100 shadow-[0_0_8px_rgba(current)]' 
                                  : 'bg-gray-200 dark:bg-gray-700 opacity-20'
                              }`}
                              title={fechaStr}
                            />
                          );
                        }
                        return puntos;
                      })()}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <Target size={40} className="mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">{idioma === 'es' ? 'Sin hábitos registrados' : 'No habits tracked'}</p>
              </div>
            )}
          </div>


        </div>

        {/* Correlación Radar (Impacto Vital) - MOVIDA AQUÍ ARRIBA */}
        <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-700 h-[450px] transition-colors duration-300">
          <h2 className="text-xl font-black text-[#2C4159] dark:text-white mb-2 flex items-center gap-2 transition-colors duration-300">
            <Zap size={20} className="text-yellow-500" />
            {idioma === 'es' ? 'Impacto Vital' : 'Life Impact'}
          </h2>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">{idioma === 'es' ? 'Efecto de tus hábitos en tu humor' : 'Effect of your habits on your mood'}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-6 leading-relaxed italic">
            {idioma === 'es' 
              ? "Compara tu ánimo los días que cumples un hábito frente a los que no. Cuanto más hacia fuera esté la línea azul, más impacto positivo tiene ese hábito en tu bienestar."
              : "Compares your mood on days you complete a habit vs those you don't. The further out the blue line is, the more positive impact that habit has on your well-being."}
          </p>
          <div className="h-[280px] flex items-center justify-center">
            <Radar 
              data={dataRadar} 
              options={{
                ...chartOptions,
                scales: {
                  r: {
                    angleLines: { color: 'rgba(0,0,0,0.05)' },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    pointLabels: { 
                      font: { size: 10, weight: 'bold' },
                      callback: (label) => truncarLabel(label, 10)
                    },
                    ticks: { display: false },
                    suggestedMin: 0,
                    suggestedMax: 5
                  }
                }
              }} 
            />
          </div>
          <div className="flex flex-col gap-1 mt-4">
            <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#4F99CC]">
              <div className="w-2 h-2 rounded-full bg-[#4F99CC]" /> {idioma === 'es' ? 'Con hábito' : 'With habit'}
            </span>
            <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#C6A55E]">
              <div className="w-2 h-2 rounded-full bg-[#C6A55E]" /> {idioma === 'es' ? 'Sin hábito' : 'Without habit'}
            </span>
          </div>
        </div>

        {/* --- FILA 2 --- */}

        {/* Evolución Ánimo (Bienestar Emocional) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-700 h-[450px] transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-[#2C4159] dark:text-white flex items-center gap-2 transition-colors duration-300">
              <TrendingUp size={20} className="text-[#4F99CC]" />
              {idioma === 'es' ? 'Bienestar Emocional' : 'Emotional Well-being'}
            </h2>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500">
                <div className="w-2 h-2 rounded-full bg-[#4F99CC]" /> {idioma === 'es' ? 'Ánimo' : 'Mood'}
              </span>
            </div>
          </div>
          <div className="h-[330px]">
            <Line data={dataAnimo} options={chartOptions} />
          </div>
        </div>

        {/* Distribución de Ánimo (Doughnut) */}
        <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-700 h-[450px] flex flex-col transition-colors duration-300">
          <h2 className="text-xl font-black text-[#2C4159] dark:text-white mb-2 flex items-center gap-2 transition-colors duration-300">
            <Smile size={20} className="text-[#C6A55E]" />
            {idioma === 'es' ? 'Clima Emocional' : 'Emotional Climate'}
          </h2>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-6">{idioma === 'es' ? 'Distribución global de tu humor' : 'Global mood distribution'}</p>
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="h-full w-full max-h-[260px]">
              <Doughnut 
                data={dataDistribucionAnimo} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: true,
                      position: 'bottom',
                      labels: {
                        boxWidth: 8,
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 10, weight: 'bold' },
                        color: '#94a3b8'
                      }
                    }
                  },
                  scales: {
                    x: { display: false },
                    y: { display: false }
                  },
                  cutout: '70%'
                }} 
              />
            </div>
          </div>
        </div>

        {/* --- FILA 3 --- */}

        {/* Análisis de Sueño vs Ánimo (MEJORADA) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-700 h-[450px] transition-colors duration-300">
          <h2 className="text-xl font-black text-[#2C4159] dark:text-white mb-2 flex items-center gap-2 transition-colors duration-300">
            <Moon size={20} className="text-indigo-500" />
            {idioma === 'es' ? 'Descanso vs Ánimo' : 'Rest vs Mood'}
          </h2>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-6">{idioma === 'es' ? 'Cómo impactan tus horas de sueño en tu bienestar' : 'How sleep hours impact your well-being'}</p>
          <div className="h-[300px]">
            <Scatter 
              data={{
                datasets: [{
                  label: idioma === 'es' ? 'Días' : 'Days',
                  data: stats?.correlacionSuenoAnimo,
                  backgroundColor: stats?.correlacionSuenoAnimo.map(d => obtenerColorSueno(d.x)),
                  pointRadius: (ctx) => {
                    const val = ctx.raw?.y || 0;
                    return 6 + (val * 1.5); // Tamaño basado en el ánimo
                  },
                  pointHoverRadius: 15,
                  borderWidth: 3,
                  borderColor: 'rgba(255,255,255,0.9)',
                  pointStyle: 'circle'
                }]
              }} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                      label: (ctx) => {
                        const s = ctx.raw.x;
                        const a = ctx.raw.y;
                        return idioma === 'es' 
                          ? [`Sueño: ${s}h`, `Ánimo: ${a}/5`]
                          : [`Sleep: ${s}h`, `Mood: ${a}/5`];
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    ...chartOptions.scales.x,
                    min: 0,
                    max: 12,
                    grid: { display: true, color: 'rgba(0,0,0,0.03)' },
                    title: { display: true, text: idioma === 'es' ? 'Horas de sueño' : 'Sleep hours', font: { size: 10, weight: 'bold' }, color: '#94a3b8' }
                  },
                  y: {
                    ...chartOptions.scales.y,
                    min: 0,
                    max: 5.5,
                    grid: { display: true, color: 'rgba(0,0,0,0.03)' },
                    title: { display: true, text: idioma === 'es' ? 'Nivel de ánimo' : 'Mood level', font: { size: 10, weight: 'bold' }, color: '#94a3b8' }
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Meditación Dashboard (Paz Mental) - MOVIDA AQUÍ ABAJO */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[450px] transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-black text-[#2C4159] dark:text-white flex items-center gap-2 transition-colors duration-300">
                <Flower2 size={20} className="text-teal-500" />
                {idioma === 'es' ? 'Paz Mental' : 'Mind Peace'}
              </h2>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{idioma === 'es' ? 'Tu compromiso zen' : 'Your zen commitment'}</p>
            </div>
            <div className="bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full">
              <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">{stats?.meditacion?.rachaActual || 0}d {idioma === 'es' ? 'Racha' : 'Streak'}</span>
            </div>
          </div>
          
          {/* Técnicas en una linea compacta */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {stats?.meditacion?.tecnicas && Object.keys(stats.meditacion.tecnicas).length > 0 ? (
                Object.entries(stats.meditacion.tecnicas).sort((a, b) => b[1] - a[1]).map(([tecnica, conteo]) => {
                  const info = {
                    'equilibrio': { es: 'Equilibrio', en: 'Balance', color: 'text-teal-600' },
                    'cuadrada': { es: 'Caja', en: 'Box', color: 'text-blue-600' },
                    'relajacion': { es: 'Relajación', en: 'Relaxation', color: 'text-purple-600' }
                  }[tecnica] || { es: tecnica, en: tecnica, color: 'text-gray-500' };

                  const total = Object.values(stats.meditacion.tecnicas).reduce((a, b) => a + b, 0);
                  const pct = Math.round((conteo / total) * 100);

                  return (
                    <span key={tecnica} className="text-[10px] font-black whitespace-nowrap">
                      <span className={info.color}>{idioma === 'es' ? info.es : info.en}</span>
                      <span className="ml-1 text-gray-300 dark:text-gray-600">{pct}%</span>
                    </span>
                  );
                })
              ) : null}
            </div>
          </div>

          {/* Gráfica principal */}
          <div className="flex-1 min-h-0 mb-6">
            <Bar 
              data={dataMeditacion} 
              options={{
                ...chartOptions,
                plugins: { 
                  ...chartOptions.plugins, 
                  tooltip: { 
                    ...chartOptions.plugins.tooltip, 
                    displayColors: true,
                    callbacks: {
                      label: (ctx) => {
                        const index = ctx.dataIndex;
                        const dia = stats.meditacion.evolucion[index];
                        if (!dia || !dia.sesiones) return `${dia.minutos} min`;
                        const total = dia.minutos;
                        const lineas = [`Total: ${total} min`];
                        dia.sesiones.forEach(s => {
                          const infoTec = {
                            'equilibrio': { es: 'Equilibrio', en: 'Balance' },
                            'cuadrada': { es: 'Caja', en: 'Box' },
                            'relajacion': { es: 'Relajación', en: 'Relaxation' }
                          }[s.tecnica] || { es: s.tecnica, en: s.tecnica };
                          lineas.push(`• ${s.minutos}m (${idioma === 'es' ? infoTec.es : infoTec.en})`);
                        });
                        return lineas;
                      }
                    }
                  } 
                }
              }} 
            />
          </div>

          <div className="pt-4 border-t border-gray-50 dark:border-gray-700">
            <div className="bg-teal-50/50 dark:bg-teal-900/20 rounded-2xl border border-teal-100 dark:border-teal-900/50 p-4 flex items-center justify-between transition-colors duration-300">
              {/* Hoy */}
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">{idioma === 'es' ? 'Hoy' : 'Today'}</span>
                <span className="text-xl font-black text-teal-900 dark:text-teal-100 leading-tight">
                  {(() => {
                    const ahora = new Date();
                    const hoyStr = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
                    return stats?.meditacion?.evolucion?.find(e => e.fecha === hoyStr)?.minutos || 0;
                  })()}
                  <span className="text-[10px] ml-1 opacity-50 uppercase">min</span>
                </span>
              </div>

              <div className="h-8 w-px bg-teal-200/50 dark:bg-teal-800/50" />

              {/* Periodo */}
              <div className="flex flex-col text-center">
                <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">{idioma === 'es' ? 'Periodo' : 'Period'}</span>
                <span className="text-xl font-black text-teal-900 dark:text-teal-100 leading-tight">
                  {stats?.meditacion?.totalMinutosPeriodo || 0}
                  <span className="text-[10px] ml-1 opacity-50 uppercase">min</span>
                </span>
              </div>

              <div className="h-8 w-px bg-teal-200/50 dark:bg-teal-800/50" />

              {/* Histórico */}
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">{idioma === 'es' ? 'Histórico' : 'All-time'}</span>
                <span className="text-xl font-black text-teal-900 dark:text-teal-100 leading-tight">
                  {stats?.meditacion?.totalMinutosHistorico || 0}
                  <span className="text-[10px] ml-1 opacity-50 uppercase">min</span>
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* Footer / Padding */}
      <div className="h-20" />
    </div>
  );
};

export default PaginaEstadisticas;
