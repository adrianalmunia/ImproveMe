import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// --- IMPORTAR TODOS LOS ASSETS INDIVIDUALES ---
import imgSinRango from '../assets/rangos/sin_rango.png';

import imgBronce1 from '../assets/rangos/bronce1.png';
import imgBronce2 from '../assets/rangos/bronce2.png';
import imgBronce3 from '../assets/rangos/bronce3.png';

import imgPlata1 from '../assets/rangos/plata1.png';
import imgPlata2 from '../assets/rangos/plata2.png';
import imgPlata3 from '../assets/rangos/plata3.png';

import imgOro1 from '../assets/rangos/oro.png'; // Tier 1 es el base sin numero
import imgOro2 from '../assets/rangos/oro2.png';
import imgOro3 from '../assets/rangos/oro3.png';

import imgEsmeralda1 from '../assets/rangos/esmeralda.png';
import imgEsmeralda2 from '../assets/rangos/esmeralda2.png';
import imgEsmeralda3 from '../assets/rangos/esmeralda3.png';

import imgDiamante1 from '../assets/rangos/diamante.png';
import imgDiamante2 from '../assets/rangos/diamante2.png';
import imgDiamante3 from '../assets/rangos/diamante3.png';

import imgZafiro1 from '../assets/rangos/zafiro.png';
import imgZafiro2 from '../assets/rangos/zafiro2.png';
import imgZafiro3 from '../assets/rangos/zafiro3.png';

import imgAmatista1 from '../assets/rangos/amatista1.png';
import imgAmatista2 from '../assets/rangos/amatista2.png';
import imgAmatista3 from '../assets/rangos/amatista3.png';

import imgRubi1 from '../assets/rangos/rubi1.png';
import imgRubi2 from '../assets/rangos/rubi2.png';
import imgRubi3 from '../assets/rangos/rubi3.png';

/**
 * COMPONENTE BASE PARA ICONOS CON EFECTO 3D
 */
const BaseIcon = ({ src, size = 100, className = "", glowColor = "rgba(255,255,255,0.2)", tier = "III", showGlow = true }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const xSpring = useSpring(mouseX, springConfig);
  const ySpring = useSpring(mouseY, springConfig);

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-15, 15]);
  
  const glareX = useTransform(xSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(ySpring, [-0.5, 0.5], ["0%", "100%"]);

  const manejarMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const manejarMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Intensidad del glow según el Tier
  const baseGlowOpacity = tier === "I" ? 0.7 : tier === "II" ? 0.4 : 0.25;
  const glowOpacity = showGlow ? baseGlowOpacity : baseGlowOpacity * 0.3;
  const glowScale = showGlow ? (tier === "I" ? 1.2 : tier === "II" ? 1.1 : 1.05) : 1;
  const imageScale = tier === "I" ? 1.15 : tier === "II" ? 1.08 : 1.02;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onMouseMove={manejarMouseMove}
      onMouseLeave={manejarMouseLeave}
      style={{ width: size, height: size, perspective: 1000 }}
      className={`relative flex items-center justify-center shrink-0 cursor-pointer group p-2 ${className}`}
    >
      {/* Resplandor exterior (más contenido y suave) */}
      <motion.div 
        className={`absolute inset-[10%] rounded-full pointer-events-none ${showGlow ? 'blur-2xl' : 'blur-xl'}`}
        style={{ backgroundColor: glowColor, opacity: glowOpacity, scale: glowScale }}
        animate={showGlow ? { opacity: [glowOpacity * 0.7, glowOpacity, glowOpacity * 0.7] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Contenedor 3D */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", width: "100%", height: "100%" }}
        className="relative flex items-center justify-center"
      >
        <motion.img 
          src={src}
          alt={`Rango Tier ${tier}`}
          className="w-full h-full object-contain relative z-10"
          style={{ scale: imageScale, mixBlendMode: 'multiply', translateZ: 50 }}
        />

        {/* Glare overlay */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.4) 0%, transparent 70%)`,
            mixBlendMode: "overlay",
            translateZ: 60
          }}
        />
      </motion.div>
    </motion.div>
  );
};

// --- COMPONENTES ESPECÍFICOS ---

export const IconoSinRango = (props) => <BaseIcon {...props} tier="III" src={imgSinRango} glowColor="#F1F5F9" />;

export const IconoBronce = (props) => {
  const imgs = { I: imgBronce1, II: imgBronce2, III: imgBronce3 };
  return <BaseIcon {...props} src={imgs[props.tier || 'III']} glowColor="#B45309" />;
};

export const IconoPlata = (props) => {
  const imgs = { I: imgPlata1, II: imgPlata2, III: imgPlata3 };
  return <BaseIcon {...props} src={imgs[props.tier || 'III']} glowColor="#CBD5E1" />;
};

export const IconoOro = (props) => {
  const imgs = { I: imgOro1, II: imgOro2, III: imgOro3 };
  return <BaseIcon {...props} src={imgs[props.tier || 'III']} glowColor="#F59E0B" />;
};

export const IconoEsmeralda = (props) => {
  const imgs = { I: imgEsmeralda1, II: imgEsmeralda2, III: imgEsmeralda3 };
  return <BaseIcon {...props} src={imgs[props.tier || 'III']} glowColor="#10B981" />;
};

export const IconoDiamante = (props) => {
  const imgs = { I: imgDiamante1, II: imgDiamante2, III: imgDiamante3 };
  return <BaseIcon {...props} src={imgs[props.tier || 'III']} glowColor="#06B6D4" />;
};

export const IconoZafiro = (props) => {
  const imgs = { I: imgZafiro1, II: imgZafiro2, III: imgZafiro3 };
  return <BaseIcon {...props} src={imgs[props.tier || 'III']} glowColor="#3B82F6" />;
};

export const IconoAmatista = (props) => {
  const imgs = { I: imgAmatista1, II: imgAmatista2, III: imgAmatista3 };
  return <BaseIcon {...props} src={imgs[props.tier || 'III']} glowColor="#A855F7" />;
};

export const IconoRubi = (props) => {
  const imgs = { I: imgRubi1, II: imgRubi2, III: imgRubi3 };
  return <BaseIcon {...props} src={imgs[props.tier || 'III']} glowColor="#EF4444" />;
};

const IconosRangos = {
  SinRango: IconoSinRango,
  Bronce: IconoBronce,
  Plata: IconoPlata,
  Oro: IconoOro,
  Esmeralda: IconoEsmeralda,
  Diamante: IconoDiamante,
  Zafiro: IconoZafiro,
  Amatista: IconoAmatista,
  Rubi: IconoRubi
};

export default IconosRangos;

