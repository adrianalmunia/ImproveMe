import React from 'react';
import { motion } from 'framer-motion';
import { Target, BarChart2, Flower2, CheckCircle2, Trophy, Smile, Calendar, BookOpen, Moon, Flame, TrendingUp, Zap } from 'lucide-react';
import { Doughnut, Scatter, Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, PointElement, LinearScale, CategoryScale, LineElement, BarElement, Filler } from 'chart.js';
import { useIdioma } from '../contextos/ContextoIdioma';

import genial from '../assets/estados_animo/genial.png';
import bien from '../assets/estados_animo/bien.png';
import decente from '../assets/estados_animo/decente.png';
import mal from '../assets/estados_animo/mal.png';
import fatal from '../assets/estados_animo/fatal.png';

import sinRango from '../assets/rangos/sin_rango.png';
import bronce1 from '../assets/rangos/bronce1.png';
import plata1 from '../assets/rangos/plata1.png';
import oro from '../assets/rangos/oro.png';
import esmeralda from '../assets/rangos/esmeralda.png';
import diamante from '../assets/rangos/diamante.png';
import zafiro from '../assets/rangos/zafiro.png';
import amatista1 from '../assets/rangos/amatista1.png';
import rubi1 from '../assets/rangos/rubi1.png';

ChartJS.register(ArcElement, Tooltip, Legend, PointElement, LinearScale, CategoryScale, LineElement, BarElement, Filler);

const tt = { backgroundColor: '#2C4159', cornerRadius: 10, displayColors: false, titleFont: { size: 11, weight: 'bold' }, bodyFont: { size: 11 }, padding: 10 };

/* ── 1. DOUGHNUT: Clima Emocional ── */
export const MoodDoughnutChart = () => {
  const { idioma } = useIdioma();
  const moods = [
    { img: genial, label: idioma === 'es' ? 'Genial' : 'Great', color: '#4D908E', val: 35 },
    { img: bien, label: idioma === 'es' ? 'Bien' : 'Good', color: '#90BE6D', val: 25 },
    { img: decente, label: idioma === 'es' ? 'Decente' : 'Decent', color: '#FACC15', val: 15 },
    { img: mal, label: idioma === 'es' ? 'Mal' : 'Bad', color: '#F97316', val: 12 },
    { img: fatal, label: idioma === 'es' ? 'Fatal' : 'Fatal', color: '#EF4444', val: 13 },
  ];
  const data = {
    labels: moods.map(m => m.label),
    datasets: [{ data: moods.map(m => m.val), backgroundColor: moods.map(m => m.color), borderWidth: 0, hoverOffset: 10, borderRadius: 6, spacing: 3 }]
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[40px] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-6 shrink-0">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          {idioma === 'es' ? 'Clima Emocional' : 'Emotional Climate'}
        </p>
        <Smile size={18} className="text-[#C6A55E]" />
      </div>
      <div className="h-48 w-full max-w-[240px]">
        <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false, cutout: '72%', layout: { padding: 10 }, plugins: { legend: { display: false }, tooltip: tt }, scales: { x: { display: false }, y: { display: false } } }} />
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-8">
        {moods.map((m, i) => (
          <div key={i} className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity cursor-default">
            <img src={m.img} alt={m.label} className="w-5 h-5 object-contain" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── 2. MEDITATION CARD: Paz Mental ── */
export const MeditationCard = () => {
  const { idioma } = useIdioma();
  const labels = idioma === 'es' 
    ? ['L', 'M', 'X', 'J', 'V', 'S', 'D', 'L', 'M', 'X', 'J', 'V', 'S', 'D']
    : ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const values = [0, 12, 22, 8, 30, 35, 20, 0, 5, 28, 15, 32, 40, 25];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[40px] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col min-h-[420px]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-2">
          <Flower2 size={20} className="text-teal-500" />
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            {idioma === 'es' ? 'Paz Mental' : 'Mental Peace'}
          </p>
        </div>
        <div className="bg-teal-50 dark:bg-teal-900/30 px-4 py-1.5 rounded-full">
          <span className="text-[11px] font-black text-teal-600 uppercase tracking-widest">
            {idioma === 'es' ? '14d Racha' : '14d Streak'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8 shrink-0">
        {[
          { label: idioma === 'es' ? 'Sesiones' : 'Sessions', val: '47' },
          { label: idioma === 'es' ? 'Total h' : 'Total hrs', val: '12.4' },
          { label: idioma === 'es' ? 'Racha' : 'Streak', val: '14d' }
        ].map((s, i) => (
          <div key={i} className="text-center p-3 bg-teal-50/50 dark:bg-teal-900/10 rounded-2xl">
            <p className="text-base font-black text-teal-600 dark:text-teal-400">{s.val}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 w-full" style={{ minHeight: 180 }}>
        <Bar
          data={{ labels, datasets: [{ label: 'min', data: values, backgroundColor: values.map(v => v > 0 ? '#10B981' : '#f1f5f9'), borderRadius: 6, barThickness: 16 }] }}
          options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...tt, callbacks: { label: c => `${c.raw} ${idioma === 'es' ? 'min' : 'mins'}` } } }, scales: { y: { display: false, beginAtZero: true }, x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' } } } }}
        />
      </div>
    </div>
  );
};

/* ── 3. SCATTER: Descanso vs Ánimo ── */
const getC = (h) => { if (h < 4) return '#EF4444'; const r = Math.min(Math.max((h - 4) / 6, 0), 1); return `rgb(${Math.round(79 + 89 * r)},${Math.round(153 - 68 * r)},${Math.round(204 + 43 * r)})`; };
export const SleepScatterChart = () => {
  const { idioma } = useIdioma();
  const pts = [
    { x: 3.5, y: 1 }, { x: 4.5, y: 1 }, { x: 5, y: 2 }, { x: 5.5, y: 2 }, { x: 6, y: 3 }, 
    { x: 6.5, y: 2 }, { x: 7, y: 4 }, { x: 7.5, y: 3 }, { x: 7.5, y: 5 }, { x: 8, y: 4 }, 
    { x: 8.5, y: 5 }, { x: 9, y: 4 }, { x: 9.5, y: 5 }, { x: 10, y: 5 }, { x: 5.5, y: 1 },
    { x: 6.5, y: 4 }, { x: 8, y: 5 }, { x: 4, y: 1 }, { x: 9, y: 5 }, { x: 7, y: 2 }
  ];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[40px] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 min-h-[380px]">
      <div className="flex items-center justify-between mb-6">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          {idioma === 'es' ? 'Descanso vs Ánimo' : 'Sleep vs Mood'}
        </p>
        <Moon size={18} className="text-indigo-400" />
      </div>
      <div className="h-64">
        <Scatter data={{ datasets: [{ label: idioma === 'es' ? 'Días' : 'Days', data: pts, backgroundColor: pts.map(d => getC(d.x)), pointRadius: pts.map(d => 6 + d.y * 1.5), pointHoverRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' }] }}
          options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...tt, callbacks: { label: c => [`${idioma === 'es' ? 'Sueño' : 'Sleep'}: ${c.raw.x}h`, `${idioma === 'es' ? 'Ánimo' : 'Mood'}: ${c.raw.y}/5`] } } }, scales: { x: { min: 3, max: 11, grid: { display: true, color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' }, title: { display: true, text: idioma === 'es' ? 'Horas de sueño' : 'Sleep hours', font: { size: 10 }, color: '#94a3b8' } }, y: { min: 0, max: 6, grid: { display: true, color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' }, title: { display: true, text: idioma === 'es' ? 'Ánimo' : 'Mood', font: { size: 10 }, color: '#94a3b8' } } } }} />
      </div>
    </div>
  );
};

/* ── 4. HABIT CARD ── */
export const HabitCard = () => {
  const { idioma } = useIdioma();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[40px] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">
        {idioma === 'es' ? 'Hábitos de Hoy' : "Today's Habits"}
      </p>
      <div className="space-y-3">
        {[
          { name: idioma === 'es' ? 'Meditar 10 min' : 'Meditate 10 min', icon: <Flower2 size={18} />, done: true, streak: 14, color: 'text-teal-500 bg-teal-50 dark:bg-teal-900/30' },
          { name: idioma === 'es' ? 'Ejercicio' : 'Exercise', icon: <Flame size={18} />, done: true, streak: 7, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/30' },
          { name: idioma === 'es' ? 'Leer 30 min' : 'Read 30 min', icon: <BookOpen size={18} />, done: false, streak: 3, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' },
        ].map((h, i) => (
          <div key={i} className={`flex items-center gap-4 p-4 rounded-[28px] ${h.done ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${h.color}`}>{h.icon}</div>
            <div className="flex-1">
              <p className={`text-base font-black ${h.done ? 'line-through text-gray-400' : 'text-[#2C4159] dark:text-white'}`}>{h.name}</p>
              <div className="flex items-center gap-1"><Flame size={12} className="text-orange-500" /><p className="text-[11px] text-gray-400 font-bold">{h.streak} {idioma === 'es' ? 'días' : 'days'}</p></div>
            </div>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${h.done ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'border-2 border-gray-200 dark:border-gray-600'}`}>
              {h.done && <CheckCircle2 size={18} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── 5. LINE: Bienestar Emocional con colores (como la app) ── */
const coloresMood = { 1: '#EF4444', 2: '#F97316', 3: '#FACC15', 4: '#90BE6D', 5: '#4D908E' };
export const MoodLineChart = () => {
  const { idioma } = useIdioma();
  const labels = idioma === 'es'
    ? ['24 Abr', '26 Abr', '28 Abr', '30 Abr', '2 May', '4 May', '6 May', '8 May', '10 May', '12 May']
    : ['Apr 24', 'Apr 26', 'Apr 28', 'Apr 30', 'May 2', 'May 4', 'May 6', 'May 8', 'May 10', 'May 12'];
  const values = [2, 4, 3, 5, 1, 4, 5, 3, 4, 5];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[40px] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          {idioma === 'es' ? 'Bienestar Emocional' : 'Emotional Well-being'}
        </p>
        <TrendingUp size={20} className="text-[#4F99CC]" />
      </div>
      <div className="h-48 w-full">
        <Line
          data={{
            labels,
            datasets: [{
              label: idioma === 'es' ? 'Ánimo' : 'Mood', data: values,
              borderColor: '#4F99CC',
              segment: { borderColor: ctx => coloresMood[Math.round(ctx.p1.parsed.y)] || '#4F99CC' },
              backgroundColor: ctx => {
                const chart = ctx.chart; const { chartArea, ctx: c } = chart;
                if (!chartArea) return 'rgba(79,153,204,0.1)';
                const g = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                g.addColorStop(0, 'rgba(239,68,68,0.2)'); g.addColorStop(0.5, 'rgba(250,204,21,0.2)'); g.addColorStop(1, 'rgba(77,144,142,0.3)');
                return g;
              },
              fill: true, tension: 0.45, pointRadius: 7,
              pointBackgroundColor: values.map(v => coloresMood[v] || '#4F99CC'),
              pointBorderColor: '#fff', pointBorderWidth: 2.5, pointHoverRadius: 10, borderWidth: 4
            }]
          }}
          options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...tt, callbacks: { label: c => `${idioma === 'es' ? 'Ánimo' : 'Mood'}: ${c.raw}/5` } } }, scales: { y: { min: 0, max: 6, grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' } } } }}
        />
      </div>
    </div>
  );
};

/* ── 6. HEATMAP: Consistencia de Hábitos (3 filas de 10) ── */
export const HabitHeatmap = () => {
  const { idioma } = useIdioma();
  const habits = [
    { nombre: idioma === 'es' ? 'Meditar' : 'Meditate', textColor: 'text-blue-500', bgColor: 'bg-blue-500', dias: [1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,0,1] },
    { nombre: idioma === 'es' ? 'Ejercicio' : 'Exercise', textColor: 'text-amber-500', bgColor: 'bg-amber-500', dias: [1,0,1,1,0,1,1,1,0,1,1,1,0,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1] },
    { nombre: idioma === 'es' ? 'Leer' : 'Read', textColor: 'text-emerald-500', bgColor: 'bg-emerald-500', dias: [0,1,1,1,0,0,1,1,1,0,1,1,1,1,0,1,0,1,1,0,1,1,0,1,1,0,0,1,1,1] },
  ];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[40px] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          {idioma === 'es' ? 'Consistencia' : 'Consistency'}
        </p>
        <div className="px-4 py-1 bg-amber-50 dark:bg-amber-900/30 rounded-full">
          <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest">
            {idioma === 'es' ? '30 días' : '30 days'}
          </span>
        </div>
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
        {habits.map((h, idx) => {
          const completedCount = h.dias.filter(Boolean).length;
          const pct = Math.round((completedCount / 30) * 100);
          return (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-full flex justify-between items-end mb-4 px-1">
                <span className="text-base font-black text-[#2C4159] dark:text-gray-200">{h.nombre}</span>
                <span className={`text-sm font-black ${h.textColor}`}>{pct}%</span>
              </div>
              {/* Contenedor de cuadraditos en 3 filas de 10 */}
              <div className="grid grid-cols-10 gap-1.5 p-1 bg-slate-50 dark:bg-gray-900/50 rounded-xl">
                {h.dias.map((done, i) => (
                  <motion.div key={i}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.01 }}
                    className={`w-3.5 h-3.5 md:w-3 md:h-3 rounded-[4px] transition-all duration-300 ${done ? `${h.bgColor} opacity-100 shadow-sm` : 'bg-slate-200 dark:bg-gray-800'}`}
                  />
                ))}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase mt-4 tracking-widest">
                {completedCount}/30 {idioma === 'es' ? 'DÍAS COMPLETADOS' : 'DAYS COMPLETED'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── 7. RANK PREVIEW ── */
export const RankPreview = () => {
  const { idioma } = useIdioma();
  const ranks = [
    { name: idioma === 'es' ? 'Sin Rango' : 'No Rank', img: sinRango, color: 'text-gray-400' },
    { name: idioma === 'es' ? 'Bronce I' : 'Bronze I', img: bronce1, color: 'text-amber-700' },
    { name: idioma === 'es' ? 'Plata I' : 'Silver I', img: plata1, color: 'text-slate-400' },
    { name: idioma === 'es' ? 'Oro I' : 'Gold I', img: oro, color: 'text-yellow-500' },
    { name: idioma === 'es' ? 'Esmeralda I' : 'Emerald I', img: esmeralda, color: 'text-emerald-500' },
    { name: idioma === 'es' ? 'Diamante I' : 'Diamond I', img: diamante, color: 'text-blue-400' },
    { name: idioma === 'es' ? 'Zafiro I' : 'Sapphire I', img: zafiro, color: 'text-blue-600' },
    { name: idioma === 'es' ? 'Amatista I' : 'Amethyst I', img: amatista1, color: 'text-purple-500' },
    { name: idioma === 'es' ? 'Rubí I' : 'Ruby I', img: rubi1, color: 'text-red-500' },
  ];
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
      {ranks.map((r, i) => (
        <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="flex flex-col items-center gap-2 group">
          <div className="w-16 h-16 md:w-20 md:h-20">
            <img src={r.img} alt={r.name} className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className={`font-black uppercase tracking-widest text-[9px] ${r.color}`}>{r.name}</span>
        </motion.div>
      ))}
    </div>
  );
};

/* ── 8. FEATURES ── */
export const features = [
  { icon: <Smile size={28} />, titleKey: 'landing_feat_diario_title', descKey: 'landing_feat_diario_desc', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'hover:border-blue-200 dark:hover:border-blue-800' },
  { icon: <Target size={28} />, titleKey: 'landing_feat_habitos_title', descKey: 'landing_feat_habitos_desc', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'hover:border-amber-200 dark:hover:border-amber-800' },
  { icon: <BarChart2 size={28} />, titleKey: 'landing_feat_stats_title', descKey: 'landing_feat_stats_desc', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'hover:border-indigo-200 dark:hover:border-indigo-800' },
  { icon: <Flower2 size={28} />, titleKey: 'landing_feat_med_title', descKey: 'landing_feat_med_desc', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'hover:border-teal-200 dark:hover:border-teal-800' },
  { icon: <Calendar size={28} />, titleKey: 'landing_feat_cal_title', descKey: 'landing_feat_cal_desc', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'hover:border-rose-200 dark:hover:border-rose-800' },
  { icon: <Trophy size={28} />, titleKey: 'landing_feat_ranks_title', descKey: 'landing_feat_ranks_desc', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'hover:border-purple-200 dark:hover:border-purple-800' },
];
