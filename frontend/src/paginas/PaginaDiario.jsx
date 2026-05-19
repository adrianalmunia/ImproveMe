// ================================================================================
// PÁGINA: REGISTRO DIARIO (JOURNALING)
// ================================================================================
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { useIdioma } from '../contextos/ContextoIdioma';
import { guardarEntradaDiaria, obtenerEntradaHoy, obtenerUrlArchivo } from '../servicios/servicioAPI';
import logoImproveMe from '../assets/logo_improveme.png';
import logoCompleto from '../assets/logo_completo.png';
import { PenLine, Library, BarChart2, ListTodo, Trophy, Calendar, User, Flower2 } from 'lucide-react';

// Importar imágenes de estados de ánimo
import moodFatal from '../assets/estados_animo/fatal.png';
import moodMal from '../assets/estados_animo/mal.png';
import moodDecente from '../assets/estados_animo/decente.png';
import moodBien from '../assets/estados_animo/bien.png';
import moodGenial from '../assets/estados_animo/genial.png';



export function PaginaDiario() {
  const { usuario, token, actualizarUsuario } = useAutenticacion();
  const { idioma, t } = useIdioma();
  const [humor, setHumor] = useState(3); // 1-5
  const [sueno, setSueno] = useState(8); // Horas de sueño (0-16)
  const [texto, setTexto] = useState('');
  const [imagen, setImagen] = useState(null); // URL local para preview o URL del backend
  const [audio, setAudio] = useState(null); // URL local para preview o URL del backend
  const [archivoImagen, setArchivoImagen] = useState(null); // Objeto File real
  const [archivoAudio, setArchivoAudio] = useState(null); // Objeto File real
  const fecha = new Date().toLocaleDateString(idioma === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const [mensajeStatus, setMensajeStatus] = useState({ texto: '', tipo: '' }); // { texto, tipo: 'exito' | 'error' }
  const [estaGuardando, setEstaGuardando] = useState(false);

  // Estados para nuevas funcionalidades
  const [estaGrabando, setEstaGrabando] = useState(false);
  const [imagenExpandida, setImagenExpandida] = useState(false);
  
  // Estado para animaciones de XP flotante
  const [notificacionesXP, setNotificacionesXP] = useState([]);

  // Refs
  const inputImagenRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const trozosAudioRef = useRef([]);
  const reproductorAudioRef = useRef(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progresoAudio, setProgresoAudio] = useState(0);
  const [duracionAudio, setDuracionAudio] = useState(0);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [velocidadAudio, setVelocidadAudio] = useState(1);

  // Efecto 3D interactivo para la tarjeta
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const xSpring = useSpring(mouseX, springConfig);
  const ySpring = useSpring(mouseY, springConfig);

  // Rotaciones máximas de 6 grados para un efecto más sutil y menos mareante
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-6, 6]);

  const manejarMouseMoveTarjeta = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    const yPos = e.clientY - rect.top;

    mouseX.set((xPos / rect.width) - 0.5);
    mouseY.set((yPos / rect.height) - 0.5);
  };

  const manejarMouseLeaveTarjeta = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Cargar datos si ya existen para hoy (priorizando borrador local si es más reciente o existe)
  useEffect(() => {
    async function cargarEntrada() {
      if (!usuario?.id) return;

      const borradorKey = `diario_borrador_${usuario.id}_${new Date().toDateString()}`;
      const borradorGuardado = localStorage.getItem(borradorKey);
      let datosParaCargar = null;

      try {
        // 1. Intentar cargar de la API
        const entradaAPI = await obtenerEntradaHoy(usuario.id, token);
        if (entradaAPI) {
          datosParaCargar = {
            humor: entradaAPI.puntuacion_animo || 3,
            sueno: entradaAPI.horas_sueno ? parseFloat(entradaAPI.horas_sueno) : 8,
            texto: entradaAPI.contenido_texto || '',
            archivos: entradaAPI.archivos_multimedia || []
          };
        }

        // 2. Si hay un borrador local, podríamos preguntar o simplemente fusionar.
        // Para esta mejora, vamos a cargar el borrador si existe, ya que el usuario
        // quiere que "no se pierda lo que ha escrito" entre pestañas.
        if (borradorGuardado) {
          const borrador = JSON.parse(borradorGuardado);
          datosParaCargar = {
            ...datosParaCargar,
            ...borrador
          };
        }

        // 3. Aplicar los datos al estado
        if (datosParaCargar) {
          setHumor(datosParaCargar.humor);
          setSueno(datosParaCargar.sueno);
          setTexto(datosParaCargar.texto);

          if (datosParaCargar.archivos) {
            datosParaCargar.archivos.forEach(archivo => {
              const urlCompleta = obtenerUrlArchivo(archivo.url_archivo);
              if (archivo.tipo_archivo === 'imagen') setImagen(urlCompleta);
              if (archivo.tipo_archivo === 'audio') setAudio(urlCompleta);
            });
          }
        }
      } catch (error) {
        console.error("Error al cargar entrada:", error);
      }
    }
    cargarEntrada();
  }, [usuario]);

  // Guardar borrador automáticamente cuando cambian los campos clave
  useEffect(() => {
    if (!usuario?.id) return;

    const borradorKey = `diario_borrador_${usuario.id}_${new Date().toDateString()}`;
    const datosBorrador = { humor, sueno, texto };
    
    // Solo guardamos si hay algo que valga la pena guardar (para no ensuciar localStorage)
    if (texto.trim() !== '' || humor !== 3 || sueno !== 8) {
      localStorage.setItem(borradorKey, JSON.stringify(datosBorrador));
    }
  }, [humor, sueno, texto, usuario]);

  async function manejarGuardar(e) {
    if (!usuario?.id) return;

    // Guardar coordenadas para la animación de XP
    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;
    if (e && e.clientX) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setEstaGuardando(true);
    setMensajeStatus({ texto: '', tipo: '' });

    try {
      const formData = new FormData();
      formData.append('usuario_id', usuario.id);
      formData.append('puntuacion_animo', humor);
      formData.append('horas_sueno', sueno);
      formData.append('contenido_texto', texto);

      if (archivoImagen) formData.append('imagen', archivoImagen);
      if (archivoAudio) formData.append('audio', archivoAudio);
      
      // Enviar señales de borrado si el usuario eliminó el archivo en la UI
      if (!imagen) formData.append('borrar_imagen', 'true');
      if (!audio) formData.append('borrar_audio', 'true');
      
      const respuesta = await guardarEntradaDiaria(formData, token);

      // Limpiar borrador al guardar con éxito en el servidor
      const borradorKey = `diario_borrador_${usuario.id}_${new Date().toDateString()}`;
      localStorage.removeItem(borradorKey);

      if (respuesta && respuesta.xpGanada > 0) {
        setMensajeStatus({ texto: `¡Entrada guardada! +${respuesta.xpGanada} XP`, tipo: 'exito' });
      } else {
        setMensajeStatus({ texto: 'Entrada actualizada con éxito', tipo: 'exito' });
      }
      
      setArchivoImagen(null);
      setArchivoAudio(null);
      // Limpiar mensaje tras 4 segundos para que dé tiempo a leerlo
      setTimeout(() => setMensajeStatus({ texto: '', tipo: '' }), 4000);

      // GANAR XP (Sincronizado con el backend)
      if (respuesta && respuesta.xpGanada > 0) {
        const xpGanada = respuesta.xpGanada;
        actualizarUsuario({ puntos_experiencia: respuesta.nuevoTotalXP });
        
        const idNotif = Date.now();
        setNotificacionesXP(prev => [...prev, { id: idNotif, x: clientX, y: clientY - 50, cantidad: xpGanada }]);
        setTimeout(() => {
          setNotificacionesXP(prev => prev.filter(n => n.id !== idNotif));
        }, 1500);
      }

    } catch (error) {
      setMensajeStatus({ texto: 'Error al guardar la entrada', tipo: 'error' });
    } finally {
      setEstaGuardando(false);
    }
  }

  // Atajos de teclado para el Diario
  useEffect(() => {
    const manejarTeclas = (e) => {
      // Ctrl + S / Cmd + S para guardar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        manejarGuardar();
      }
      // Esc para cerrar modal de imagen
      if (e.key === 'Escape') {
        setImagenExpandida(false);
      }
    };
    window.addEventListener('keydown', manejarTeclas);
    return () => window.removeEventListener('keydown', manejarTeclas);
  }, [texto, humor, sueno, archivoImagen, archivoAudio, imagen, token, usuario]);

  // Manejador de imagen
  const manejarCambioImagen = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoImagen(file);
      setImagen(URL.createObjectURL(file));
    }
  };

  // Controladores del reproductor de audio personalizado
  const toggleReproduccion = () => {
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

  const alternarVelocidad = () => {
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


  // Manejadores de grabación de audio
  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      trozosAudioRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          trozosAudioRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blobAudio = new Blob(trozosAudioRef.current, { type: 'audio/webm' });
        const file = new File([blobAudio], 'grabacion.webm', { type: 'audio/webm' });
        setArchivoAudio(file);
        setAudio(URL.createObjectURL(blobAudio));
      };

      mediaRecorder.start();
      setEstaGrabando(true);
    } catch (err) {
      console.error("Error al acceder al micrófono:", err);
      alert("No se pudo acceder al micrófono. Por favor, revisa los permisos.");
    }
  };

  const detenerGrabacion = () => {
    if (mediaRecorderRef.current && estaGrabando) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setEstaGrabando(false);
    }
  };

  const manejarAudioClick = () => {
    if (estaGrabando) {
      detenerGrabacion();
    } else {
      iniciarGrabacion();
    }
  };

  const eliminarImagen = (e) => {
    e.stopPropagation();
    setImagen(null);
    setArchivoImagen(null);
  };

  const eliminarAudio = (e) => {
    e.stopPropagation();
    setAudio(null);
    setArchivoAudio(null);
  };

  const humores = [
    { id: 1, imagen: moodFatal, color: '#EF4444', label: idioma === 'es' ? 'Fatal' : 'Fatal' },
    { id: 2, imagen: moodMal, color: '#F97316', label: idioma === 'es' ? 'Mal' : 'Bad' },
    { id: 3, imagen: moodDecente, color: '#FACC15', label: idioma === 'es' ? 'Decente' : 'Decent' },
    { id: 4, imagen: moodBien, color: '#90BE6D', label: idioma === 'es' ? 'Bien' : 'Good' },
    { id: 5, imagen: moodGenial, color: '#4D908E', label: idioma === 'es' ? 'Genial' : 'Great' },
  ];

  return (
    <>
      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 relative overflow-y-auto h-full p-8 lg:p-12 pb-24">

        {/* HEADER / LOGO COMPLETO */}
        <div className="flex justify-center mb-12">
          <motion.img
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            src={logoCompleto}
            alt="ImproveMe Logo"
            className="h-16 lg:h-20 object-contain"
          />
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* LADO IZQUIERDO: FORMULARIO */}
          <div className="lg:col-span-7 space-y-8">

            {/* Título y Fecha */}
            <div>
              <h2 className="text-3xl font-['Tilt_Warp'] text-gray-800 dark:text-white tracking-tight transition-colors duration-300">{t('nav_diario')} - {fecha}</h2>
              <p className="text-md text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                {usuario?.alias ? `${idioma === 'es' ? 'Hola' : 'Hello'} ${usuario.alias}, ${t('diario_titulo').toLowerCase()}` : t('diario_titulo')}
              </p>
            </div>

            {/* Selector de Humor (Imágenes más grandes y sin punto) */}
            <div className="flex justify-around items-center py-6">
              {humores.map((h) => (
                <motion.button
                  key={h.id}
                  whileHover={{ scale: 1.15, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setHumor(h.id)}
                  aria-label={h.label}
                  aria-pressed={humor === h.id}
                  className="flex flex-col items-center gap-3 cursor-pointer group outline-none focus:ring-2 focus:ring-[#4F99CC] focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-2xl p-2"
                >
                  <div className={`relative transition-all duration-300 ${humor === h.id ? 'scale-110' : 'opacity-40 grayscale-[40%] group-hover:opacity-100 group-hover:grayscale-0'}`}>
                    <img src={h.imagen} alt={h.label} className="w-20 h-20 object-contain" />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${humor === h.id ? 'text-[#4F99CC]' : 'text-gray-400'}`}>
                    {h.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Área de Texto */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-4 uppercase tracking-widest">{t('nav_diario')}</label>
              <div className="w-full h-96 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-[40px] shadow-inner border-2 border-white dark:border-gray-700 focus-within:border-[#4F99CC] transition-all py-6 px-4">
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder={t('diario_placeholder')}
                  className="w-full h-full bg-transparent outline-none resize-none text-gray-700 dark:text-gray-200 leading-relaxed custom-scrollbar overflow-y-auto pr-4 transition-colors duration-300"
                ></textarea>
              </div>
            </div>

            {/* Slider de Sueño (Custom) */}
            <div className="space-y-4 px-4">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('diario_sueno')}</label>
                <span className="text-[#4F99CC] font-bold">{sueno >= 10 ? '+10' : sueno} {idioma === 'es' ? 'horas' : 'hours'}</span>
              </div>
              <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-visible transition-colors duration-300">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-[#4F99CC] to-[#A855F7]"
                  style={{ width: `${(sueno / 10) * 100}%` }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={sueno}
                  onChange={(e) => setSueno(parseFloat(e.target.value))}
                  aria-label={t('diario_sueno')}
                  className="absolute -top-1 w-full h-4 opacity-0 cursor-pointer z-10 focus:opacity-100 focus:accent-[#4F99CC]"
                />
                <motion.div
                  style={{ left: `${(sueno / 10) * 100}%` }}
                  className="absolute top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-[#4F99CC] pointer-events-none transition-colors duration-300"
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-4">
              <input
                type="file"
                ref={inputImagenRef}
                onChange={manejarCambioImagen}
                accept="image/*"
                className="hidden"
              />

              <button
                onClick={() => inputImagenRef.current.click()}
                className={`flex-1 relative py-3 px-6 bg-white dark:bg-gray-800 border rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors outline-none focus:ring-2 focus:ring-[#4F99CC] ${imagen ? 'border-[#4F99CC] text-[#4F99CC]' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                {imagen ? (idioma === 'es' ? 'Imagen Lista' : 'Image Ready') : (idioma === 'es' ? 'Añadir Imagen' : 'Add Image')}
                {imagen && (
                  <motion.button
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    onClick={eliminarImagen}
                    aria-label={idioma === 'es' ? 'Eliminar imagen' : 'Delete image'}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 outline-none"
                  >
                    ✕
                  </motion.button>
                )}
              </button>

              <button
                onClick={manejarAudioClick}
                className={`flex-1 relative py-3 px-6 bg-white dark:bg-gray-800 border rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-colors outline-none focus:ring-2 focus:ring-[#4F99CC] ${estaGrabando
                    ? 'border-red-500 text-red-500 animate-pulse'
                    : audio
                      ? 'border-[#4F99CC] text-[#4F99CC] hover:bg-gray-50 dark:hover:bg-gray-700'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {estaGrabando ? (idioma === 'es' ? 'Grabando...' : 'Recording...') : audio ? (idioma === 'es' ? 'Audio Listo' : 'Audio Ready') : (idioma === 'es' ? 'Grabar Audio' : 'Record Audio')}
                {audio && !estaGrabando && (
                  <motion.button
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    onClick={eliminarAudio}
                    aria-label={idioma === 'es' ? 'Eliminar audio' : 'Delete audio'}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 outline-none"
                  >
                    ✕
                  </motion.button>
                )}
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={manejarGuardar}
              disabled={estaGuardando}
              className={`w-full py-4 rounded-full font-bold shadow-xl transition-all ${estaGuardando ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900'}`}
            >
              {estaGuardando ? t('cargando') : t('guardar')}
            </motion.button>

            <AnimatePresence>
              {mensajeStatus.texto && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-center text-sm font-bold mt-4 ${mensajeStatus.tipo === 'exito' ? 'text-green-600' : 'text-red-500'}`}
                >
                  {mensajeStatus.texto}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* LADO DERECHO: PREVIEW (TARJETA) */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative" style={{ perspective: 1200 }}>
              {/* Tarjeta de Preview con Borde Degradado */}
              <motion.div
                layout
                onMouseMove={manejarMouseMoveTarjeta}
                onMouseLeave={manejarMouseLeaveTarjeta}
                className="w-[88vw] xs:w-[360px] sm:w-[420px] h-[500px] xs:h-[550px] sm:h-[600px] rounded-[36px] sm:rounded-[55px] shadow-2xl p-[3px] flex flex-col items-center justify-center text-center relative z-10 cursor-default"
                style={{
                  background: 'linear-gradient(180deg, #4F99CC 0%, #C6A55E 100%)',
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                  backfaceVisibility: "hidden"
                }}
              >
                <div className="w-full h-full bg-white dark:bg-gray-800 rounded-[33px] sm:rounded-[52px] relative overflow-hidden transition-colors duration-300">
                  {/* Degradado sutil de fondo en la tarjeta */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white dark:from-gray-800 to-[#4F99CC]/5 pointer-events-none transition-colors duration-300"></div>

                  {/* Contenedor SIN scroll general, solo en el texto */}
                  <div className="absolute inset-0 p-8 flex flex-col items-center">
                    <div className="mb-2 relative z-10 shrink-0">
                      <p className="text-xs font-black text-[#4F99CC] uppercase tracking-[0.2em]">{fecha}</p>
                      <div className="w-12 h-0.5 bg-[#4F99CC]/30 mx-auto mt-1 rounded-full"></div>
                    </div>

                    {/* Indicador de Sueño en la Tarjeta */}
                    <div className="mb-4 flex items-center gap-2 bg-[#4F99CC]/10 px-4 py-1.5 rounded-full border border-[#4F99CC]/20 shrink-0">
                      <span className="text-xs font-bold text-[#4F99CC]">{sueno >= 10 ? '+10' : sueno}{idioma === 'es' ? 'h de sueño' : 'h sleep'}</span>
                    </div>

                    {/* Vista previa de Imagen */}
                    {imagen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setImagenExpandida(true)}
                        className="mb-4 w-full rounded-2xl overflow-hidden shadow-sm border border-[#4F99CC]/20 cursor-pointer hover:opacity-90 transition-opacity shrink-0 flex justify-center"
                      >
                        <img src={imagen} alt="Adjunto" className="w-full h-auto object-cover max-h-32" />
                      </motion.div>
                    )}

                    {/* Vista previa de Audio (Reproductor Custom) */}
                    {audio && (
                      <div className="mb-4 w-full flex items-center justify-center shrink-0">
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
                            <div className="flex justify-between mt-1 text-[10px] font-bold text-[#4F99CC]">
                              <span>{formatearTiempo(tiempoActual)}</span>
                              <span>{duracionAudio > 0 ? formatearTiempo(duracionAudio) : ''}</span>
                            </div>
                          </div>

                          <button
                            onClick={alternarVelocidad}
                            className="text-xs font-bold bg-white dark:bg-gray-800 text-[#4F99CC] px-2 py-1 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 border border-[#4F99CC]/20 shrink-0 min-w-[36px] text-center transition-colors duration-300"
                          >
                            {velocidadAudio}x
                          </button>

                          <audio
                            ref={reproductorAudioRef}
                            src={audio}
                            onTimeUpdate={actualizarProgreso}
                            onLoadedMetadata={manejarMetadatosAudio}
                            onEnded={manejarFinAudio}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}

                    {/* Contenedor de Texto con Scroll Independiente */}
                    <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col items-center justify-start py-2" style={{ transform: "translateZ(0)" }}>
                      <p className="text-lg font-['Tilt_Warp'] text-gray-800 dark:text-white leading-tight text-center w-full break-words transition-colors duration-300">
                        {texto || (idioma === 'es' ? 'Aquí se muestra cómo queda la entrada...' : 'This is how your entry will look...')}
                      </p>
                    </div>

                    {/* Decoración inferior de la tarjeta */}
                    <div className="w-20 h-1 mt-4 bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] rounded-full shrink-0"></div>
                  </div>
                </div>

                {/* Icono Flotante de Humor (Movido dentro para seguir el movimiento de la tarjeta) */}
                <motion.div
                  key={humor}
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -top-6 -left-6 sm:-top-10 sm:-left-10 w-20 h-20 sm:w-32 sm:h-32 bg-white dark:bg-gray-800 rounded-full shadow-2xl border-[3px] sm:border-4 flex items-center justify-center overflow-hidden z-20 transition-colors duration-300"
                  style={{
                    borderColor: humores.find(h => h.id === humor)?.color || '#4F99CC',
                    transform: "translateZ(60px)", // Pop-out effect
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden"
                  }}
                >
                  <img
                    src={humores.find(h => h.id === humor)?.imagen}
                    alt="Humor"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>

        </div>
      </main>

      {/* MODAL DE IMAGEN EXPANDIDA */}
      <AnimatePresence>
        {imagenExpandida && imagen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImagenExpandida(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full"
            >
              {/* Contenedor con borde degradado ImproveMe */}
              <div
                className="p-2 rounded-[32px] shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #4F99CC 0%, #C6A55E 100%)' }}
              >
                <div className="bg-white rounded-[24px] overflow-hidden relative">
                  {/* Botón de cerrar */}
                  <button
                    onClick={() => setImagenExpandida(false)}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-10"
                  >
                    ✕
                  </button>
                  <img src={imagen} alt="Imagen expandida" className="w-full h-auto max-h-[85vh] object-contain" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animaciones de XP Flotante (Igual que en Hábitos) */}
      <AnimatePresence>
        {notificacionesXP.map(notif => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: notif.y, x: notif.x, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: notif.y - 150, 
              scale: [0.5, 1.5, 1.5, 1],
              rotate: [-10, 10, -10, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="fixed z-[9999] font-black text-3xl pointer-events-none flex items-center gap-2"
            style={{ 
              color: '#FACC15',
              textShadow: '0 0 20px rgba(250, 204, 21, 0.6), 0 4px 10px rgba(0,0,0,0.3)'
            }}
          >
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">+{notif.cantidad} XP</span>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              ✨
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}

export default PaginaDiario;
