import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { 
  Trophy,
  ChevronRight
} from 'lucide-react';
import RankIcons from '../componentes/RankIcons';

// Mapeo de iconos para poder usarlos dinámicamente
const IconMap = {
  Circle: RankIcons.Piedra,
  Triangle: RankIcons.Bronce,
  Square: RankIcons.Plata,
  Pentagon: RankIcons.Oro,
  Hexagon: RankIcons.Esmeralda,
  Shield: RankIcons.Zafiro,
  Gem: RankIcons.Diamante,
  Star: RankIcons.Amatista,
  Sparkles: RankIcons.Rubi
};

export const RANK_CATEGORIES = [
  { id: 'piedra', name: 'Piedra', iconName: 'Circle', color: 'text-stone-500', bg: 'bg-stone-500', glow: 'shadow-stone-500/50', gradient: 'from-stone-400 to-stone-600' },
  { id: 'bronce', name: 'Bronce', iconName: 'Triangle', color: 'text-amber-700', bg: 'bg-amber-700', glow: 'shadow-amber-700/50', gradient: 'from-amber-600 to-amber-800' },
  { id: 'plata', name: 'Plata', iconName: 'Square', color: 'text-slate-300', bg: 'bg-slate-300', glow: 'shadow-slate-300/50', gradient: 'from-slate-200 to-slate-400' },
  { id: 'oro', name: 'Oro', iconName: 'Pentagon', color: 'text-yellow-400', bg: 'bg-yellow-400', glow: 'shadow-yellow-400/50', gradient: 'from-yellow-300 to-yellow-500' },
  { id: 'esmeralda', name: 'Esmeralda', iconName: 'Hexagon', color: 'text-emerald-500', bg: 'bg-emerald-500', glow: 'shadow-emerald-500/50', gradient: 'from-emerald-400 to-emerald-600' },
  { id: 'zafiro', name: 'Zafiro', iconName: 'Shield', color: 'text-cyan-500', bg: 'bg-cyan-500', glow: 'shadow-cyan-500/50', gradient: 'from-cyan-400 to-cyan-600' },
  { id: 'diamante', name: 'Diamante', iconName: 'Gem', color: 'text-blue-500', bg: 'bg-blue-500', glow: 'shadow-blue-500/50', gradient: 'from-blue-400 to-blue-600' },
  { id: 'amatista', name: 'Amatista', iconName: 'Star', color: 'text-purple-500', bg: 'bg-purple-500', glow: 'shadow-purple-500/50', gradient: 'from-purple-400 to-purple-600' },
  { id: 'rubi', name: 'Rubí', iconName: 'Sparkles', color: 'text-red-500', bg: 'bg-red-500', glow: 'shadow-red-500/50', gradient: 'from-red-400 to-red-600' }
];

const XP_PER_TIER = 500;
const TIERS = ['I', 'II', 'III'];

function calcularRangoInfo(xp) {
  const totalTiers = RANK_CATEGORIES.length * TIERS.length;
  let currentTierIndex = Math.floor(xp / XP_PER_TIER);
  
  if (currentTierIndex >= totalTiers) {
    currentTierIndex = totalTiers - 1;
  }

  const categoryIndex = Math.floor(currentTierIndex / TIERS.length);
  const tierNumberIndex = currentTierIndex % TIERS.length;
  
  const currentCategory = RANK_CATEGORIES[categoryIndex];
  
  const xpForCurrentTier = currentTierIndex * XP_PER_TIER;
  const xpForNextTier = (currentTierIndex + 1) * XP_PER_TIER;
  
  const progressInTier = xp - xpForCurrentTier;
  const progressPercentage = currentTierIndex === totalTiers - 1 ? 100 : (progressInTier / XP_PER_TIER) * 100;
  const xpRemaining = currentTierIndex === totalTiers - 1 ? 0 : xpForNextTier - xp;

  // Rango Anterior
  let prevRank = null;
  if (currentTierIndex > 0) {
    const prevCatIdx = Math.floor((currentTierIndex - 1) / TIERS.length);
    const prevTierNum = (currentTierIndex - 1) % TIERS.length;
    prevRank = {
      ...RANK_CATEGORIES[prevCatIdx],
      tier: TIERS[prevTierNum],
      fullName: `${RANK_CATEGORIES[prevCatIdx].name} ${TIERS[prevTierNum]}`
    };
  }

  // Siguiente Rango
  let nextRank = null;
  if (currentTierIndex < totalTiers - 1) {
    const nextCatIdx = Math.floor((currentTierIndex + 1) / TIERS.length);
    const nextTierNum = (currentTierIndex + 1) % TIERS.length;
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
    xpRemaining,
    prevRank,
    nextRank,
    isMaxRank: currentTierIndex === totalTiers - 1
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
    <IconComponent 
      size={pixelSizes[size]} 
      className={className} 
      tier={tier}
    />
  );
};

const PaginaRanked = () => {
  const { usuario, refrescarUsuario } = useAutenticacion();
  const [xp, setXp] = useState(0);
  const [cargando, setCargando] = useState(true);

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

  if (!rankInfo || !rankInfo.category) {
    return (
      <div className="text-center p-10">
        <p>Error al calcular el rango. Inténtalo de nuevo más tarde.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Encabezado */}
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent uppercase tracking-tighter">
          Clasificación Ranked
        </h1>
        <p className="text-base-content/70 max-w-2xl mx-auto font-medium">
          Completa tus hábitos y tareas diarias para ganar experiencia y ascender en las ligas.
        </p>
      </header>

      {/* Track de Categorías (Header de los rangos) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
          Ligas Disponibles
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
          {RANK_CATEGORIES.map((cat, idx) => {
            const isUnlocked = idx <= rankInfo.categoryIndex;
            const isCurrent = idx === rankInfo.categoryIndex;
            
            return (
              <React.Fragment key={cat.id}>
                <div className={`transition-all duration-700 ${isUnlocked ? 'opacity-100 grayscale-0' : 'opacity-20 grayscale'}`}>
                  <RankIcon rankData={cat} size="track" className={isCurrent ? 'ring-2 ring-primary ring-offset-4 ring-offset-white rounded-full p-1' : ''} />
                </div>
                {idx < RANK_CATEGORIES.length - 1 && (
                  <ChevronRight size={14} className="text-gray-200" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Visualización Principal del Rango */}
      <div className="relative bg-white rounded-[40px] p-8 md:p-16 shadow-xl border border-gray-100 overflow-hidden">
        {/* Fondo decorativo (glow sutil) */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.08] ${rankInfo.category.bg} pointer-events-none`} />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24">
          
          {/* Rango Anterior */}
          <div className="hidden md:flex flex-col items-center gap-4 opacity-30">
            {rankInfo.prevRank ? (
              <>
                <RankIcon rankData={rankInfo.prevRank} tier={rankInfo.prevRank.tier} size="sm" />
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Anterior</p>
                  <p className={`text-sm font-bold ${rankInfo.prevRank.color}`}>{rankInfo.prevRank.fullName}</p>
                </div>
              </>
            ) : (
              <div className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl">
                <p className="text-[10px] font-black uppercase text-gray-200">Inicio</p>
              </div>
            )}
          </div>

          {/* Rango Actual (Centro) */}
          <motion.div 
            className="flex flex-col items-center gap-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <RankIcon 
              rankData={rankInfo.category} 
              tier={rankInfo.tier}
              size="lg" 
            />
            <div className="text-center space-y-2">
              <h2 className={`text-5xl md:text-6xl font-black tracking-tighter uppercase ${rankInfo.category.color}`}>
                {rankInfo.fullName}
              </h2>
              <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  {xp} XP Totales
                </p>
              </div>
            </div>
          </motion.div>

          {/* Siguiente Rango */}
          <div className="hidden md:flex flex-col items-center gap-4 opacity-30">
            {rankInfo.nextRank ? (
              <>
                <RankIcon rankData={rankInfo.nextRank} tier={rankInfo.nextRank.tier} size="sm" />
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Siguiente</p>
                  <p className={`text-sm font-bold ${rankInfo.nextRank.color}`}>{rankInfo.nextRank.fullName}</p>
                </div>
              </>
            ) : (
              <div className="w-24 h-24 flex flex-col items-center justify-center bg-yellow-50 rounded-3xl border border-yellow-100">
                <Trophy size={32} className="text-yellow-500 opacity-50" />
              </div>
            )}
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="relative z-10 max-w-2xl mx-auto mt-20 space-y-6">
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner p-1">
            <motion.div 
              className={`h-full rounded-full bg-gradient-to-r ${rankInfo.category.gradient} shadow-lg`}
              initial={{ width: 0 }}
              animate={{ width: `${rankInfo.progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
            />
          </div>
          
          <div className="text-center">
            {rankInfo.isMaxRank ? (
              <p className="text-xl font-black text-yellow-600 uppercase tracking-tight flex items-center justify-center gap-3">
                <Trophy size={24} />
                ¡Rango Legendario Alcanzado!
              </p>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Siguiente Ascenso</p>
                <p className="text-xl font-bold text-gray-800">
                  Faltan <span className={`${rankInfo.nextRank?.color || 'text-primary'} font-black`}>{rankInfo.xpRemaining}</span> puntos de experiencia
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaRanked;
