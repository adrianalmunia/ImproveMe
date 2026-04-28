import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { obtenerEntradasPorMes } from '../servicios/servicioAPI';
import { ReproductorAudio } from '../componentes/ReproductorAudio';
import logoCompleto from '../assets/logo_completo.png';

// Importar imágenes de estados de ánimo
import moodFatal from '../assets/estados_animo/fatal.png';
import moodMal from '../assets/estados_animo/mal.png';
import moodDecente from '../assets/estados_animo/decente.png';
import moodBien from '../assets/estados_animo/bien.png';
import moodGenial from '../assets/estados_animo/genial.png';

const humores = [
  { id: 1, imagen: moodFatal, color: '#EF4444', label: 'Fatal' },
  { id: 2, imagen: moodMal, color: '#F97316', label: 'Mal' },
  { id: 3, imagen: moodDecente, color: '#FACC15', label: 'Decente' },
  { id: 4, imagen: moodBien, color: '#90BE6D', label: 'Bien' },
  { id: 5, imagen: moodGenial, color: '#4D908E', label: 'Genial' },
];

const meses = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

// Componente Tarjeta 3D
const TarjetaMiniatura = ({ entrada, onClick }) => {
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
  const fechaStr = `${fechaObj.getUTCDate()} de ${meses[fechaObj.getUTCMonth()].charAt(0).toUpperCase() + meses[fechaObj.getUTCMonth()].slice(1).toLowerCase()} de ${fechaObj.getUTCFullYear()}`;

  // Extraer un fragmento del texto
  const extracto = entrada.contenido_texto && entrada.contenido_texto.length > 100 
    ? entrada.contenido_texto.substring(0, 100) + '...' 
    : entrada.contenido_texto || "Sin contenido escrito para este día.";

  return (
    <div className="relative cursor-pointer" style={{ perspective: 1200 }} onClick={() => onClick(entrada)}>
      <motion.div 
        onMouseMove={manejarMouseMove}
        onMouseLeave={manejarMouseLeave}
        whileHover={{ scale: 1.02 }}
        className="w-full h-[400px] rounded-[40px] shadow-xl p-[3px] flex flex-col items-center justify-center text-center relative z-10"
        style={{ 
          background: 'linear-gradient(180deg, #4F99CC 0%, #C6A55E 100%)',
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
          backfaceVisibility: "hidden"
        }}
      >
        <div className="w-full h-full bg-white rounded-[37px] relative overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-[#4F99CC]/5 pointer-events-none"></div>
          
          <div className="mb-2 mt-4 relative z-10 shrink-0 text-center flex flex-col items-center" style={{ transform: "translateZ(20px)" }}>
            <p className="text-[10px] font-black text-[#4F99CC] uppercase tracking-[0.1em]">{fechaStr}</p>
            <div className="w-8 h-0.5 bg-[#4F99CC]/30 mx-auto mt-1 rounded-full mb-2"></div>
            
            <div className="bg-[#4F99CC]/5 border border-[#4F99CC]/10 px-2 py-0.5 rounded-full shadow-sm">
              <p className="text-[9px] font-bold text-[#4F99CC] leading-none">
                {entrada.horas_sueno >= 10 ? '+10' : entrada.horas_sueno}h de sueño
              </p>
            </div>
          </div>

          {/* Previsualización de Imagen si existe */}
          {entrada.archivos_multimedia?.find(a => a.tipo_archivo === 'imagen') ? (
            <div className="w-full h-28 mt-2 rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative z-10 shrink-0" style={{ transform: "translateZ(10px)" }}>
              <img 
                src={`http://localhost:3000${entrada.archivos_multimedia.find(a => a.tipo_archivo === 'imagen').url_archivo}`} 
                alt="Miniatura" 
                className="w-full h-full object-cover" 
              />
            </div>
          ) : null}

          {/* Mostrar reproductor de audio si existe */}
          {entrada.archivos_multimedia?.find(a => a.tipo_archivo === 'audio') && (
            <div className="w-full flex justify-center mt-3 z-20 shrink-0" style={{ transform: "translateZ(15px)" }} onClick={(e) => e.stopPropagation()}>
              <div className="scale-[0.85] origin-top w-[115%] flex justify-center -mb-2">
                <ReproductorAudio src={`http://localhost:3000${entrada.archivos_multimedia.find(a => a.tipo_archivo === 'audio').url_archivo}`} />
              </div>
            </div>
          )}

          <div className="flex-1 w-full flex items-center justify-center mt-2 px-2 overflow-hidden" style={{ transform: "translateZ(0)" }}>
            <p className="text-xs font-['Tilt_Warp'] text-gray-700 leading-relaxed text-center w-full break-words line-clamp-6">
              {extracto}
            </p>
          </div>

          <div className="w-16 h-1 mt-4 bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] rounded-full shrink-0 mb-4"></div>
        </div>

        {/* Icono Flotante de Humor */}
        <motion.div 
          className="absolute -top-6 -left-6 w-20 h-20 bg-white rounded-full shadow-lg border-[3px] flex items-center justify-center overflow-hidden z-20"
          style={{ 
            borderColor: humorInfo.color,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden"
          }}
        >
          <img src={humorInfo.imagen} alt="Humor" className="w-full h-full object-cover" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export function PaginaRegistros() {
  const { usuario } = useAutenticacion();
  const [fechaFiltro, setFechaFiltro] = useState(new Date());
  const [entradas, setEntradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [entradaSeleccionada, setEntradaSeleccionada] = useState(null);
  const [imagenExpandida, setImagenExpandida] = useState(null);

  useEffect(() => {
    async function cargarEntradas() {
      if (usuario?.id) {
        setCargando(true);
        try {
          const data = await obtenerEntradasPorMes(usuario.id, fechaFiltro.getMonth() + 1, fechaFiltro.getFullYear());
          setEntradas(data);
        } catch (error) {
          console.error("Error al cargar registros:", error);
        } finally {
          setCargando(false);
        }
      }
    }
    cargarEntradas();
  }, [usuario, fechaFiltro]);

  const cambiarMes = (incremento) => {
    const nuevaFecha = new Date(fechaFiltro);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + incremento);
    setFechaFiltro(nuevaFecha);
  };

  const nombreMesAnio = `${meses[fechaFiltro.getMonth()]} ${fechaFiltro.getFullYear()}`;

  return (
    <main className="flex-1 relative overflow-y-auto h-full p-8 lg:p-12 pb-24 font-['Inter']">
      
      {/* HEADER / LOGO COMPLETO */}
      <div className="flex justify-center mb-8">
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
            className="w-10 h-10 bg-gray-200 text-gray-600 hover:bg-[#4F99CC] hover:text-white rounded-full flex items-center justify-center transition-colors text-xl shadow-sm"
          >
            &#9664;
          </button>
          <div className="relative bg-gray-200 hover:bg-gray-300 transition-colors px-8 py-2.5 rounded-full min-w-[200px] text-center shadow-inner cursor-pointer flex items-center justify-center overflow-hidden">
            <h2 className="text-xl font-['Tilt_Warp'] text-gray-800 tracking-wider relative z-10 pointer-events-none">{nombreMesAnio}</h2>
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
            className="w-10 h-10 bg-gray-200 text-gray-600 hover:bg-[#4F99CC] hover:text-white rounded-full flex items-center justify-center transition-colors text-xl shadow-sm"
          >
            &#9654;
          </button>
        </div>

        {/* CONTENIDO (GRID O VACÍO) */}
        {cargando ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#4F99CC] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : entradas.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl font-['Tilt_Warp']">No hay registros en {nombreMesAnio.toLowerCase()}.</p>
            <p className="mt-2 text-sm">Empieza a escribir en tu diario para verlos aquí.</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 pt-8 px-4"
          >
            {entradas.map(entrada => (
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
                <div className="w-full h-full bg-white rounded-[52px] relative overflow-hidden flex flex-col p-8 items-center">
                  <button 
                    onClick={() => setEntradaSeleccionada(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors z-30"
                  >
                    ✕
                  </button>

                  <div className="mb-2 relative z-10 shrink-0 text-center">
                    <p className="text-xs font-black text-[#4F99CC] uppercase tracking-[0.2em]">
                      {new Date(entradaSeleccionada.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
                    </p>
                    <div className="w-12 h-0.5 bg-[#4F99CC]/30 mx-auto mt-1 rounded-full"></div>
                  </div>

                  <div className="mb-4 flex items-center gap-2 bg-[#4F99CC]/10 px-4 py-1.5 rounded-full border border-[#4F99CC]/20 shrink-0">
                    <span className="text-xs font-bold text-[#4F99CC]">{entradaSeleccionada.horas_sueno >= 10 ? '+10' : entradaSeleccionada.horas_sueno}h de sueño</span>
                  </div>

                  {/* Mostrar Imagen si existe */}
                  {entradaSeleccionada.archivos_multimedia?.find(a => a.tipo_archivo === 'imagen') && (
                    <div className="mb-4 w-full rounded-2xl overflow-hidden shadow-sm border border-[#4F99CC]/20 shrink-0 flex justify-center">
                      <img 
                        src={`http://localhost:3000${entradaSeleccionada.archivos_multimedia.find(a => a.tipo_archivo === 'imagen').url_archivo}`} 
                        alt="Adjunto" 
                        className="w-full h-auto object-cover max-h-40 cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagenExpandida(`http://localhost:3000${entradaSeleccionada.archivos_multimedia.find(a => a.tipo_archivo === 'imagen').url_archivo}`);
                        }}
                      />
                    </div>
                  )}

                  {/* Mostrar Audio si existe (Reproductor Custom) */}
                  {entradaSeleccionada.archivos_multimedia?.find(a => a.tipo_archivo === 'audio') && (
                    <div className="mb-4 w-full flex justify-center">
                      <ReproductorAudio src={`http://localhost:3000${entradaSeleccionada.archivos_multimedia.find(a => a.tipo_archivo === 'audio').url_archivo}`} />
                    </div>
                  )}

                  <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col items-center justify-start py-4 px-2">
                    <p className="text-xl font-['Tilt_Warp'] text-gray-800 leading-snug text-center w-full break-words">
                      {entradaSeleccionada.contenido_texto || "Sin contenido..."}
                    </p>
                  </div>
                </div>

                {/* Icono Flotante en el Modal */}
                <div 
                  className="absolute -top-8 -left-8 w-24 h-24 bg-white rounded-full shadow-xl border-4 flex items-center justify-center overflow-hidden z-20"
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
                <div className="bg-white rounded-[24px] overflow-hidden relative flex justify-center">
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
