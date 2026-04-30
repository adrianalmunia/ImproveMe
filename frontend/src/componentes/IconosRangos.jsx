import React from 'react';
import { motion } from 'framer-motion';

// Importar imágenes de rangos
import imgPiedra from '../assets/rangos/piedra.png';
import imgBronce from '../assets/rangos/bronce.png';
import imgPlata from '../assets/rangos/plata.png';
import imgOro from '../assets/rangos/oro.png';
import imgEsmeralda from '../assets/rangos/esmeralda.png';
import imgZafiro from '../assets/rangos/zafiro.png';
import imgAmatista from '../assets/rangos/amatista.png';
import imgRubi from '../assets/rangos/rubi.png';

/**
 * COMPONENTE DE ICONOS DE RANGO CON ASSETS PNG
 * Maneja 3 variantes visuales según el Tier a través de efectos de Framer Motion.
 */

const BaseIcon = ({ src, id, size = 100, className = "", glowColor = "rgba(255,255,255,0.2)", tier = "III" }) => {
  // Ajustar intensidad del glow y escala según el Tier
  const glowOpacity = tier === "I" ? 0.8 : tier === "II" ? 0.5 : 0.3;
  const glowScale = tier === "I" ? 1.4 : tier === "II" ? 1.2 : 1;
  const imageScale = tier === "I" ? 1.1 : tier === "II" ? 1.05 : 1;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: 2 }}
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Resplandor exterior dinámico */}
      <motion.div 
        className="absolute inset-0 blur-3xl rounded-full pointer-events-none"
        style={{ backgroundColor: glowColor, opacity: glowOpacity }}
        animate={{ 
          scale: [1, glowScale, 1], 
          opacity: [glowOpacity * 0.6, glowOpacity, glowOpacity * 0.6] 
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Imagen del Rango */}
      <motion.img 
        src={src} 
        alt={id}
        className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
        style={{ scale: imageScale }}
        animate={tier === "I" ? {
          filter: [
            "drop-shadow(0 0 10px rgba(255,255,255,0.4))",
            "drop-shadow(0 0 20px rgba(255,255,255,0.7))",
            "drop-shadow(0 0 10px rgba(255,255,255,0.4))"
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Indicador de Tier (Nivel) */}
      <div className="absolute -bottom-2 right-0 z-20 flex gap-0.5">
        {tier === "I" && (
          <>
            <div className="w-1.5 h-4 bg-white/80 rounded-full shadow-sm" />
            <div className="w-1.5 h-4 bg-white/80 rounded-full shadow-sm" />
            <div className="w-1.5 h-4 bg-white/80 rounded-full shadow-sm" />
          </>
        )}
        {tier === "II" && (
          <>
            <div className="w-1.5 h-4 bg-white/60 rounded-full shadow-sm" />
            <div className="w-1.5 h-4 bg-white/60 rounded-full shadow-sm" />
          </>
        )}
        {tier === "III" && (
          <div className="w-1.5 h-4 bg-white/40 rounded-full shadow-sm" />
        )}
      </div>
    </motion.div>
  );
};

export const IconoPiedra = (props) => <BaseIcon {...props} id="Piedra" src={imgPiedra} glowColor="#94A3B8" />;
export const IconoBronce = (props) => <BaseIcon {...props} id="Bronce" src={imgBronce} glowColor="#B45309" />;
export const IconoPlata = (props) => <BaseIcon {...props} id="Plata" src={imgPlata} glowColor="#CBD5E1" />;
export const IconoOro = (props) => <BaseIcon {...props} id="Oro" src={imgOro} glowColor="#F59E0B" />;
export const IconoEsmeralda = (props) => <BaseIcon {...props} id="Esmeralda" src={imgEsmeralda} glowColor="#10B981" />;
export const IconoZafiro = (props) => <BaseIcon {...props} id="Zafiro" src={imgZafiro} glowColor="#3B82F6" />;
export const IconoAmatista = (props) => <BaseIcon {...props} id="Amatista" src={imgAmatista} glowColor="#A855F7" />;
export const IconoRubi = (props) => <BaseIcon {...props} id="Rubi" src={imgRubi} glowColor="#EF4444" />;

const IconosRangos = {
  Piedra: IconoPiedra,
  Bronce: IconoBronce,
  Plata: IconoPlata,
  Oro: IconoOro,
  Esmeralda: IconoEsmeralda,
  Zafiro: IconoZafiro,
  Amatista: IconoAmatista,
  Rubi: IconoRubi,
  // Fallback para Diamante si se usa en el código
  Diamante: IconoZafiro 
};

export default IconosRangos;
