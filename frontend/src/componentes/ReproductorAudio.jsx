import React, { useState, useRef } from 'react';

export function ReproductorAudio({ src }) {
  const reproductorAudioRef = useRef(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progresoAudio, setProgresoAudio] = useState(0);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [duracionAudio, setDuracionAudio] = useState(0);
  const [velocidadAudio, setVelocidadAudio] = useState(1);

  const toggleReproduccion = (e) => {
    e.stopPropagation();
    if (reproductorAudioRef.current) {
      if (reproduciendo) {
        reproductorAudioRef.current.pause();
      } else {
        reproductorAudioRef.current.play();
      }
      setReproduciendo(!reproduciendo);
    }
  };

  const formatearTiempo = (segundos) => {
    if (isNaN(segundos) || !isFinite(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const sec = Math.floor(segundos % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const actualizarProgreso = () => {
    const audioEl = reproductorAudioRef.current;
    if (audioEl) {
      setTiempoActual(audioEl.currentTime);
      if (audioEl.duration && audioEl.duration !== Infinity) {
        setProgresoAudio((audioEl.currentTime / audioEl.duration) * 100);
      }
    }
  };

  const manejarMetadatosAudio = (e) => {
    if (e.target.duration && e.target.duration !== Infinity) {
      setDuracionAudio(e.target.duration);
    }
  };

  const manejarFinAudio = () => {
    setReproduciendo(false);
    setProgresoAudio(0);
    setTiempoActual(0);
  };

  const alternarVelocidad = (e) => {
    e.stopPropagation();
    const audioEl = reproductorAudioRef.current;
    if (!audioEl) return;

    let nuevaVelocidad = 1;
    if (velocidadAudio === 1) nuevaVelocidad = 1.5;
    else if (velocidadAudio === 1.5) nuevaVelocidad = 2;
    else nuevaVelocidad = 1;

    setVelocidadAudio(nuevaVelocidad);
    audioEl.playbackRate = nuevaVelocidad;
  };

  const manejarClickBarraProgreso = (e) => {
    e.stopPropagation();
    const audioEl = reproductorAudioRef.current;
    if (!audioEl || !audioEl.duration || audioEl.duration === Infinity) return;

    const barra = e.currentTarget;
    const rect = barra.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const porcentaje = clickX / width;

    audioEl.currentTime = porcentaje * audioEl.duration;
    setProgresoAudio(porcentaje * 100);
    setTiempoActual(audioEl.currentTime);
  };

  return (
    <div className="flex items-center gap-3 bg-[#4F99CC]/10 border border-[#4F99CC]/20 px-4 py-2 rounded-full w-full max-w-[280px]">
      <button
        onClick={toggleReproduccion}
        className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 transition-transform"
      >
        {reproduciendo ? '⏸' : '▶'}
      </button>

      <div className="flex-1 flex flex-col justify-center px-1">
        <div
          className="h-2 bg-white/60 rounded-full overflow-hidden cursor-pointer w-full relative"
          onClick={manejarClickBarraProgreso}
        >
          <div className="absolute top-0 left-0 h-full bg-[#4F99CC] transition-all duration-100 pointer-events-none" style={{ width: `${progresoAudio}%` }}></div>
        </div>
        <div className="flex justify-between text-[10px] text-[#4F99CC] font-bold mt-1 px-1">
          <span>{formatearTiempo(tiempoActual)}</span>
          <span>{duracionAudio > 0 ? formatearTiempo(duracionAudio) : ''}</span>
        </div>
      </div>

      <button
        onClick={alternarVelocidad}
        className="text-xs font-bold bg-white text-[#4F99CC] px-2 py-1 rounded-full shadow-sm hover:bg-gray-50 border border-[#4F99CC]/20 shrink-0 min-w-[36px] text-center"
      >
        {velocidadAudio}x
      </button>

      <audio
        ref={reproductorAudioRef}
        src={src}
        onTimeUpdate={actualizarProgreso}
        onLoadedMetadata={manejarMetadatosAudio}
        onEnded={manejarFinAudio}
        className="hidden"
      />
    </div>
  );
}

export default ReproductorAudio;
