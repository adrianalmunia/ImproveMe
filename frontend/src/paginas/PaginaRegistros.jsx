import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { useIdioma } from '../contextos/ContextoIdioma';
import { obtenerEntradasPorMes, buscarEntradas, URL_BASE_ARCHIVOS } from '../servicios/servicioAPI';
import { ReproductorAudio } from '../componentes/ReproductorAudio';
import logoCompleto from '../assets/logo_completo.png';

// Importar imágenes de estados de ánimo
import moodFatal from '../assets/estados_animo/fatal.png';
import moodMal from '../assets/estados_animo/mal.png';
import moodDecente from '../assets/estados_animo/decente.png';
import moodBien from '../assets/estados_animo/bien.png';
import moodGenial from '../assets/estados_animo/genial.png';

const humores = [
  { id: 1, imagen: moodFatal, color: '#EF4444', label: 'Fatal', labelEn: 'Fatal' },
  { id: 2, imagen: moodMal, color: '#F97316', label: 'Mal', labelEn: 'Bad' },
  { id: 3, imagen: moodDecente, color: '#FACC15', label: 'Decente', labelEn: 'Decent' },
  { id: 4, imagen: moodBien, color: '#90BE6D', label: 'Bien', labelEn: 'Good' },
  { id: 5, imagen: moodGenial, color: '#4D908E', label: 'Genial', labelEn: 'Great' },
];

const mesesEs = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

const mesesEn = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

// Componente Tarjeta 3D
const TarjetaMiniatura = ({ entrada, onClick }) => {
  const { idioma, t } = useIdioma();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const xSpring = useSpring(mouseX, springConfig);
  const ySpring = useSpring(mouseY, springConfig);

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-6, 6]);

  const manejarMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    const yPos = e.clientY - rect.top;
    
    mouseX.set((xPos / rect.width) - 0.5);
    mouseY.set((yPos / rect.height) - 0.5);
  };

  const manejarMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const humorInfo = humores.find(h => h.id === entrada.puntuacion_animo) || humores[2];
  const fechaObj = new Date(entrada.fecha);
  const fechaStr = fechaObj.toLocaleDateString(idioma === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  // Extraer un fragmento del texto
  const extracto = entrada.contenido_texto && entrada.contenido_texto.length > 100 
    ? entrada.contenido_texto.substring(0, 100) + '...' 
    : entrada.contenido_texto || (idioma === 'es' ? "Sin contenido escrito para este día." : "No written content for this day.");

  return (
    <div style={{ perspective: 1200 }} className="relative">
      <motion.button 
        onClick={() => onClick(entrada)}
        onMouseMove={manejarMouseMove}
        onMouseLeave={manejarMouseLeave}
        whileHover={{ scale: 1.02 }}
        aria-label={idioma === 'es' ? `Ver registro del ${fechaStr}` : `View record for ${fechaStr}`}
        className="w-full h-[400px] rounded-[40px] shadow-xl p-[3px] flex flex-col items-center justify-center text-center relative z-10 outline-none focus:ring-4 focus:ring-[#4F99CC] focus:ring-offset-4 dark:focus:ring-offset-gray-900 group"
        style={{ 
          background: 'linear-gradient(180deg, #4F99CC 0%, #C6A55E 100%)',
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
          willChange: "transform",
          backfaceVisibility: "hidden"
        }}
      >
        <div className="w-full h-full bg-white dark:bg-gray-800 rounded-[37px] relative overflow-hidden flex flex-col items-center transition-colors duration-300">
          <div className="absolute inset-0 bg-gradient-to-b from-white dark:from-gray-800 to-[#4F99CC]/5 dark:to-[#4F99CC]/10 pointer-events-none transition-colors duration-300"></div>
          
          <div className="mb-2 mt-4 relative z-10 shrink-0 text-center flex flex-col items-center" style={{ transform: "translateZ(40px)" }}>
            <p className="text-[10px] font-black text-[#4F99CC] uppercase tracking-[0.1em]">{fechaStr}</p>
            <div className="w-8 h-0.5 bg-[#4F99CC]/30 mx-auto mt-1 rounded-full mb-2"></div>
            
            <div className="bg-[#4F99CC]/5 border border-[#4F99CC]/10 px-2 py-0.5 rounded-full shadow-sm">
              <p className="text-[9px] font-bold text-[#4F99CC] leading-none">
                {entrada.horas_sueno >= 10 ? '+10' : entrada.horas_sueno}h {idioma === 'es' ? 'de sueño' : 'sleep'}
              </p>
            </div>
          </div>

          {/* Previsualización de Imagen si existe */}
          {entrada.archivos_multimedia?.find(a => a.tipo_archivo === 'imagen') ? (
            <div className="w-[90%] h-32 mt-2 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 relative z-10 shrink-0 transition-colors duration-300" style={{ transform: "translateZ(20px)" }}>
              <img 
                src={`${URL_BASE_ARCHIVOS}${entrada.archivos_multimedia.find(a => a.tipo_archivo === 'imagen').url_archivo}`} 
                alt="Miniatura" 
                className="w-full h-full object-cover" 
              />
            </div>
          ) : null}

          {/* Mostrar reproductor de audio si existe */}
          {entrada.archivos_multimedia?.find(a => a.tipo_archivo === 'audio') && (
            <div className="w-full flex justify-center mt-3 z-20 shrink-0" style={{ transform: "translateZ(30px)" }} onClick={(e) => e.stopPropagation()}>
              <div className="scale-[0.85] origin-top w-[115%] flex justify-center -mb-2">
                <ReproductorAudio src={`${URL_BASE_ARCHIVOS}${entrada.archivos_multimedia.find(a => a.tipo_archivo === 'audio').url_archivo}`} />
              </div>
            </div>
          )}

          <div className="flex-1 w-full flex items-center justify-center mt-2 px-6 overflow-hidden" style={{ transform: "translateZ(10px)" }}>
            <p className="text-xs font-['Tilt_Warp'] text-gray-700 dark:text-gray-300 leading-relaxed text-center w-full break-words line-clamp-6 transition-colors duration-300">
              {extracto}
            </p>
          </div>

          <div className="w-16 h-1 mt-4 bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] rounded-full shrink-0 mb-6"></div>
        </div>

        {/* Icono Flotante de Humor (FUERA del div overflow-hidden) */}
        <motion.div 
          className="absolute -top-6 -left-6 w-20 h-20 bg-white dark:bg-gray-800 rounded-full shadow-md border-[3px] flex items-center justify-center overflow-hidden z-20 transition-colors duration-300"
          style={{ 
            borderColor: humorInfo.color,
            backfaceVisibility: "hidden"
          }}
        >
          <img src={humorInfo.imagen} alt="Humor" className="w-full h-full object-cover" />
        </motion.div>
      </motion.button>
    </div>
  );
};

export function PaginaRegistros() {
  const { usuario, token } = useAutenticacion();
  const { t, idioma } = useIdioma();
  const [fechaFiltro, setFechaFiltro] = useState(new Date());
  const [entradas, setEntradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [entradaSeleccionada, setEntradaSeleccionada] = useState(null);
  const [imagenExpandida, setImagenExpandida] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const inputBusquedaRef = useRef(null);

  // Debounce para la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setBusquedaDebounced(busqueda);
    }, 400);
    return () => clearTimeout(handler);
  }, [busqueda]);

  // Atajos de teclado para Registros
  useEffect(() => {
    const manejarTeclas = (e) => {
      // Ctrl + F para buscar
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputBusquedaRef.current?.focus();
      }
      // Esc para cerrar modales
      if (e.key === 'Escape') {
        if (imagenExpandida) setImagenExpandida(null);
        else if (entradaSeleccionada) setEntradaSeleccionada(null);
      }
    };
    window.addEventListener('keydown', manejarTeclas);
    return () => window.removeEventListener('keydown', manejarTeclas);
  }, [imagenExpandida, entradaSeleccionada]);

  useEffect(() => {
    async function cargarEntradas() {
      if (!usuario?.id || !token) return;
      setCargando(true);
      try {
        let res;
        if (busquedaDebounced.trim()) {
          // Si hay búsqueda, usamos el endpoint global
          res = await buscarEntradas(usuario.id, busquedaDebounced, token);
        } else {
          // Si no hay búsqueda, filtramos por mes y año actual
          res = await obtenerEntradasPorMes(usuario.id, fechaFiltro.getMonth() + 1, fechaFiltro.getFullYear(), token);
        }
        setEntradas(res);
      } catch (error) {
        console.error("Error cargando historial:", error);
      } finally {
        setCargando(false);
      }
    }
    cargarEntradas();
  }, [usuario, token, fechaFiltro, busquedaDebounced]);

  const cambiarMes = (incremento) => {
    // Seteamos el día 1 antes de cambiar de mes para evitar saltos por meses de distinta duración
    const nuevaFecha = new Date(fechaFiltro.getFullYear(), fechaFiltro.getMonth() + incremento, 1);
    setFechaFiltro(nuevaFecha);
  };

  const meses = idioma === 'es' ? mesesEs : mesesEn;
  const nombreMesAnio = `${meses[fechaFiltro.getMonth()]} ${fechaFiltro.getFullYear()}`;

  // Ya no filtramos localmente, lo hace el backend globalmente si hay búsqueda
  const entradasFiltradas = entradas;

  return (
    <main className="flex-1 relative overflow-y-auto h-full p-8 lg:p-12 pb-24 font-['Inter'] dark:bg-gray-900 transition-colors duration-300">
      
      {/* HEADER / LOGO COMPLETO */}
      <div className="flex flex-col items-center justify-center mb-8">
        <motion.img 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          src={logoCompleto} 
          alt="ImproveMe Logo" 
          className="h-16 lg:h-20 object-contain" 
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* SELECTOR DE MES */}
          <div className="flex justify-center items-center gap-6 mb-12">
          <button 
            onClick={() => cambiarMes(-1)}
            className="w-10 h-10 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#4F99CC] dark:hover:bg-[#4F99CC] hover:text-white rounded-full flex items-center justify-center transition-colors text-xl shadow-sm"
          >
            &#9664;
          </button>
          <div className="relative bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors px-8 py-2.5 rounded-full min-w-[200px] text-center shadow-inner cursor-pointer flex items-center justify-center overflow-hidden duration-300">
            <h2 className="text-xl font-['Tilt_Warp'] text-gray-800 dark:text-white tracking-wider relative z-10 pointer-events-none transition-colors duration-300">{nombreMesAnio}</h2>
            <input 
              type="month" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              style={{ colorScheme: 'light' }}
              value={`${fechaFiltro.getFullYear()}-${(fechaFiltro.getMonth() + 1).toString().padStart(2, '0')}`}
              onChange={(e) => {
                if (e.target.value) {
                  const [year, month] = e.target.value.split('-');
                  setFechaFiltro(new Date(parseInt(year), parseInt(month) - 1, 1));
                }
              }}
              onClick={(e) => {
                // Algunos navegadores requieren showPicker() o un trigger manual
                if (e.target.showPicker) {
                  try { e.target.showPicker(); } catch(err) { console.log(err); }
                }
              }}
            />
          </div>
          <button 
            onClick={() => cambiarMes(1)}
            className="w-10 h-10 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#4F99CC] dark:hover:bg-[#4F99CC] hover:text-white rounded-full flex items-center justify-center transition-colors text-xl shadow-sm"
          >
            &#9654;
          </button>
        </div>

        {/* BUSCADOR */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <input
              ref={inputBusquedaRef}
              type="text"
              placeholder={idioma === 'es' ? 'Buscar en el historial... (Ctrl + F)' : 'Search history... (Ctrl + F)'}
              className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-full px-6 py-3 text-sm outline-none focus:border-[#4F99CC] transition-all shadow-sm dark:text-white"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* CONTENIDO (GRID O VACÍO) */}
        {cargando ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#4F99CC] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : entradasFiltradas.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500 transition-colors duration-300">
            <p className="text-xl font-['Tilt_Warp']">
              {busqueda 
                ? (idioma === 'es' ? `No se encontraron resultados para "${busqueda}"` : `No results found for "${busqueda}"`)
                : (idioma === 'es' ? `No hay registros en ${nombreMesAnio.toLowerCase()}.` : `No records in ${nombreMesAnio.toLowerCase()}.`)}
            </p>
            <p className="mt-2 text-sm">{idioma === 'es' ? 'Prueba con otros términos o cambia de mes.' : 'Try other terms or change the month.'}</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 pt-8 px-4"
          >
            {entradasFiltradas.map(entrada => (
              <TarjetaMiniatura 
                key={entrada.id} 
                entrada={entrada} 
                onClick={setEntradaSeleccionada}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* MODAL DE ENTRADA EXPANDIDA */}
      <AnimatePresence>
        {entradaSeleccionada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEntradaSeleccionada(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-12 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full"
            >
              <div 
                className="w-full h-[85vh] max-h-[700px] rounded-[55px] shadow-2xl p-[3px] flex flex-col relative"
                style={{ background: 'linear-gradient(180deg, #4F99CC 0%, #C6A55E 100%)' }}
              >
                <div className="w-full h-full bg-white dark:bg-gray-800 rounded-[52px] relative overflow-hidden flex flex-col p-8 items-center transition-colors duration-300">
                  <button 
                    onClick={() => setEntradaSeleccionada(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center transition-colors z-30"
                  >
                    ✕
                  </button>

                  <div className="mb-2 relative z-10 shrink-0 text-center">
                    <p className="text-xs font-black text-[#4F99CC] uppercase tracking-[0.2em]">
                      {new Date(entradaSeleccionada.fecha).toLocaleDateString(idioma === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
                    </p>
                    <div className="w-12 h-0.5 bg-[#4F99CC]/30 mx-auto mt-1 rounded-full"></div>
                  </div>

                  <div className="mb-4 flex items-center gap-2 bg-[#4F99CC]/10 px-4 py-1.5 rounded-full border border-[#4F99CC]/20 shrink-0">
                    <span className="text-xs font-bold text-[#4F99CC]">{entradaSeleccionada.horas_sueno >= 10 ? '+10' : entradaSeleccionada.horas_sueno}h {idioma === 'es' ? 'de sueño' : 'sleep'}</span>
                  </div>

                  {/* Mostrar Imagen si existe */}
                  {entradaSeleccionada.archivos_multimedia?.find(a => a.tipo_archivo === 'imagen') && (
                    <div className="mb-4 w-full rounded-2xl overflow-hidden shadow-sm border border-[#4F99CC]/20 shrink-0 flex justify-center">
                      <img 
                        src={`${URL_BASE_ARCHIVOS}${entradaSeleccionada.archivos_multimedia.find(a => a.tipo_archivo === 'imagen').url_archivo}`} 
                        alt="Adjunto" 
                        className="w-full h-auto object-cover max-h-40 cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagenExpandida(`${URL_BASE_ARCHIVOS}${entradaSeleccionada.archivos_multimedia.find(a => a.tipo_archivo === 'imagen').url_archivo}`);
                        }}
                      />
                    </div>
                  )}

                  {/* Mostrar Audio si existe (Reproductor Custom) */}
                  {entradaSeleccionada.archivos_multimedia?.find(a => a.tipo_archivo === 'audio') && (
                    <div className="mb-4 w-full flex justify-center">
                      <ReproductorAudio src={`${URL_BASE_ARCHIVOS}${entradaSeleccionada.archivos_multimedia.find(a => a.tipo_archivo === 'audio').url_archivo}`} />
                    </div>
                  )}

                  <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col items-center justify-start py-4 px-2">
                    <p className="text-xl font-['Tilt_Warp'] text-gray-800 dark:text-white leading-snug text-center w-full break-words transition-colors duration-300">
                      {entradaSeleccionada.contenido_texto || (idioma === 'es' ? "Sin contenido..." : "No content...")}
                    </p>
                  </div>
                </div>

                {/* Icono Flotante en el Modal */}
                <div 
                  className="absolute -top-8 -left-8 w-24 h-24 bg-white dark:bg-gray-800 rounded-full shadow-xl border-4 flex items-center justify-center overflow-hidden z-20 transition-colors duration-300"
                  style={{ borderColor: (humores.find(h => h.id === entradaSeleccionada.puntuacion_animo) || humores[2]).color }}
                >
                  <img src={(humores.find(h => h.id === entradaSeleccionada.puntuacion_animo) || humores[2]).imagen} alt="Humor" className="w-full h-full object-cover" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE IMAGEN EXPANDIDA (Igual que en PaginaDiario) */}
      <AnimatePresence>
        {imagenExpandida && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImagenExpandida(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full"
            >
              <div
                className="p-2 rounded-[32px] shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #4F99CC 0%, #C6A55E 100%)' }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden relative flex justify-center transition-colors duration-300">
                  <button
                    onClick={() => setImagenExpandida(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-10"
                  >
                    ✕
                  </button>
                  <img src={imagenExpandida} alt="Imagen expandida" className="w-full h-auto max-h-[85vh] object-contain" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default PaginaRegistros;
