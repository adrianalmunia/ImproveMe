import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { 
  Trophy,
  ChevronRight
} from 'lucide-react';
import IconosRangos from '../componentes/IconosRangos';

// Mapeo de iconos para poder usarlos dinámicamente
const IconMap = {
  SinRango: IconosRangos.SinRango,
  Bronce: IconosRangos.Bronce,
  Plata: IconosRangos.Plata,
  Oro: IconosRangos.Oro,
  Esmeralda: IconosRangos.Esmeralda,
  Diamante: IconosRangos.Diamante,
  Zafiro: IconosRangos.Zafiro,
  Amatista: IconosRangos.Amatista,
  Rubi: IconosRangos.Rubi
};

export const RANK_CATEGORIES = [
  { id: 'sin-rango', name: 'Sin Rango', iconName: 'SinRango', color: 'text-gray-400', bg: 'bg-gray-400', glow: 'shadow-gray-400/50', gradient: 'from-gray-300 to-gray-500', desc: 'Tu camino aún no ha comenzado. Da el primer paso.' },
  { id: 'bronce', name: 'Bronce', iconName: 'Bronce', color: 'text-amber-700', bg: 'bg-amber-700', glow: 'shadow-amber-700/50', gradient: 'from-amber-600 to-amber-800', desc: 'La consistencia empieza a dar sus frutos.' },
  { id: 'plata', name: 'Plata', iconName: 'Plata', color: 'text-slate-400', bg: 'bg-slate-400', glow: 'shadow-slate-400/50', gradient: 'from-slate-300 to-slate-500', desc: 'Un reflejo de tu disciplina diaria.' },
  { id: 'oro', name: 'Oro', iconName: 'Oro', color: 'text-yellow-500', bg: 'bg-yellow-500', glow: 'shadow-yellow-500/50', gradient: 'from-yellow-400 to-yellow-600', desc: 'Brillas con luz propia entre los mejores.' },
  { id: 'esmeralda', name: 'Esmeralda', iconName: 'Esmeralda', color: 'text-emerald-500', bg: 'bg-emerald-500', glow: 'shadow-emerald-500/50', gradient: 'from-emerald-400 to-emerald-600', desc: 'Tu crecimiento es imparable y natural.' },
  { id: 'diamante', name: 'Diamante', iconName: 'Diamante', color: 'text-blue-400', bg: 'bg-blue-400', glow: 'shadow-blue-400/50', gradient: 'from-blue-300 to-blue-500', desc: 'Dureza y claridad inquebrantables.' },
  { id: 'zafiro', name: 'Zafiro', iconName: 'Zafiro', color: 'text-blue-600', bg: 'bg-blue-600', glow: 'shadow-blue-600/50', gradient: 'from-blue-500 to-blue-700', desc: 'Sabiduría y profundidad en cada acción.' },
  { id: 'amatista', name: 'Amatista', iconName: 'Amatista', color: 'text-purple-500', bg: 'bg-purple-500', glow: 'shadow-purple-500/50', gradient: 'from-purple-400 to-purple-600', desc: 'Dominio absoluto de tu mente y cuerpo.' },
  { id: 'rubi', name: 'Rubí', iconName: 'Rubi', color: 'text-red-500', bg: 'bg-red-500', glow: 'shadow-red-500/50', gradient: 'from-red-400 to-red-600', desc: 'La leyenda máxima. Has alcanzado la cima.' }
];

export const RANK_TIERS = [
  { xp: 0, name: 'Sin Rango', tier: '', categoryId: 'sin-rango', desc: 'Tu camino aún no ha comenzado. Da el primer paso.' },
  { xp: 1, name: 'Bronce III', tier: 'III', categoryId: 'bronce', desc: 'Has despertado. La chispa del cambio se ha encendido.' },
  { xp: 400, name: 'Bronce II', tier: 'II', categoryId: 'bronce', desc: 'La inercia se rompe. Tu voluntad empieza a endurecerse.' },
  { xp: 1000, name: 'Bronce I', tier: 'I', categoryId: 'bronce', desc: 'Dominas lo básico. Estás listo para desafíos mayores.' },
  { xp: 2000, name: 'Plata III', tier: 'III', categoryId: 'plata', desc: 'Tu brillo es tenue pero constante. Sigue puliendo.' },
  { xp: 3500, name: 'Plata II', tier: 'II', categoryId: 'plata', desc: 'La disciplina ya no es un esfuerzo, es parte de ti.' },
  { xp: 5500, name: 'Plata I', tier: 'I', categoryId: 'plata', desc: 'Eres un ejemplo de constancia. La excelencia se acerca.' },
  { xp: 8000, name: 'Oro III', tier: 'III', categoryId: 'oro', desc: 'Brillas con luz propia. El éxito te reconoce.' },
  { xp: 11000, name: 'Oro II', tier: 'II', categoryId: 'oro', desc: 'Tu valor es innegable. Has forjado un carácter dorado.' },
  { xp: 15000, name: 'Oro I', tier: 'I', categoryId: 'oro', desc: 'Casi una leyenda. Tu presencia inspira a otros.' },
  { xp: 20000, name: 'Esmeralda III', tier: 'III', categoryId: 'esmeralda', desc: 'Crecimiento puro. Tu potencial florece sin límites.' },
  { xp: 26000, name: 'Esmeralda II', tier: 'II', categoryId: 'esmeralda', desc: 'Vitalidad extrema. Eres una fuerza de la naturaleza.' },
  { xp: 33000, name: 'Esmeralda I', tier: 'I', categoryId: 'esmeralda', desc: 'Maestro de la adaptación. Nada detiene tu avance.' },
  { xp: 41000, name: 'Diamante III', tier: 'III', categoryId: 'diamante', desc: 'Presión y tiempo. Te has vuelto inquebrantable.' },
  { xp: 50000, name: 'Diamante II', tier: 'II', categoryId: 'diamante', desc: 'Claridad absoluta. Ves el camino donde otros ven dudas.' },
  { xp: 60000, name: 'Diamante I', tier: 'I', categoryId: 'diamante', desc: 'Dureza máxima. Eres el estándar de la perfección.' },
  { xp: 72000, name: 'Zafiro III', tier: 'III', categoryId: 'zafiro', desc: 'Sabiduría profunda. Actúas con calma y precisión.' },
  { xp: 85000, name: 'Zafiro II', tier: 'II', categoryId: 'zafiro', desc: 'Tus acciones fluyen como el agua, imparables.' },
  { xp: 100000, name: 'Zafiro I', tier: 'I', categoryId: 'zafiro', desc: 'Mente cristalina. Has alcanzado la paz en el esfuerzo.' },
  { xp: 120000, name: 'Amatista III', tier: 'III', categoryId: 'amatista', desc: 'Energía pura. Tu espíritu vibra con intensidad.' },
  { xp: 145000, name: 'Amatista II', tier: 'II', categoryId: 'amatista', desc: 'Intuición superior. Sabes qué hacer antes de pensarlo.' },
  { xp: 175000, name: 'Amatista I', tier: 'I', categoryId: 'amatista', desc: 'Trascendencia. Has superado tus propios límites.' },
  { xp: 210000, name: 'Rubí III', tier: 'III', categoryId: 'rubi', desc: 'Pasión ardiente. Tu fuego interno lo consume todo.' },
  { xp: 260000, name: 'Rubí II', tier: 'II', categoryId: 'rubi', desc: 'Poder absoluto. Cada paso que das deja huella.' },
  { xp: 350000, name: 'Rubí I', tier: 'I', categoryId: 'rubi', desc: 'La cima del mundo. Eres la definición de ImproveMe.' }
];

function calcularRangoInfo(xp) {
  let currentTierIndex = 0;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (xp >= RANK_TIERS[i].xp) {
      currentTierIndex = i;
    } else {
      break;
    }
  }
  
  const currentTier = RANK_TIERS[currentTierIndex];
  const nextTier = RANK_TIERS[currentTierIndex + 1] || null;
  const prevTier = currentTierIndex > 0 ? RANK_TIERS[currentTierIndex - 1] : null;
  
  const category = RANK_CATEGORIES.find(c => c.id === currentTier.categoryId);
  const categoryIndex = RANK_CATEGORIES.findIndex(c => c.id === currentTier.categoryId);
  
  const xpInCurrentTier = xp - currentTier.xp;
  const xpTotalForThisTier = nextTier ? nextTier.xp - currentTier.xp : 10000;
  const progressPercentage = nextTier ? (xpInCurrentTier / xpTotalForThisTier) * 100 : 100;
  const xpRemaining = nextTier ? nextTier.xp - xp : 0;

  return {
    fullName: currentTier.name,
    category: category,
    categoryIndex,
    tier: currentTier.tier,
    xpInCurrentTier,
    xpTotalForThisTier,
    progressPercentage,
    xpRemaining,
    prevRank: prevTier ? {
      ...RANK_CATEGORIES.find(c => c.id === prevTier.categoryId),
      fullName: prevTier.name,
      tier: prevTier.tier
    } : null,
    nextRank: nextTier ? { 
      ...RANK_CATEGORIES.find(c => c.id === nextTier.categoryId),
      fullName: nextTier.name, 
      tier: nextTier.tier
    } : null,
    isMaxRank: !nextTier
  };
}

const RankIcon = ({ rankData, tier = 'III', size = 'md', className = '', showGlow = true }) => {
  if (!rankData) return null;
  
  const IconComponent = IconMap[rankData.iconName || rankData.icon] || Trophy;
  
  const pixelSizes = {
    sm: 100,
    md: 150,
    lg: 320,
    track: 72
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <IconComponent 
        size={pixelSizes[size]} 
        tier={tier}
        showGlow={showGlow}
      />
    </div>
  );
};

const PaginaRangos = () => {
  const { usuario, refrescarUsuario } = useAutenticacion();
  const [xp, setXp] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalLigas, setMostrarModalLigas] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await refrescarUsuario();
      } catch (e) {
        console.error(e);
      } finally {
        setCargando(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (usuario) {
      setXp(usuario.puntos_experiencia || 0);
    }
  }, [usuario]);

  const rankInfo = calcularRangoInfo(xp);

  if (cargando) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-neutral-50 overflow-y-auto custom-scrollbar p-6 lg:p-10 pb-24">
      <div className="max-w-5xl mx-auto space-y-12">
      {/* Encabezado */}
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] uppercase tracking-tighter">
          Clasificación Ranked
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto font-medium">
          Tu disciplina se convierte en poder. Asciende en las ligas completando tus metas diarias.
        </p>
      </header>

      {/* Track de Categorías (Interactuable) */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        onClick={() => setMostrarModalLigas(true)}
        className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#4F99CC]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Ligas Disponibles
          </h3>
          <span className="text-[10px] font-black text-[#4F99CC] uppercase tracking-widest flex items-center gap-1">
            Explorar todas <ChevronRight size={12} />
          </span>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 max-w-2xl mx-auto relative z-10">
          {RANK_CATEGORIES.map((cat, idx) => {
            const isUnlocked = idx <= rankInfo.categoryIndex;
            const isCurrent = idx === rankInfo.categoryIndex;
            
            return (
              <div key={cat.id} className={`transition-all duration-700 ${isUnlocked ? 'opacity-100' : 'opacity-20'} transform ${isCurrent ? 'scale-110' : 'scale-100'}`}>
                <RankIcon rankData={cat} size="track" className={isCurrent ? 'ring-4 ring-[#4F99CC] ring-offset-4 ring-offset-white rounded-full' : ''} />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Visualización Principal del Rango */}
      <div className="relative bg-white rounded-[48px] p-8 md:p-16 shadow-xl border border-gray-100 overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[160px] opacity-[0.08] ${rankInfo.category.bg} pointer-events-none`} />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-40">
          {/* Rango Anterior */}
          <div className="hidden md:flex flex-col items-center gap-4 opacity-20">
            {rankInfo.prevRank ? (
              <>
                <RankIcon rankData={rankInfo.prevRank} tier={rankInfo.prevRank.tier} size="sm" />
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Anterior</p>
                  <p className={`text-xs font-bold ${rankInfo.prevRank.color}`}>{rankInfo.prevRank.fullName}</p>
                </div>
              </>
            ) : (
              <div className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl">
                <p className="text-[8px] font-black uppercase text-gray-200">Inicio</p>
              </div>
            )}
          </div>

          {/* Rango Actual (Centro) */}
          <motion.div 
            className="flex flex-col items-center gap-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="relative">
              <div className={`absolute inset-0 blur-2xl opacity-20 ${rankInfo.category.bg} rounded-full`} />
              <RankIcon 
                rankData={rankInfo.category} 
                tier={rankInfo.tier}
                size="lg" 
              />
            </div>
            <div className="text-center space-y-3">
              <h2 className={`text-6xl md:text-7xl font-black tracking-tighter uppercase ${rankInfo.category.color}`}>
                {rankInfo.fullName}
              </h2>
              <div className="inline-flex items-center gap-3 bg-neutral-50 px-6 py-2 rounded-full border border-gray-100 shadow-sm">
                <span className={`w-2 h-2 rounded-full ${rankInfo.category.bg} animate-pulse`}></span>
                <p className="text-sm font-black text-gray-500 uppercase tracking-[0.1em]">
                  {xp} XP Acumulados
                </p>
              </div>
            </div>
          </motion.div>

          {/* Siguiente Rango */}
          <div className="hidden md:flex flex-col items-center gap-4 opacity-20">
            {rankInfo.nextRank ? (
              <>
                <RankIcon rankData={rankInfo.nextRank} tier={rankInfo.nextRank.tier} size="sm" />
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Siguiente</p>
                  <p className={`text-xs font-bold ${rankInfo.nextRank.color}`}>{rankInfo.nextRank.fullName}</p>
                </div>
              </>
            ) : (
              <div className="w-20 h-20 flex flex-col items-center justify-center bg-yellow-50 rounded-3xl border border-yellow-100">
                <Trophy size={28} className="text-yellow-500 opacity-50" />
              </div>
            )}
          </div>
        </div>

        {/* Barra de Progreso Mejorada */}
        <div className="relative z-10 max-w-2xl mx-auto mt-20 space-y-6">
          <div className="flex justify-between items-end px-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progreso del Nivel</p>
            <p className="text-sm font-black text-gray-700">
              <span className={rankInfo.category.color}>{rankInfo.xpInCurrentTier}</span>
              <span className="text-gray-300 mx-1">/</span>
              <span>{rankInfo.xpTotalForThisTier} XP</span>
            </p>
          </div>
          
          <div className="h-6 bg-gray-100 rounded-2xl overflow-hidden shadow-inner p-1.5 border border-gray-200/50">
            <motion.div 
              className={`h-full rounded-xl bg-gradient-to-r ${rankInfo.category.gradient} shadow-lg relative`}
              initial={{ width: 0 }}
              animate={{ width: `${rankInfo.progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
            >
              <div className="absolute inset-0 bg-white/20 opacity-30 animate-pulse" />
            </motion.div>
          </div>
          
          <div className="text-center">
            {rankInfo.isMaxRank ? (
              <p className="text-xl font-black text-[#C6A55E] uppercase tracking-tight flex items-center justify-center gap-3">
                <Trophy size={24} />
                ¡Has alcanzado la gloria máxima!
              </p>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Ascenso en camino</p>
                <p className="text-lg font-bold text-gray-800">
                  Te faltan <span className={`${rankInfo.nextRank?.color || 'text-[#4F99CC]'} font-black`}>{rankInfo.xpRemaining}</span> puntos para <span className="uppercase">{rankInfo.nextRank?.fullName}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Exploración de Ligas */}
      <AnimatePresence>
        {mostrarModalLigas && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
            onClick={() => setMostrarModalLigas(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-gray-100 shrink-0">
                <h2 className="text-3xl font-black text-[#2C4159] uppercase tracking-tighter">Jerarquía de Ligas</h2>
                <p className="text-gray-500 text-sm">Descubre el camino hacia la maestría absoluta en ImproveMe.</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {RANK_TIERS.map((tierData, idx) => {
                    const cat = RANK_CATEGORIES.find(c => c.id === tierData.categoryId);
                    const isUnlocked = xp >= tierData.xp;
                    
                    return (
                      <div 
                        key={`${tierData.name}-${idx}`} 
                        className={`p-6 rounded-[32px] border-2 transition-all flex items-center gap-6 ${isUnlocked ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-dashed border-gray-200 opacity-60'}`}
                      >
                        <div className="shrink-0">
                          <RankIcon rankData={cat} tier={tierData.tier} size="sm" showGlow={false} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className={`text-xl font-black uppercase tracking-tight ${cat.color}`}>{tierData.name}</h4>
                            <span className="text-[10px] font-black text-gray-400">MIN. {tierData.xp} XP</span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed italic">"{tierData.desc}"</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-8 bg-gray-50 shrink-0">
                <button 
                  onClick={() => setMostrarModalLigas(false)}
                  className="w-full py-4 bg-[#2C4159] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-colors"
                >
                  Cerrar Explorador
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
};

export default PaginaRangos;

