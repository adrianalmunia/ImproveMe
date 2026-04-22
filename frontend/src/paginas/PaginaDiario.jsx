// ================================================================================
// PÁGINA: REGISTRO DIARIO (JOURNALING)
// ================================================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { guardarEntradaDiaria, obtenerEntradaHoy } from '../servicios/servicioAPI';
import logoImproveMe from '../assets/logo_improveme.png';
import logoCompleto from '../assets/logo_completo.png';

// Importar imágenes de estados de ánimo
import moodFatal from '../assets/estados_animo/fatal.png';
import moodMal from '../assets/estados_animo/mal.png';
import moodDecente from '../assets/estados_animo/decente.png';
import moodBien from '../assets/estados_animo/bien.png';
import moodGenial from '../assets/estados_animo/genial.png';

// Iconos simplificados para el Sidebar (puedes sustituirlos por Lucide-React o FontAwesome después)
const SidebarIcon = ({ name, active }) => (
  <motion.div
    whileHover={{ scale: 1.2, x: 5 }}
    className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer mb-4 transition-colors ${active ? 'bg-black text-white shadow-lg' : 'bg-white/50 text-gray-600 hover:bg-white'}`}
  >
    <span className="text-xl">{name}</span>
  </motion.div>
);

export function PaginaDiario() {
  const { usuario } = useAutenticacion();
  const [humor, setHumor] = useState(3); // 1-5
  const [sueno, setSueno] = useState(50);
  const [texto, setTexto] = useState('');
  const [fecha] = useState(new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }));
  const [mensajeStatus, setMensajeStatus] = useState({ texto: '', tipo: '' }); // { texto, tipo: 'exito' | 'error' }
  const [estaGuardando, setEstaGuardando] = useState(false);

  // Cargar datos si ya existen para hoy
  useEffect(() => {
    async function cargarEntrada() {
      if (usuario?.id) {
        try {
          const entrada = await obtenerEntradaHoy(usuario.id);
          if (entrada) {
            setHumor(entrada.puntuacion_animo || 3);
            setSueno(entrada.horas_sueno ? parseFloat(entrada.horas_sueno) * 10 : 50);
            setTexto(entrada.contenido_texto || '');
          }
        } catch (error) {
          console.error("Error al cargar entrada:", error);
        }
      }
    }
    cargarEntrada();
  }, [usuario]);

  async function manejarGuardar() {
    if (!usuario?.id) return;
    
    setEstaGuardando(true);
    setMensajeStatus({ texto: '', tipo: '' });

    try {
      await guardarEntradaDiaria({
        usuario_id: usuario.id,
        puntuacion_animo: humor,
        horas_sueno: (sueno / 10).toFixed(2), // Convertimos a formato Decimal(4,2)
        contenido_texto: texto
      });
      setMensajeStatus({ texto: '¡Entrada guardada con éxito!', tipo: 'exito' });
      // Limpiar mensaje tras 3 segundos
      setTimeout(() => setMensajeStatus({ texto: '', tipo: '' }), 3000);
    } catch (error) {
      setMensajeStatus({ texto: 'Error al guardar la entrada', tipo: 'error' });
    } finally {
      setEstaGuardando(false);
    }
  }

  const humores = [
    { id: 1, imagen: moodFatal, color: '#EF4444', label: 'Fatal' },
    { id: 2, imagen: moodMal, color: '#F97316', label: 'Mal' },
    { id: 3, imagen: moodDecente, color: '#FACC15', label: 'Decente' },
    { id: 4, imagen: moodBien, color: '#90BE6D', label: 'Bien' },
    { id: 5, imagen: moodGenial, color: '#4D908E', label: 'Genial' },
  ];

  return (
    <div className="h-screen bg-neutral-100 flex font-['Inter'] overflow-hidden">
      
      {/* --- SIDEBAR LATERAL --- */}
      <aside className="w-20 h-screen bg-white/30 backdrop-blur-md border-r border-white/50 flex flex-col items-center py-8 z-30 shrink-0">
        <div 
          className="mb-12 w-12 h-12 rounded-full p-[2px] shadow-lg"
          style={{ background: 'linear-gradient(135deg, #4F99CC 0%, #C6A55E 100%)' }}
        >
          <div className="w-full h-full bg-white rounded-full overflow-hidden flex items-center justify-center">
            <img src={logoImproveMe} alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>
        <SidebarIcon name="📝" active />
        <SidebarIcon name="🎭" />
        <SidebarIcon name="📊" />
        <SidebarIcon name="📅" />
        <SidebarIcon name="🏆" />
        <SidebarIcon name="🧘" />
        <div className="mt-auto">
          <SidebarIcon name="👤" />
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 relative overflow-y-auto h-screen p-8 lg:p-12 pb-24">
        
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
              <h2 className="text-xl font-['Tilt_Warp'] text-gray-800">Entrada del día {fecha.split('de')[0]}</h2>
              <p className="text-sm text-gray-500">¿Cómo te sientes hoy?</p>
            </div>

            {/* Selector de Humor (Imágenes más grandes y sin punto) */}
            <div className="flex justify-around items-center py-6">
              {humores.map((h) => (
                <motion.div
                  key={h.id}
                  whileHover={{ scale: 1.15, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setHumor(h.id)}
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                >
                  <div className={`relative transition-all duration-300 ${humor === h.id ? 'scale-110' : 'opacity-40 grayscale-[40%] group-hover:opacity-100 group-hover:grayscale-0'}`}>
                    <img src={h.imagen} alt={h.label} className="w-20 h-20 object-contain" />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${humor === h.id ? 'text-[#4F99CC]' : 'text-gray-400'}`}>
                    {h.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Área de Texto */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 ml-4 uppercase tracking-widest">Tu Diario</label>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribe aquí tus pensamientos..."
                className="w-full h-64 bg-white/80 backdrop-blur-sm rounded-[40px] p-8 shadow-inner border-2 border-white focus:border-[#4F99CC] outline-none transition-all resize-none text-gray-700 leading-relaxed"
              ></textarea>
            </div>

            {/* Slider de Sueño (Custom) */}
            <div className="space-y-4 px-4">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Calidad del Sueño</label>
                <span className="text-[#4F99CC] font-bold">{Math.round(sueno / 10)} horas</span>
              </div>
              <div className="relative h-2 w-full rounded-full bg-gray-200 overflow-visible">
                <div 
                  className="absolute h-full rounded-full bg-gradient-to-r from-[#4F99CC] to-[#A855F7]" 
                  style={{ width: `${sueno}%` }}
                ></div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sueno} 
                  onChange={(e) => setSueno(e.target.value)}
                  className="absolute -top-1 w-full h-4 opacity-0 cursor-pointer z-10"
                />
                <motion.div 
                  animate={{ left: `${sueno}%` }}
                  className="absolute top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-[#4F99CC] pointer-events-none"
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-4">
              <button className="flex-1 py-3 px-6 bg-white border border-gray-200 rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <span>📷</span> Añadir Imagen
              </button>
              <button className="flex-1 py-3 px-6 bg-white border border-gray-200 rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <span>🎤</span> Añadir Audio
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={manejarGuardar}
              disabled={estaGuardando}
              className={`w-full py-4 rounded-full font-bold shadow-xl transition-all ${estaGuardando ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900'}`}
            >
              {estaGuardando ? 'Guardando...' : 'Guardar Entrada'}
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
            <div className="relative">
              {/* Tarjeta de Preview con Borde Degradado */}
              <motion.div 
                layout
                className="w-80 h-[500px] rounded-[55px] shadow-2xl p-[3px] flex flex-col items-center justify-center text-center relative z-10 overflow-hidden"
                style={{ background: 'linear-gradient(180deg, #4F99CC 0%, #C6A55E 100%)' }}
              >
                <div className="w-full h-full bg-white rounded-[52px] relative overflow-hidden">
                  {/* Degradado sutil de fondo en la tarjeta */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white to-[#4F99CC]/5 pointer-events-none"></div>
                  
                  {/* Contenedor con Scroll desplazado del borde */}
                  <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-10 flex flex-col items-center">
                    <div className="mb-4 relative z-10">
                      <p className="text-xs font-black text-[#4F99CC] uppercase tracking-[0.2em]">{fecha}</p>
                      <div className="w-12 h-0.5 bg-[#4F99CC]/30 mx-auto mt-1 rounded-full"></div>
                    </div>

                    {/* Indicador de Sueño en la Tarjeta */}
                    <div className="mb-6 flex items-center gap-2 bg-[#4F99CC]/10 px-4 py-1.5 rounded-full border border-[#4F99CC]/20">
                      <span className="text-xs font-bold text-[#4F99CC]">{Math.round(sueno / 10)}h de sueño</span>
                    </div>

                    <div className="flex-1 flex items-center justify-center mb-8">
                       <p className="text-xl font-['Tilt_Warp'] text-gray-800 leading-tight">
                        {texto || "Aquí se muestra cómo queda la entrada..."}
                       </p>
                    </div>

                    {/* Decoración inferior de la tarjeta */}
                    <div className="w-20 h-1 bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] rounded-full shrink-0"></div>
                  </div>
                </div>
            </motion.div>

              {/* Icono Flotante de Humor (Contenido en círculo con color dinámico) */}
              <motion.div 
                key={humor}
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute -top-10 -left-10 w-28 h-28 bg-white rounded-full shadow-2xl border-4 flex items-center justify-center overflow-hidden z-20"
                style={{ borderColor: humores.find(h => h.id === humor)?.color || '#4F99CC' }}
              >
                <img 
                  src={humores.find(h => h.id === humor)?.imagen} 
                  alt="Humor" 
                  className="w-full h-full object-cover" 
                />
              </motion.div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default PaginaDiario;
