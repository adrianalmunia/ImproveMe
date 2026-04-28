import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { obtenerEntradasPorMes } from '../servicios/servicioAPI';
import logoCompleto from '../assets/logo_completo.png';
import { User, Mail, Lock, LogOut, Save, ShieldCheck, Eye, EyeOff, AlertTriangle, Trash2, Image as ImageIcon, Mic, ChevronRight, X, Calendar, Sun, Moon, FileText, Info } from 'lucide-react';
import { ReproductorAudio } from '../componentes/ReproductorAudio';

export function PaginaUsuario() {
  const { usuario, logout, eliminar } = useAutenticacion();
  const [nombre, setNombre] = useState(usuario?.nombre_usuario || '');
  const [email, setEmail] = useState(usuario?.correo || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [verNewPassword, setVerNewPassword] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [mostrarConfirmarBorrado, setMostrarConfirmarBorrado] = useState(false);
  const [mostrarGaleria, setMostrarGaleria] = useState(false);
  const [filtroGaleria, setFiltroGaleria] = useState('imagenes'); // 'imagenes' | 'audios'
  const [archivosReales, setArchivosReales] = useState([]);
  const [estaCargandoGaleria, setEstaCargandoGaleria] = useState(false);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  const [mostrarAcerca, setMostrarAcerca] = useState(false);
  
  // Estados para filtro de fecha
  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1);
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());

  const [fraseConfirmacion, setFraseConfirmacion] = useState('');
  const FRASE_ELIMINAR = "ELIMINAR MI CUENTA";

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const manejarGuardarPerfil = (e) => {
    e.preventDefault();
    setMensaje({ texto: 'Prototipo: Cambios guardados localmente (solo visual)', tipo: 'exito' });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const manejarCambioPassword = (e) => {
    e.preventDefault();
    setMensaje({ texto: 'Prototipo: Contraseña actualizada (solo visual)', tipo: 'exito' });
    setPassword('');
    setNewPassword('');
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const manejarBorrarCuenta = async () => {
    if (fraseConfirmacion !== FRASE_ELIMINAR) return;
    
    try {
      await eliminar();
      // logout() se llama dentro de eliminar() en el contexto, 
      // lo cual redirigirá automáticamente al login.
    } catch (error) {
      setMensaje({ texto: error.message || 'Error al eliminar cuenta', tipo: 'error' });
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000);
    }
  };

  // Cargar multimedia real
  const cargarMultimedia = async () => {
    if (!usuario?.id) return;
    setEstaCargandoGaleria(true);
    try {
      const entradas = await obtenerEntradasPorMes(usuario.id, mesFiltro, anioFiltro);
      const todosLosArchivos = entradas.reduce((acc, entrada) => {
        if (entrada.archivos_multimedia) {
          const archivosConFecha = entrada.archivos_multimedia.map(a => ({
            ...a,
            fecha: entrada.fecha
          }));
          return [...acc, ...archivosConFecha];
        }
        return acc;
      }, []);
      setArchivosReales(todosLosArchivos);
    } catch (error) {
      console.error("Error cargando galería:", error);
    } finally {
      setEstaCargandoGaleria(false);
    }
  };

  useEffect(() => {
    if (mostrarGaleria) {
      cargarMultimedia();
    }
  }, [mostrarGaleria, mesFiltro, anioFiltro]);

  const archivosFiltrados = archivosReales.filter(a => 
    filtroGaleria === 'imagenes' ? a.tipo_archivo === 'imagen' : a.tipo_archivo === 'audio'
  );

  return (
    <main className="flex-1 relative overflow-y-auto h-full p-8 lg:p-12 pb-24 font-['Inter']">
      
      {/* HEADER / LOGO */}
      <div className="flex justify-center mb-8">
        <motion.img 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          src={logoCompleto} 
          alt="ImproveMe Logo" 
          className="h-16 lg:h-20 object-contain" 
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* TARJETA DE PERFIL */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl border border-white rounded-[40px] shadow-2xl overflow-hidden"
        >
          <div className="h-32 bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] relative">
            <div className="absolute -bottom-12 left-12 w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-white overflow-hidden">
               <div className="w-full h-full bg-[#4F99CC]/10 flex items-center justify-center">
                  <User size={48} className="text-[#4F99CC]" />
               </div>
            </div>
          </div>
          <div className="pt-16 pb-8 px-12">
            <h2 className="text-3xl font-['Tilt_Warp'] text-gray-800">{usuario?.nombre_usuario}</h2>
            <p className="text-gray-500 font-medium">{usuario?.correo}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* DATOS PERSONALES */}
          <motion.div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100">
            <h3 className="text-xl font-['Tilt_Warp'] text-gray-800 mb-6 flex items-center gap-2">
              <User size={20} className="text-[#4F99CC]" /> Datos Personales
            </h3>
            <form onSubmit={manejarGuardarPerfil} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-1 block">Nombre de Usuario</label>
                <input 
                  type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-1 block">Correo</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl outline-none transition-all font-medium"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-[#4F99CC] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#3d82b3] transition-colors">
                <Save size={18} /> Guardar Cambios
              </button>
            </form>
          </motion.div>

          {/* SEGURIDAD */}
          <motion.div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100">
            <h3 className="text-xl font-['Tilt_Warp'] text-gray-800 mb-6 flex items-center gap-2">
              <Lock size={20} className="text-[#C6A55E]" /> Seguridad
            </h3>
            <form onSubmit={manejarCambioPassword} className="space-y-4">
              <div className="relative">
                <input 
                  type={verPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl outline-none" placeholder="Nueva clave"
                />
                <button type="button" onClick={() => setVerPassword(!verPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {verPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input 
                  type={verNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl outline-none" placeholder="Repetir clave"
                />
                <button type="button" onClick={() => setVerNewPassword(!verNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {verNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button type="submit" className="w-full py-3 bg-[#C6A55E] text-white rounded-2xl font-bold">
                <Lock size={18} /> Actualizar Clave
              </button>
            </form>
          </motion.div>
        </div>

        {/* BOTONES ADICIONALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setMostrarGaleria(true)}
            className="flex items-center justify-between p-6 bg-gradient-to-r from-[#4F99CC] to-[#3d82b3] text-white rounded-[32px] shadow-xl group"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <ImageIcon size={24} />
              </div>
              <div>
                <h4 className="font-['Tilt_Warp'] text-lg">Galería</h4>
                <p className="text-white/70 text-[10px]">Tus recuerdos</p>
              </div>
            </div>
            <ChevronRight size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setMostrarAcerca(true)}
            className="flex items-center justify-between p-6 bg-white border border-gray-100 text-gray-800 rounded-[32px] shadow-xl group transition-all w-full"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                <Info size={24} />
              </div>
              <div>
                <h4 className="font-['Tilt_Warp'] text-lg">Acerca de</h4>
                <p className="text-gray-400 text-[10px]">Sobre ImproveMe</p>
              </div>
            </div>
            <ChevronRight size={20} className="opacity-30" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-6 bg-white border border-gray-100 text-gray-800 rounded-[32px] shadow-xl group transition-all w-full"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-50 text-orange-500">
                <Sun size={24} />
              </div>
              <div>
                <h4 className="font-['Tilt_Warp'] text-lg">Modo Oscuro</h4>
                <p className="text-gray-400 text-[10px]">Cambiar apariencia</p>
              </div>
            </div>
            <ChevronRight size={20} className="opacity-30" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setMostrarTerminos(true)}
            className="flex items-center justify-between p-6 bg-white border border-gray-100 text-gray-800 rounded-[32px] shadow-xl group transition-all w-full"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="font-['Tilt_Warp'] text-lg">Términos</h4>
                <p className="text-gray-400 text-[10px]">Legal y condiciones</p>
              </div>
            </div>
            <ChevronRight size={20} className="opacity-30" />
          </motion.button>

          <div className="p-6 bg-white border border-gray-100 text-gray-800 rounded-[32px] shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#C6A55E]">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-['Tilt_Warp'] text-lg">Privacidad</h4>
                <p className="text-gray-400 text-[10px]">Seguridad</p>
              </div>
            </div>
            <ChevronRight size={20} className="opacity-30" />
          </div>
        </div>

        {/* ZONA DE PELIGRO */}
        <div className="bg-red-50/50 border border-red-100 rounded-[32px] p-8">
          <div className="flex items-center gap-4 mb-6">
            <AlertTriangle className="text-red-500" size={24} />
            <h3 className="text-xl font-['Tilt_Warp'] text-red-600">Zona de Peligro</h3>
          </div>
          {!mostrarConfirmarBorrado ? (
            <button onClick={() => setMostrarConfirmarBorrado(true)} className="px-6 py-3 bg-red-500 text-white rounded-2xl font-bold">
              Eliminar Cuenta Permanente
            </button>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-red-200 shadow-xl">
              <p className="text-sm font-bold text-gray-700 mb-4">Escribe <span className="text-red-500 underline">"{FRASE_ELIMINAR}"</span>:</p>
              <div className="flex gap-4">
                <input type="text" value={fraseConfirmacion} onChange={(e) => setFraseConfirmacion(e.target.value)} className="flex-1 px-5 py-3 bg-red-50 rounded-2xl outline-none font-bold text-red-600" />
                <button 
                  disabled={fraseConfirmacion !== FRASE_ELIMINAR} 
                  onClick={manejarBorrarCuenta}
                  className={`px-6 py-3 rounded-2xl font-black ${fraseConfirmacion === FRASE_ELIMINAR ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-400'}`}
                >
                  Borrar
                </button>
                <button onClick={() => setMostrarConfirmarBorrado(false)} className="px-6 py-3 bg-gray-100 rounded-2xl font-bold text-gray-500">Cancelar</button>
              </div>
            </div>
          )}
        </div>

        {/* CERRAR SESIÓN */}
        <div className="flex justify-center pt-4">
          <button onClick={logout} className="flex items-center gap-3 px-8 py-4 bg-red-50 text-red-500 rounded-full font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>

      </div>

      {/* MODAL GALERÍA */}
      <AnimatePresence>
        {mostrarGaleria && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-12">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-6xl h-full bg-white rounded-[48px] overflow-hidden flex flex-col shadow-2xl relative">
              <div className="h-48 bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] p-12 flex flex-col justify-end relative shrink-0">
                <button onClick={() => setMostrarGaleria(false)} className="absolute top-8 right-8 w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-white/40"><X /></button>
                <h2 className="text-4xl font-['Tilt_Warp'] text-white">Galería Multimedia</h2>
                <div className="mt-4 flex gap-3 bg-white/10 w-fit px-4 py-2 rounded-2xl border border-white/20">
                  <Calendar size={16} className="text-white" />
                  <select value={mesFiltro} onChange={(e) => setMesFiltro(parseInt(e.target.value))} className="bg-transparent text-white font-bold text-sm outline-none">
                    {meses.map((m, idx) => <option key={m} value={idx + 1} className="text-gray-800">{m}</option>)}
                  </select>
                  <select value={anioFiltro} onChange={(e) => setAnioFiltro(parseInt(e.target.value))} className="bg-transparent text-white font-bold text-sm outline-none">
                    {[2024, 2025, 2026].map(a => <option key={a} value={a} className="text-gray-800">{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 p-8 border-b border-gray-100 bg-gray-50/50 shrink-0">
                <button onClick={() => setFiltroGaleria('imagenes')} className={`px-6 py-3 rounded-full font-bold ${filtroGaleria === 'imagenes' ? 'bg-[#4F99CC] text-white shadow-lg' : 'bg-white text-gray-400 shadow-sm'}`}>Imágenes ({archivosReales.filter(a => a.tipo_archivo === 'imagen').length})</button>
                <button onClick={() => setFiltroGaleria('audios')} className={`px-6 py-3 rounded-full font-bold ${filtroGaleria === 'audios' ? 'bg-[#C6A55E] text-white shadow-lg' : 'bg-white text-gray-400 shadow-sm'}`}>Audios ({archivosReales.filter(a => a.tipo_archivo === 'audio').length})</button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 bg-neutral-50 custom-scrollbar">
                {estaCargandoGaleria ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4"><div className="w-12 h-12 border-4 border-[#4F99CC] border-t-transparent rounded-full animate-spin"></div><p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando...</p></div>
                ) : archivosFiltrados.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {archivosFiltrados.map((archivo) => (
                      <div key={archivo.id} className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full">
                        <div className="aspect-square bg-gray-100 flex items-center justify-center relative shrink-0">
                          {archivo.tipo_archivo === 'imagen' ? <img src={`http://localhost:3000${archivo.url_archivo}`} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#C6A55E]/10 flex items-center justify-center"><Mic size={40} className="text-[#C6A55E]" /></div>}
                          <div className="absolute top-4 left-4 bg-white/90 px-3 py-1.5 rounded-2xl shadow-md"><p className="text-[10px] font-black text-gray-800 uppercase">{new Date(archivo.fecha).getUTCDate()} {meses[new Date(archivo.fecha).getUTCMonth()].substring(0,3)}.</p></div>
                        </div>
                        {archivo.tipo_archivo === 'audio' && <div className="p-4 bg-white border-t border-gray-50 flex-1 flex flex-col justify-center"><ReproductorAudio src={`http://localhost:3000${archivo.url_archivo}`} /></div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400"><h4 className="text-xl font-['Tilt_Warp']">No hay {filtroGaleria}</h4><p className="text-sm">Intenta con otro mes.</p></div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        {mostrarTerminos && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-12">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-3xl h-[80vh] bg-white rounded-[48px] overflow-hidden flex flex-col shadow-2xl relative">
              <div className="p-12 border-b border-gray-100 flex justify-between items-center shrink-0">
                <h2 className="text-3xl font-['Tilt_Warp'] text-gray-800">Términos y Condiciones</h2>
                <button onClick={() => setMostrarTerminos(false)} className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 text-gray-600 space-y-6 custom-scrollbar">
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">1. Aceptación de los Términos</h3>
                  <p className="text-sm leading-relaxed">Al utilizar ImproveMe, aceptas cumplir con estos términos. Esta aplicación está diseñada para el crecimiento personal y el registro de hábitos.</p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">2. Privacidad de los Datos</h3>
                  <p className="text-sm leading-relaxed">Tus registros diarios, audios e imágenes se almacenan de forma segura. ImproveMe no comparte tu información personal con terceros sin tu consentimiento explícito.</p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">3. Uso Responsable</h3>
                  <p className="text-sm leading-relaxed">Te comprometes a utilizar la aplicación de manera constructiva. El contenido multimedia subido debe respetar las normas de convivencia y legalidad vigente.</p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">4. Propiedad Intelectual</h3>
                  <p className="text-sm leading-relaxed">Toda la propiedad intelectual de la aplicación ImproveMe pertenece a sus desarrolladores. El contenido que subas sigue siendo de tu propiedad.</p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">5. Modificaciones</h3>
                  <p className="text-sm leading-relaxed">Nos reservamos el derecho de modificar estos términos en cualquier momento. Se te notificará de cualquier cambio significativo.</p>
                </section>
                <div className="pt-8 text-center border-t border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Última actualización: 22 de Abril de 2026</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {mostrarAcerca && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-12">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-3xl h-[80vh] bg-white rounded-[48px] overflow-hidden flex flex-col shadow-2xl relative">
              <div className="p-12 border-b border-gray-100 flex justify-between items-center shrink-0">
                <h2 className="text-3xl font-['Tilt_Warp'] text-gray-800">Acerca del Proyecto</h2>
                <button onClick={() => setMostrarAcerca(false)} className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 text-gray-600 space-y-6 custom-scrollbar">
                <div className="flex justify-center mb-8">
                  <img src={logoCompleto} alt="Logo" className="h-20" />
                </div>
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">Nuestra Misión</h3>
                  <p className="text-sm leading-relaxed text-justify">
                    ImproveMe es una plataforma integral diseñada para facilitar el autoconocimiento y el crecimiento personal. 
                    Nace de la necesidad de tener un espacio privado y seguro donde registrar no solo lo que hacemos, sino cómo nos sentimos, 
                    ayudando a identificar patrones de comportamiento y mejorar nuestra calidad de vida día a día.
                  </p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">Características Principales</h3>
                  <ul className="list-disc list-inside text-sm space-y-2 ml-2">
                    <li>Registro diario de emociones y pensamientos.</li>
                    <li>Seguimiento de hábitos saludables (sueño, meditación, etc.).</li>
                    <li>Soporte multimedia: guarda tus recuerdos en voz e imagen.</li>
                    <li>Análisis de progreso mediante estadísticas detalladas.</li>
                  </ul>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">Tecnología</h3>
                  <p className="text-sm leading-relaxed">
                    Este proyecto ha sido desarrollado utilizando tecnologías modernas como <strong>React</strong> para el frontend, 
                    <strong>Tailwind CSS</strong> para un diseño premium y <strong>Node.js</strong> con <strong>Prisma</strong> para una gestión de datos eficiente y segura.
                  </p>
                </section>
                <div className="pt-8 text-center border-t border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">ImproveMe © 2026 - Tu mejor versión empieza hoy</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mensaje.texto && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white font-bold shadow-2xl z-[300] ${mensaje.tipo === 'exito' ? 'bg-green-500' : 'bg-red-500'}`}>{mensaje.texto}</motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default PaginaUsuario;
