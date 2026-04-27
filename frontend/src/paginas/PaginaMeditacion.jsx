import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, Flower2, Timer, CheckCircle2, ChevronUp, ChevronDown, Settings, Bell, Music, ChevronRight, CloudRain, Moon, Volume2, Trees, Waves } from 'lucide-react';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { registrarSesionMeditacion } from '../servicios/servicioAPI';

// Audio imports
import gongInicioFinal from '../assets/audio/gong_inicio_final.mp3';
import gongMid from '../assets/audio/gong_mid.mp3';
import musicaNoche from '../assets/audio/noche.wav';
import musicaTormenta from '../assets/audio/tromenta.wav';
import musicaBosque from '../assets/audio/bosque.wav';
import musicaPlaya from '../assets/audio/playa.wav';

const COLOR = '#10B981';
const COLOR2 = '#C6A55E';
const PRESETS = [1, 3, 5, 10, 15, 20, 30, 45, 60];

const TECNICAS_RESPIRACION = [
  { 
    id: 'equilibrio', 
    label: 'Equilibrio (4-2-4)', 
    desc: 'Una técnica sencilla para centrar la mente y calmar el sistema nervioso.',
    ciclo: [
      { fase: 'Inhala', duracion: 4 },
      { fase: 'Mantén', duracion: 2 },
      { fase: 'Exhala', duracion: 4 },
    ]
  },
  { 
    id: 'cuadrada', 
    label: 'Caja (4-4-4-4)', 
    desc: 'Técnica utilizada para reducir el estrés y mejorar la concentración.',
    ciclo: [
      { fase: 'Inhala', duracion: 4 },
      { fase: 'Mantén', duracion: 4 },
      { fase: 'Exhala', duracion: 4 },
      { fase: 'Vacío', duracion: 4 },
    ]
  },
  { 
    id: 'relajacion', 
    label: 'Relajación (4-7-8)', 
    desc: 'Ideal para combatir el insomnio o la ansiedad. Actúa como sedante natural.',
    ciclo: [
      { fase: 'Inhala', duracion: 4 },
      { fase: 'Mantén', duracion: 7 },
      { fase: 'Exhala', duracion: 8 },
    ]
  }
];

const PISTAS_MUSICA = [
  { id: 'noche', label: 'Noche Tranquila', src: musicaNoche, icon: Moon },
  { id: 'tormenta', label: 'Tormenta', src: musicaTormenta, icon: CloudRain },
  { id: 'bosque', label: 'Bosque', src: musicaBosque, icon: Trees },
  { id: 'playa', label: 'Playa', src: musicaPlaya, icon: Waves },
];

export function PaginaMeditacion() {
  const { usuario } = useAutenticacion();
  const [estaMeditando, setEstaMeditando] = useState(false);
  const [tiempoSeleccionado, setTiempoSeleccionado] = useState(5);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [estaPausado, setEstaPausado] = useState(false);
  const [faseRespiracion, setFaseRespiracion] = useState('Inhala');
  const [progreso, setProgreso] = useState(0);
  const [sesionFinalizada, setSesionFinalizada] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const [ajustes, setAjustes] = useState({
    gongInicio: true,
    gongMitad: true,
    gongFinal: true,
    musica: false,
    pistaMusica: 'noche',
    tecnicaRespiracion: 'equilibrio',
  });
  const [gongsLanzados, setGongsLanzados] = useState({ mitad: false });
  const [volumenMusica, setVolumenMusica] = useState(0.3);

  const intervalRef = useRef(null);
  const breathingRef = useRef(null);
  const gongAudioRef = useRef(null);
  const musicaAudioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const esRestauracion = useRef(true);

  // --- Funciones de Audio ---
  const reproducirGong = useCallback((tipo) => {
    const src = tipo === 'mid' ? gongMid : gongInicioFinal;
    if (gongAudioRef.current) {
      gongAudioRef.current.pause();
      gongAudioRef.current.currentTime = 0;
    }
    gongAudioRef.current = new Audio(src);
    gongAudioRef.current.volume = 0.7;
    gongAudioRef.current.play().catch(() => {});
  }, []);

  const iniciarMusica = useCallback(() => {
    const pista = PISTAS_MUSICA.find(p => p.id === ajustes.pistaMusica);
    if (!pista) return;
    if (musicaAudioRef.current) {
      musicaAudioRef.current.pause();
    }
    clearInterval(fadeIntervalRef.current);
    const audio = new Audio(pista.src);
    audio.loop = true;
    audio.volume = 0; 
    musicaAudioRef.current = audio;

    audio.play().catch(e => console.error("Error al reproducir audio:", e));

    // Fade in: de 0 al volumen objetivo en ~3 segundos
    const pasos = 30;
    const incremento = volumenMusica / pasos;
    let paso = 0;
    fadeIntervalRef.current = setInterval(() => {
      paso++;
      if (paso >= pasos) {
        audio.volume = volumenMusica;
        clearInterval(fadeIntervalRef.current);
      } else {
        audio.volume = Math.min(incremento * paso, 1);
      }
    }, 100);
  }, [ajustes.pistaMusica, volumenMusica]);

  const pararMusica = useCallback(() => {
    const audio = musicaAudioRef.current;
    if (!audio) return;
    clearInterval(fadeIntervalRef.current);

    // Fade out: del volumen actual a 0 en ~2 segundos
    const volActual = audio.volume;
    const pasos = 20;
    const decremento = volActual / pasos;
    let paso = 0;
    fadeIntervalRef.current = setInterval(() => {
      paso++;
      if (paso >= pasos) {
        clearInterval(fadeIntervalRef.current);
        audio.pause();
        audio.currentTime = 0;
        musicaAudioRef.current = null;
      } else {
        audio.volume = Math.max(volActual - decremento * paso, 0);
      }
    }, 100);
  }, []);

  // --- Persistencia ---
  useEffect(() => {
    if (!usuario?.id) return;
    const guardado = localStorage.getItem(`meditacion_${usuario.id}`);
    if (guardado) {
      const s = JSON.parse(guardado);
      setTiempoSeleccionado(s.tiempoSeleccionado || 5);
      if (s.ajustes) setAjustes(prev => ({ ...prev, ...s.ajustes }));
      if (s.volumenMusica !== undefined) setVolumenMusica(s.volumenMusica);
      if (s.estaMeditando && s.segundosRestantes > 0) {
        // Al restaurar, mantenemos los segundos pero forzamos pausa
        esRestauracion.current = true;
        setSegundosRestantes(s.segundosRestantes);
        setEstaMeditando(true);
        setEstaPausado(true);
        setProgreso(((s.tiempoSeleccionado * 60 - s.segundosRestantes) / (s.tiempoSeleccionado * 60)) * 100);
        // Desactivar la marca de restauración tras el primer render
        requestAnimationFrame(() => { esRestauracion.current = false; });
      } else {
        esRestauracion.current = false;
      }
    }
  }, [usuario]);

  useEffect(() => {
    if (!usuario?.id) return;
    localStorage.setItem(`meditacion_${usuario.id}`, JSON.stringify({
      tiempoSeleccionado, segundosRestantes, estaMeditando, estaPausado, ajustes, volumenMusica, timestamp: Date.now()
    }));
  }, [tiempoSeleccionado, segundosRestantes, estaMeditando, estaPausado, ajustes, volumenMusica, usuario]);

  // Sincronizar volumen en tiempo real
  useEffect(() => {
    if (musicaAudioRef.current && estaMeditando && !estaPausado) {
      musicaAudioRef.current.volume = volumenMusica;
    }
  }, [volumenMusica, estaMeditando, estaPausado]);

  // --- Sesión ---
  const finalizarSesion = useCallback(() => {
    const totalSegundos = tiempoSeleccionado * 60;
    const completados = totalSegundos - segundosRestantes;

    setEstaMeditando(false);
    setSesionFinalizada(true);
    clearInterval(intervalRef.current);
    clearInterval(breathingRef.current);
    pararMusica();
    if (ajustes.gongFinal) reproducirGong('inicio_final');

    // Guardar en base de datos
    if (usuario?.id) {
      registrarSesionMeditacion({
        usuario_id: usuario.id,
        duracion_segundos: totalSegundos,
        segundos_completados: completados,
        tecnica_respiracion: ajustes.tecnicaRespiracion,
        pista_musica: ajustes.musica ? ajustes.pistaMusica : null,
      }).catch(err => console.error('Error al registrar sesión de meditación:', err));
    }
  }, [ajustes.gongFinal, ajustes.tecnicaRespiracion, ajustes.musica, ajustes.pistaMusica, reproducirGong, pararMusica, tiempoSeleccionado, segundosRestantes, usuario]);

  // Limpieza al salir de la pantalla con desvanecimiento (fade out)
  useEffect(() => {
    return () => {
      const audioActual = musicaAudioRef.current;
      if (audioActual) {
        clearInterval(fadeIntervalRef.current);
        // Fade out rápido al salir
        const vol = audioActual.volume;
        const fadeOutInterval = setInterval(() => {
          if (audioActual.volume > 0.05) {
            audioActual.volume -= 0.05;
          } else {
            audioActual.pause();
            clearInterval(fadeOutInterval);
          }
        }, 30);
      }
      musicaAudioRef.current = null;
    };
  }, []);

  // Controlar Play/Pause con lógica de audio integrada y forzada
  const manejarPlayPause = () => {
    const iraReproducir = estaPausado;
    setEstaPausado(!estaPausado);
    
    if (iraReproducir && ajustes.musica) {
      // Forzamos la creación/reproducción del audio por interacción directa
      if (!musicaAudioRef.current) {
        iniciarMusica();
      } else {
        musicaAudioRef.current.play().catch(() => iniciarMusica());
      }
    } else if (musicaAudioRef.current) {
      musicaAudioRef.current.pause();
    }
  };

  // Temporizador
  useEffect(() => {
    if (estaMeditando && !estaPausado && segundosRestantes > 0) {
      intervalRef.current = setInterval(() => {
        setSegundosRestantes(prev => {
          const nuevo = prev - 1;
          const total = tiempoSeleccionado * 60;
          setProgreso(((total - nuevo) / total) * 100);
          return nuevo;
        });
      }, 1000);
    } else if (segundosRestantes === 0 && estaMeditando) {
      finalizarSesion();
    }
    return () => clearInterval(intervalRef.current);
  }, [estaMeditando, estaPausado, segundosRestantes, tiempoSeleccionado, finalizarSesion]);

  // Gong de mitad
  useEffect(() => {
    if (!estaMeditando || estaPausado || !ajustes.gongMitad) return;
    const mitad = Math.floor((tiempoSeleccionado * 60) / 2);
    if (segundosRestantes === mitad && !gongsLanzados.mitad) {
      reproducirGong('mid');
      setGongsLanzados(g => ({ ...g, mitad: true }));
    }
  }, [segundosRestantes, estaMeditando, estaPausado, ajustes.gongMitad, tiempoSeleccionado, gongsLanzados, reproducirGong]);

  // Respiración
  useEffect(() => {
    if (estaMeditando && !estaPausado) {
      const tecnica = TECNICAS_RESPIRACION.find(t => t.id === ajustes.tecnicaRespiracion) || TECNICAS_RESPIRACION[0];
      const duracionTotal = tecnica.ciclo.reduce((acc, f) => acc + f.duracion, 0);
      
      let c = 0;
      setFaseRespiracion(tecnica.ciclo[0].fase);

      breathingRef.current = setInterval(() => {
        c = (c + 1) % duracionTotal;
        
        let acumulado = 0;
        for (const paso of tecnica.ciclo) {
          acumulado += paso.duracion;
          if (c < acumulado) {
            setFaseRespiracion(paso.fase);
            break;
          }
        }
      }, 1000);
    }
    return () => clearInterval(breathingRef.current);
  }, [estaMeditando, estaPausado, ajustes.tecnicaRespiracion]);

  const iniciar = () => {
    const total = tiempoSeleccionado * 60;
    setSegundosRestantes(total);
    setEstaMeditando(true);
    setEstaPausado(false);
    setProgreso(0);
    setSesionFinalizada(false);
    setGongsLanzados({ mitad: false });
    if (ajustes.gongInicio) setTimeout(() => reproducirGong('inicio_final'), 300);
    if (ajustes.musica) setTimeout(() => iniciarMusica(), 800);
  };

  const salir = () => {
    setEstaMeditando(false);
    setSesionFinalizada(false);
    setProgreso(0);
    pararMusica();
    clearInterval(intervalRef.current);
    clearInterval(breathingRef.current);
  };

  const fmt = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Cálculos de respiración extraídos del JSX para evitar errores de renderizado
  const tecnicaActual = TECNICAS_RESPIRACION.find(t => t.id === ajustes.tecnicaRespiracion) || TECNICAS_RESPIRACION[0];
  const pasoActual = tecnicaActual.ciclo.find(p => p.fase === faseRespiracion) || tecnicaActual.ciclo[0];
  const duracionFase = pasoActual.duracion;
  const esExpansion = faseRespiracion === 'Inhala' || faseRespiracion === 'Mantén';

  // SVG progress ring — circunferencia real para precisión
  const radioSVG = 115;
  const circunferencia = 2 * Math.PI * radioSVG;
  const dashOffset = circunferencia - (progreso / 100) * circunferencia;

  return (
    <main className="flex-1 h-full overflow-y-auto relative font-['Inter'] bg-neutral-50">
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50/60 to-white pointer-events-none" />

      <div className="max-w-3xl mx-auto px-8 py-12 flex flex-col items-center justify-center min-h-full relative z-10">
        <AnimatePresence mode="wait">

          {/* ====== SELECTOR ====== */}
          {!estaMeditando && !sesionFinalizada && (
            <motion.div key="selector" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white rounded-[48px] shadow-2xl p-10 flex flex-col items-center">

              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${COLOR} 0%, ${COLOR2} 100%)` }}>
                <Flower2 size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-['Tilt_Warp'] text-gray-800 mb-1">Momento de Calma</h2>
              <p className="text-gray-400 text-sm mb-8 text-center">Elige cuánto tiempo quieres meditar hoy.</p>

              {/* Selector de tiempo */}
              <div className="flex items-center gap-6 mb-4 bg-emerald-50/60 px-8 py-5 rounded-[28px] border border-emerald-100/60 w-full justify-center relative">
                <button onClick={() => setTiempoSeleccionado(p => Math.max(1, p - 1))}
                  className="w-11 h-11 bg-white rounded-2xl shadow flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all">
                  <ChevronDown size={22} />
                </button>

                <div className="relative flex flex-col items-center min-w-[100px]">
                  <button onClick={() => setMostrarDropdown(d => !d)}
                    className="text-6xl font-['Tilt_Warp'] text-emerald-600 leading-none hover:opacity-70 transition-opacity flex items-end gap-1">
                    {tiempoSeleccionado}
                    <ChevronRight size={20} className={`mb-2 text-emerald-400 transition-transform ${mostrarDropdown ? 'rotate-90' : ''}`} />
                  </button>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-1">Minutos</span>

                  <AnimatePresence>
                    {mostrarDropdown && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full mt-3 bg-white rounded-[20px] shadow-2xl border border-emerald-100 p-3 z-50 grid grid-cols-3 gap-2 w-48">
                        {PRESETS.map(p => (
                          <button key={p} onClick={() => { setTiempoSeleccionado(p); setMostrarDropdown(false); }}
                            className={`py-2 rounded-xl text-sm font-bold transition-all ${tiempoSeleccionado === p ? 'bg-emerald-500 text-white shadow' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                            {p} min
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button onClick={() => setTiempoSeleccionado(p => Math.min(60, p + 1))}
                  className="w-11 h-11 bg-white rounded-2xl shadow flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all">
                  <ChevronUp size={22} />
                </button>
              </div>

              {/* Botón Ajustes */}
              <button onClick={() => setMostrarAjustes(a => !a)}
                className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest mb-6 hover:text-emerald-700 transition-colors">
                <Settings size={14} /> Ajustes de Sesión
                <ChevronRight size={14} className={`transition-transform ${mostrarAjustes ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {mostrarAjustes && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="w-full bg-emerald-50/60 rounded-[24px] border border-emerald-100/60 p-5 mb-6 space-y-3 overflow-hidden">
                    
                    {/* Gongs */}
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Bell size={12}/> Sonidos de Gong</p>
                    {[
                      { key: 'gongInicio', label: 'Gong al inicio' },
                      { key: 'gongMitad', label: 'Gong a la mitad' },
                      { key: 'gongFinal', label: 'Gong al final' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">{label}</span>
                        <button onClick={() => setAjustes(a => ({ ...a, [key]: !a[key] }))}
                          className={`w-11 h-6 rounded-full transition-all relative ${ajustes[key] ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                          <motion.div animate={{ x: ajustes[key] ? 22 : 2 }}
                            className="w-5 h-5 bg-white rounded-full shadow absolute top-0.5" />
                        </button>
                      </div>
                    ))}

                    {/* Música */}
                    <div className="pt-3 border-t border-emerald-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Music size={12}/> Música Ambiental</span>
                        <button onClick={() => setAjustes(a => ({ ...a, musica: !a.musica }))}
                          className={`w-11 h-6 rounded-full transition-all relative ${ajustes.musica ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                          <motion.div animate={{ x: ajustes.musica ? 22 : 2 }}
                            className="w-5 h-5 bg-white rounded-full shadow absolute top-0.5" />
                        </button>
                      </div>

                      {ajustes.musica && (
                        <div className="grid grid-cols-2 gap-2">
                          {PISTAS_MUSICA.map(p => {
                            const Icono = p.icon;
                            const activa = ajustes.pistaMusica === p.id;
                            return (
                              <button key={p.id} onClick={() => setAjustes(a => ({ ...a, pistaMusica: p.id }))}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left ${activa ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-100'}`}>
                                <Icono size={18} />
                                <span className="text-xs font-bold">{p.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Técnica de Respiración */}
                    <div className="pt-3 border-t border-emerald-100 space-y-3">
                      <span className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">Técnica de Respiración</span>
                      <div className="flex flex-col gap-2">
                        {TECNICAS_RESPIRACION.map(t => (
                          <button key={t.id} onClick={() => setAjustes(a => ({ ...a, tecnicaRespiracion: t.id }))}
                            className={`p-4 rounded-2xl transition-all text-left border ${ajustes.tecnicaRespiracion === t.id ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg' : 'bg-white text-gray-600 border-gray-100 hover:bg-emerald-50'}`}>
                            <p className="text-xs font-black uppercase tracking-widest mb-1">{t.label}</p>
                            <p className={`text-[10px] leading-relaxed ${ajustes.tecnicaRespiracion === t.id ? 'text-white/80' : 'text-gray-400'}`}>{t.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={iniciar}
                className="w-full py-5 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 text-sm"
                style={{ background: `linear-gradient(135deg, ${COLOR} 0%, ${COLOR2} 100%)` }}>
                <Play size={18} fill="currentColor" /> Comenzar Sesión
              </motion.button>
            </motion.div>
          )}

          {/* ====== SESIÓN ACTIVA ====== */}
          {estaMeditando && (
            <motion.div key="activa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-center gap-10">

              {/* Anillo de progreso con SVG preciso */}
              <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
                <svg width="260" height="260" className="absolute inset-0">
                  <circle cx="130" cy="130" r={radioSVG} fill="none" stroke="#d1fae5" strokeWidth="10" />
                  <circle cx="130" cy="130" r={radioSVG} fill="none"
                    stroke={COLOR} strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={circunferencia}
                    strokeDashoffset={dashOffset}
                    style={{ 
                      transition: (esRestauracion.current || progreso === 0) ? 'none' : 'stroke-dashoffset 1s linear', 
                      transform: 'rotate(-90deg)', 
                      transformOrigin: '130px 130px' 
                    }} />
                </svg>
                <div className="flex flex-col items-center justify-center z-10">
                  <span className="text-5xl font-['Tilt_Warp'] text-gray-800">{fmt(segundosRestantes)}</span>
                  <div className="flex items-center gap-1 text-emerald-400 mt-1">
                    <Timer size={13} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Restante</span>
                  </div>
                </div>
              </div>

              {/* Animación de respiración */}
              <div className="flex flex-col items-center gap-5">
                <div className="relative flex items-center justify-center w-36 h-36">
                  <motion.div
                    key={`bg-${faseRespiracion}`}
                    animate={{ scale: esExpansion ? 1.4 : 0.8, opacity: 0.15 }}
                    transition={{ duration: duracionFase, ease: 'easeInOut' }}
                    className="absolute w-full h-full rounded-full"
                    style={{ backgroundColor: COLOR }} />
                  <motion.div
                    key={`flower-${faseRespiracion}`}
                    animate={{ scale: esExpansion ? 1 : 0.7 }}
                    transition={{ duration: duracionFase, ease: 'easeInOut' }}
                    className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${COLOR}, ${COLOR2})` }}>
                    <Flower2 size={32} className="text-white/80" />
                  </motion.div>
                </div>
                <div className="text-center">
                  <motion.h3 key={faseRespiracion} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-['Tilt_Warp'] tracking-wide min-w-[200px]" style={{ color: COLOR }}>
                    {faseRespiracion}
                  </motion.h3>
                  <p className="text-emerald-400 text-sm font-medium mt-1">
                    {faseRespiracion === 'Inhala' && 'Llena tus pulmones'}
                    {faseRespiracion === 'Mantén' && 'Sostén el aire'}
                    {faseRespiracion === 'Exhala' && 'Suelta suavemente'}
                    {faseRespiracion === 'Vacío' && 'Mantén el vacío'}
                  </p>
                </div>
              </div>

              {/* Control de Volumen (solo si hay música activa) */}
              {ajustes.musica && (
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-md border border-emerald-100/50 w-full max-w-xs">
                  <Volume2 size={16} className="text-emerald-500 shrink-0" />
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={volumenMusica}
                    onChange={(e) => setVolumenMusica(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-emerald-100 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${COLOR} 0%, ${COLOR} ${volumenMusica * 100}%, #d1fae5 ${volumenMusica * 100}%, #d1fae5 100%)`
                    }}
                  />
                  <span className="text-[10px] font-bold text-emerald-500 min-w-[28px] text-right">{Math.round(volumenMusica * 100)}%</span>
                </div>
              )}

              {/* Controles */}
              <div className="flex items-center gap-5">
                <button onClick={manejarPlayPause}
                  className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-gray-600 hover:text-emerald-600 transition-colors">
                  {estaPausado ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                </button>
                <button onClick={salir}
                  className="px-8 py-4 bg-white text-red-400 rounded-2xl shadow-lg font-bold flex items-center gap-2 hover:bg-red-50 transition-colors text-sm">
                  <X size={18} /> Salir
                </button>
              </div>
            </motion.div>
          )}

          {/* ====== SESIÓN FINALIZADA ====== */}
          {sesionFinalizada && (
            <motion.div key="final" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white rounded-[48px] shadow-2xl p-12 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={52} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-['Tilt_Warp'] text-gray-800 mb-3">¡Sesión Completada!</h2>
              <p className="text-gray-400 text-sm mb-8">Has dedicado {tiempoSeleccionado} minutos a tu bienestar. Tu mente te lo agradecerá.</p>
              <button onClick={salir}
                className="w-full py-5 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl text-sm"
                style={{ background: `linear-gradient(135deg, ${COLOR} 0%, ${COLOR2} 100%)` }}>
                Volver al Inicio
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}

export default PaginaMeditacion;
