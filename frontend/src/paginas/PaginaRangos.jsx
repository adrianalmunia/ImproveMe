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
  Circle: IconosRangos.Piedra,
  Triangle: IconosRangos.Bronce,
  Square: IconosRangos.Plata,
  Pentagon: IconosRangos.Oro,
  Hexagon: IconosRangos.Esmeralda,
  Shield: IconosRangos.Zafiro,
  Gem: IconosRangos.Diamante,
  Star: IconosRangos.Amatista,
  Sparkles: IconosRangos.Rubi
};

export const RANK_CATEGORIES = [
  { id: 'piedra', name: 'Piedra', iconName: 'Circle', color: 'text-stone-500', bg: 'bg-stone-500', glow: 'shadow-stone-500/50', gradient: 'from-stone-400 to-stone-600', desc: 'El comienzo de tu viaje. Forja tu voluntad.' },
  { id: 'bronce', name: 'Bronce', iconName: 'Triangle', color: 'text-amber-700', bg: 'bg-amber-700', glow: 'shadow-amber-700/50', gradient: 'from-amber-600 to-amber-800', desc: 'La consistencia empieza a dar sus frutos.' },
  { id: 'plata', name: 'Plata', iconName: 'Square', color: 'text-slate-400', bg: 'bg-slate-400', glow: 'shadow-slate-400/50', gradient: 'from-slate-300 to-slate-500', desc: 'Un reflejo de tu disciplina diaria.' },
  { id: 'oro', name: 'Oro', iconName: 'Pentagon', color: 'text-yellow-500', bg: 'bg-yellow-500', glow: 'shadow-yellow-500/50', gradient: 'from-yellow-400 to-yellow-600', desc: 'Brillas con luz propia entre los mejores.' },
  { id: 'esmeralda', name: 'Esmeralda', iconName: 'Hexagon', color: 'text-emerald-500', bg: 'bg-emerald-500', glow: 'shadow-emerald-500/50', gradient: 'from-emerald-400 to-emerald-600', desc: 'Tu crecimiento es imparable y natural.' },
  { id: 'diamante', name: 'Diamante', iconName: 'Gem', color: 'text-blue-400', bg: 'bg-blue-400', glow: 'shadow-blue-400/50', gradient: 'from-blue-300 to-blue-500', desc: 'Dureza y claridad inquebrantables.' },
  { id: 'zafiro', name: 'Zafiro', iconName: 'Shield', color: 'text-cyan-500', bg: 'bg-cyan-500', glow: 'shadow-cyan-500/50', gradient: 'from-cyan-400 to-cyan-600', desc: 'Sabiduría y profundidad en cada acción.' },
  { id: 'amatista', name: 'Amatista', iconName: 'Star', color: 'text-purple-500', bg: 'bg-purple-500', glow: 'shadow-purple-500/50', gradient: 'from-purple-400 to-purple-600', desc: 'Dominio absoluto de tu mente y cuerpo.' },
  { id: 'rubi', name: 'Rubí', iconName: 'Sparkles', color: 'text-red-500', bg: 'bg-red-500', glow: 'shadow-red-500/50', gradient: 'from-red-400 to-red-600', desc: 'La leyenda máxima. Has alcanzado la cima.' }
];

const XP_PER_TIER = 500;
const TIERS = ['I', 'II', 'III'];

function calcularRangoInfo(xp) {
  const totalTiers = RANK_CATEGORIES.length * TIERS.length;
  let currentTierTotalIndex = Math.floor(xp / XP_PER_TIER);
  
  if (currentTierTotalIndex >= totalTiers) {
    currentTierTotalIndex = totalTiers - 1;
  }

  const categoryIndex = Math.floor(currentTierTotalIndex / TIERS.length);
  const tierNumberIndex = currentTierTotalIndex % TIERS.length;
  
  const currentCategory = RANK_CATEGORIES[categoryIndex];
  
  const xpForCurrentTierStart = currentTierTotalIndex * XP_PER_TIER;
  const xpForNextTierStart = (currentTierTotalIndex + 1) * XP_PER_TIER;
  
  const progressInTier = xp - xpForCurrentTierStart;
  const progressPercentage = currentTierTotalIndex === totalTiers - 1 ? 100 : (progressInTier / XP_PER_TIER) * 100;
  const xpRemaining = currentTierTotalIndex === totalTiers - 1 ? 0 : xpForNextTierStart - xp;

  // Rango Anterior
  let prevRank = null;
  if (currentTierTotalIndex > 0) {
    const prevCatIdx = Math.floor((currentTierTotalIndex - 1) / TIERS.length);
    const prevTierNum = (currentTierTotalIndex - 1) % TIERS.length;
    prevRank = {
      ...RANK_CATEGORIES[prevCatIdx],
      tier: TIERS[prevTierNum],
      fullName: `${RANK_CATEGORIES[prevCatIdx].name} ${TIERS[prevTierNum]}`
    };
  }

  // Siguiente Rango
  let nextRank = null;
  if (currentTierTotalIndex < totalTiers - 1) {
    const nextCatIdx = Math.floor((currentTierTotalIndex + 1) / TIERS.length);
    const nextTierNum = (currentTierTotalIndex + 1) % TIERS.length;
    nextRank = {
      ...RANK_CATEGORIES[nextCatIdx],
      tier: TIERS[nextTierNum],
      fullName: `${RANK_CATEGORIES[nextCatIdx].name} ${TIERS[nextTierNum]}`
    };
  }

  return {
    category: currentCategory,
    categoryIndex,
    tier: TIERS[tierNumberIndex],
    fullName: `${currentCategory.name} ${TIERS[tierNumberIndex]}`,
    progressPercentage,
    xpInCurrentTier: progressInTier,
    xpRemaining,
    prevRank,
    nextRank,
    isMaxRank: currentTierTotalIndex === totalTiers - 1
  };
}

const RankIcon = ({ rankData, tier = 'III', size = 'md', className = '' }) => {
  if (!rankData) return null;
  
  const IconComponent = IconMap[rankData.iconName || rankData.icon] || Trophy;
  
  const pixelSizes = {
    sm: 60,
    md: 100,
    lg: 200,
    track: 36
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <IconComponent 
        size={pixelSizes[size]} 
        tier={tier}
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
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 relative z-10">
          {RANK_CATEGORIES.map((cat, idx) => {
            const isUnlocked = idx <= rankInfo.categoryIndex;
            const isCurrent = idx === rankInfo.categoryIndex;
            
            return (
              <React.Fragment key={cat.id}>
                <div className={`transition-all duration-700 ${isUnlocked ? 'opacity-100' : 'opacity-20'}`}>
                  <RankIcon rankData={cat} size="track" className={isCurrent ? 'ring-2 ring-[#4F99CC] ring-offset-4 ring-offset-white rounded-full' : ''} />
                </div>
                {idx < RANK_CATEGORIES.length - 1 && (
                  <div className="w-4 h-[1px] bg-gray-100" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </motion.div>

      {/* Visualización Principal del Rango */}
      <div className="relative bg-white rounded-[48px] p-8 md:p-16 shadow-xl border border-gray-100 overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] opacity-[0.05] ${rankInfo.category.bg} pointer-events-none`} />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24">
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
              <span>{XP_PER_TIER} XP</span>
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
                  {RANK_CATEGORIES.map((cat, idx) => {
                    const xpRequerida = idx * (XP_PER_TIER * TIERS.length);
                    const isUnlocked = xp >= xpRequerida;
                    
                    return (
                      <div 
                        key={cat.id} 
                        className={`p-6 rounded-[32px] border-2 transition-all flex items-center gap-6 ${isUnlocked ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-dashed border-gray-200 opacity-60'}`}
                      >
                        <div className={`shrink-0 ${isUnlocked ? '' : 'grayscale'}`}>
                          <RankIcon rankData={cat} size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className={`text-xl font-black uppercase tracking-tight ${cat.color}`}>{cat.name}</h4>
                            <span className="text-[10px] font-black text-gray-400">MIN. {xpRequerida} XP</span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed italic">"{cat.desc}"</p>
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

