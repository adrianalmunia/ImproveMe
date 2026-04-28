import React from 'react';
import { motion } from 'framer-motion';

/**
 * COMPONENTE DE ICONOS DE RANGO DE ALTA FIDELIDAD CON PROGRESIÓN DE TIERS
 * Cada componente maneja 3 variantes: Tier III (Simple), Tier II (Medio), Tier I (Avanzado).
 */

const BaseIcon = ({ children, id, size = 100, className = "", glowColor = "rgba(255,255,255,0.2)", tier = "III" }) => {
  // Ajustar intensidad del glow según el Tier
  const glowOpacity = tier === "I" ? 0.6 : tier === "II" ? 0.4 : 0.2;
  const glowScale = tier === "I" ? 1.3 : tier === "II" ? 1.1 : 1;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, rotate: 1 }}
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Resplandor exterior dinámico */}
      <motion.div 
        className="absolute inset-0 blur-2xl rounded-full pointer-events-none"
        style={{ backgroundColor: glowColor, opacity: glowOpacity }}
        animate={{ scale: [1, glowScale, 1], opacity: [glowOpacity * 0.5, glowOpacity, glowOpacity * 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full relative z-10 overflow-visible filter drop-shadow-lg"
      >
        {children}
      </svg>
    </motion.div>
  );
};

export const IconoPiedra = ({ size, className, tier = "III" }) => (
  <BaseIcon id="Piedra" size={size} className={className} glowColor="#94A3B8" tier={tier}>
    <circle cx="50" cy="50" r="42" fill="#374151" stroke="#1F2937" strokeWidth="2" />
    <circle cx="50" cy="50" r="38" fill="#4B5563" />
    {tier !== "III" && (
       <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="#94A3B8" fillOpacity="0.2" />
    )}
    {tier === "I" && (
       <>
         <circle cx="50" cy="50" r="15" fill="#CBD5E1" fillOpacity="0.3" />
         <circle cx="35" cy="35" r="2" fill="white" fillOpacity="0.5" />
       </>
    )}
    <path d="M35 35 L45 45 M65 65 L55 55" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
  </BaseIcon>
);

export const IconoBronce = ({ size, className, tier = "III" }) => (
  <BaseIcon id="Bronce" size={size} className={className} glowColor="#B45309" tier={tier}>
    <path d="M50 10 L90 85 L10 85 Z" fill="#78350F" stroke="#451A03" strokeWidth="2" />
    <path d="M50 20 L80 80 L20 80 Z" fill="#92400E" />
    {tier !== "III" && (
      <path d="M50 35 L65 70 L35 70 Z" fill="#D97706" fillOpacity="0.4" />
    )}
    {tier === "I" && (
      <motion.path 
        d="M50 5 L95 90 L5 90 Z" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 4"
        animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }}
      />
    )}
  </BaseIcon>
);

export const IconoPlata = ({ size, className, tier = "III" }) => (
  <BaseIcon id="Plata" size={size} className={className} glowColor="#CBD5E1" tier={tier}>
    <rect x="18" y="18" width="64" height="64" rx="4" transform="rotate(45 50 50)" fill="#475569" stroke="#1E293B" strokeWidth="2" />
    <rect x="24" y="24" width="52" height="52" rx="2" transform="rotate(45 50 50)" fill="#94A3B8" />
    {tier !== "III" && (
      <rect x="35" y="35" width="30" height="30" rx="1" transform="rotate(45 50 50)" fill="#F1F5F9" fillOpacity="0.3" />
    )}
    {tier === "I" && (
      <path d="M50 15 L85 50 L50 85 L15 50 Z" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
    )}
  </BaseIcon>
);

export const IconoOro = ({ size, className, tier = "III" }) => (
  <BaseIcon id="Oro" size={size} className={className} glowColor="#F59E0B" tier={tier}>
    <path d="M50 10 L88 38 L74 85 L26 85 L12 38 Z" fill="#B45309" stroke="#78350F" strokeWidth="2" />
    <path d="M50 18 L80 42 L68 78 L32 78 L20 42 Z" fill="#F59E0B" />
    {tier !== "III" && (
       <path d="M50 25 L70 45 L60 70 L40 70 L30 45 Z" fill="#FEF3C7" fillOpacity="0.3" />
    )}
    {tier === "I" && (
      <motion.circle 
        cx="50" cy="50" r="10" fill="white" fillOpacity="0.5"
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    )}
  </BaseIcon>
);

export const IconoEsmeralda = ({ size, className, tier = "III" }) => (
  <BaseIcon id="Esmeralda" size={size} className={className} glowColor="#10B981" tier={tier}>
    <path d="M50 8 L88 30 L88 70 L50 92 L12 70 L12 30 Z" fill="#064E3B" stroke="#064E3B" strokeWidth="2" />
    <path d="M50 15 L80 34 L80 66 L50 85 L20 66 L20 34 Z" fill="#10B981" />
    {tier !== "III" && (
       <path d="M50 25 L70 38 L70 62 L50 75 L30 62 L30 38 Z" fill="#D1FAE5" fillOpacity="0.3" />
    )}
    {tier === "I" && (
      <path d="M50 8 V92 M12 30 L88 70 M88 30 L12 70" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
    )}
  </BaseIcon>
);

export const IconoZafiro = ({ size, className, tier = "III" }) => (
  <BaseIcon id="Zafiro" size={size} className={className} glowColor="#3B82F6" tier={tier}>
    <path d="M50 10 C60 10 90 15 90 50 C90 85 50 95 50 95 C50 95 10 85 10 50 C10 15 40 10 50 10" fill="#1E3A8A" stroke="#172554" strokeWidth="2" />
    <path d="M50 18 C58 18 82 22 82 50 C82 78 50 87 50 87 C50 87 18 78 18 50 C18 22 42 18 50 18" fill="#3B82F6" />
    {tier !== "III" && (
      <path d="M50 25 C55 25 72 28 72 50 C72 70 50 78 50 78 C50 78 28 70 28 50 C28 28 45 25 50 25" fill="white" fillOpacity="0.2" />
    )}
    {tier === "I" && (
      <path d="M50 10 V95 M10 50 H90" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
    )}
  </BaseIcon>
);

export const IconoDiamante = ({ size, className, tier = "III" }) => (
  <BaseIcon id="Diamante" size={size} className={className} glowColor="#06B6D4" tier={tier}>
    <path d="M50 5 L90 40 L50 95 L10 40 Z" fill="#0E7490" stroke="#164E63" strokeWidth="2" />
    <path d="M50 15 L80 42 L50 85 L20 42 Z" fill="#22D3EE" />
    {tier !== "III" && (
       <path d="M50 25 L70 42 L50 70 L30 42 Z" fill="white" fillOpacity="0.3" />
    )}
    {tier === "I" && (
       <motion.path 
         d="M30 30 L40 20 M60 20 L70 30" stroke="white" strokeWidth="2" strokeLinecap="round"
         animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity }}
       />
    )}
  </BaseIcon>
);

export const IconoAmatista = ({ size, className, tier = "III" }) => (
  <BaseIcon id="Amatista" size={size} className={className} glowColor="#A855F7" tier={tier}>
    <path d="M50 5 L63 35 L95 38 L72 58 L80 90 L50 75 L20 90 L28 58 L5 38 L37 35 Z" fill="#581C87" stroke="#3B0764" strokeWidth="2" />
    <path d="M50 15 L60 38 L85 41 L68 56 L74 78 L50 67 L26 78 L32 56 L15 41 L40 38 Z" fill="#A855F7" />
    {tier !== "III" && (
       <circle cx="50" cy="50" r="10" fill="white" fillOpacity="0.2" />
    )}
    {tier === "I" && (
       <motion.circle 
         cx="50" cy="50" r="18" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.4"
         animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
       />
    )}
  </BaseIcon>
);

export const IconoRubi = ({ size, className, tier = "III" }) => (
  <BaseIcon id="Rubi" size={size} className={className} glowColor="#EF4444" tier={tier}>
    <path d="M50 2 L65 30 L95 35 L75 55 L85 85 L50 70 L15 85 L25 55 L5 35 L35 30 Z" fill="#7F1D1D" stroke="#450A0A" strokeWidth="2" />
    <path d="M50 12 L62 34 L85 38 L68 54 L76 78 L50 64 L24 78 L32 54 L15 38 L38 34 Z" fill="#EF4444" />
    {tier !== "III" && (
       <path d="M50 25 L58 45 L50 65 L42 45 Z" fill="white" fillOpacity="0.3" />
    )}
    {tier === "I" && (
       <motion.g animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
         <circle cx="50" cy="10" r="2" fill="white" />
         <circle cx="90" cy="50" r="2" fill="white" />
         <circle cx="50" cy="90" r="2" fill="white" />
         <circle cx="10" cy="50" r="2" fill="white" />
       </motion.g>
    )}
  </BaseIcon>
);

const IconosRangos = {
  Piedra: IconoPiedra,
  Bronce: IconoBronce,
  Plata: IconoPlata,
  Oro: IconoOro,
  Esmeralda: IconoEsmeralda,
  Zafiro: IconoZafiro,
  Diamante: IconoDiamante,
  Amatista: IconoAmatista,
  Rubi: IconoRubi
};

export default IconosRangos;
