import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { useTema } from '../contextos/ContextoTema';
import { useIdioma } from '../contextos/ContextoIdioma';
import { obtenerEntradasPorMes, exportarDatos } from '../servicios/servicioAPI';
import logoCompleto from '../assets/logo_completo.png';
import { User, Mail, Lock, LogOut, Save, ShieldCheck, Eye, EyeOff, AlertTriangle, Trash2, Image as ImageIcon, Mic, ChevronRight, X, Calendar, Sun, Moon, FileText, Info, Download, Languages } from 'lucide-react';
import { ReproductorAudio } from '../componentes/ReproductorAudio';

export function PaginaUsuario() {
  const { usuario, logout, eliminar, actualizarUsuario, token } = useAutenticacion();
  const { temaOscuro, toggleTema } = useTema();
  const [nombre, setNombre] = useState(usuario?.nombre_usuario || '');
  const [email, setEmail] = useState(usuario?.correo || '');
  const [alias, setAlias] = useState(usuario?.alias || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [verNewPassword, setVerNewPassword] = useState(false);
  const [verConfirmPassword, setVerConfirmPassword] = useState(false);
  const [verActualPasswordSeguridad, setVerActualPasswordSeguridad] = useState(false);
  const [actualPasswordSeguridad, setActualPasswordSeguridad] = useState('');

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [estaCargando, setEstaCargando] = useState(false);

  // Modal de confirmación
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [tipoCambio, setTipoCambio] = useState(null); // 'perfil' | 'password'

  const [mostrarConfirmarBorrado, setMostrarConfirmarBorrado] = useState(false);
  const [mostrarGaleria, setMostrarGaleria] = useState(false);
  const [filtroGaleria, setFiltroGaleria] = useState('imagenes');
  const [archivosReales, setArchivosReales] = useState([]);
  const [estaCargandoGaleria, setEstaCargandoGaleria] = useState(false);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  const [mostrarAcerca, setMostrarAcerca] = useState(false);
  const [mostrarOpcionesExportar, setMostrarOpcionesExportar] = useState(false);
  const [mostrarIdiomas, setMostrarIdiomas] = useState(false);
  const { idioma, setIdioma, t } = useIdioma();

  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1);
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());
  const [passwordBorrado, setPasswordBorrado] = useState('');
  const [verPasswordBorrado, setVerPasswordBorrado] = useState(false);
  const [imagenExpandida, setImagenExpandida] = useState(null);

  const [fraseConfirmacion, setFraseConfirmacion] = useState('');
  const FRASE_ELIMINAR = "ELIMINAR MI CUENTA";

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const mostrarNotificacion = (texto, tipo = 'exito') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000);
  };

  const manejarGuardarPerfil = (e) => {
    e.preventDefault();
    if (nombre === usuario.nombre_usuario && email === usuario.correo && alias === usuario.alias) {
      mostrarNotificacion('No hay cambios que guardar', 'error');
      return;
    }
    setTipoCambio('perfil');
    setMostrarConfirmacion(true);
  };

  const manejarCambioPassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      mostrarNotificacion('Las contraseñas no coinciden', 'error');
      return;
    }
    if (!actualPasswordSeguridad) {
      mostrarNotificacion('Debes introducir tu contraseña actual para realizar el cambio', 'error');
      return;
    }
    
    // Si ya tenemos la contraseña actual aquí, podemos saltar el modal o simplemente pasarla
    setPasswordConfirmacion(actualPasswordSeguridad);
    setTipoCambio('password');
    setMostrarConfirmacion(true);
  };

  const confirmarCambios = async () => {
    if (!passwordConfirmacion) {
      mostrarNotificacion('Debes introducir tu contraseña actual para confirmar', 'error');
      return;
    }

    setEstaCargando(true);
    try {
      // 1. Verificar contraseña actual (haciendo un login silencioso o usando un endpoint dedicado)
      // Por simplicidad, el backend actualizarPerfilUsuario podría verificar la contraseña si se la pasamos,
      // pero nuestro servicioAPI.actualizarPerfil no lo hace por defecto.
      // Vamos a asumir que el backend validará esto o implementaremos la lógica.

      const datosAActualizar = {
        contrasena_actual: passwordConfirmacion
      };

      if (tipoCambio === 'perfil') {
        if (nombre !== usuario.nombre_usuario) datosAActualizar.nombre_usuario = nombre;
        if (email !== usuario.correo) datosAActualizar.correo = email;
        if (alias !== usuario.alias) datosAActualizar.alias = alias;
      } else {
        datosAActualizar.contrasena = newPassword;
      }

      await actualizarUsuario(datosAActualizar);

      mostrarNotificacion('¡Cambios guardados con éxito!');
      setMostrarConfirmacion(false);
      setPasswordConfirmacion('');
      setActualPasswordSeguridad('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al actualizar', 'error');
    } finally {
      setEstaCargando(false);
    }
  };

  const manejarBorrarCuenta = async () => {
    if (fraseConfirmacion !== FRASE_ELIMINAR) return;
    if (!passwordBorrado) {
      mostrarNotificacion('Debes introducir tu contraseña para confirmar el borrado', 'error');
      return;
    }

    try {
      await eliminar(passwordBorrado);
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al eliminar cuenta', 'error');
    }
  };

  const manejarExportarDatos = async (formato) => {
    try {
      setMensaje({ texto: `Generando archivo ${formato.toUpperCase()}...`, tipo: 'exito' });
      const datos = await exportarDatos(token);
      
      let blob;
      let extension;
      
      if (formato === 'json') {
        blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        extension = 'json';
      } else {
        // Generar CSV para Excel
        const csvRows = [];
        
        // Cabecera Diario
        csvRows.push('--- SECCION: DIARIO ---');
        csvRows.push('Fecha,Animo,Sueño,Texto');
        datos.diario.forEach(e => {
          const textoLimpio = e.contenido_texto?.replace(/"/g, '""').replace(/\n/g, ' ') || '';
          csvRows.push(`${new Date(e.fecha).toLocaleDateString()},${e.puntuacion_animo},${e.horas_sueno},"${textoLimpio}"`);
        });
        
        csvRows.push(''); // Espacio
        
        // Cabecera Meditación
        csvRows.push('--- SECCION: MEDITACION ---');
        csvRows.push('Fecha,Duracion(seg),Completado(seg),Tecnica,Musica');
        datos.meditacion.forEach(m => {
          csvRows.push(`${new Date(m.fecha).toLocaleDateString()},${m.duracion_segundos},${m.segundos_completados},"${m.tecnica_respiracion || ''}","${m.pista_musica || ''}"`);
        });

        csvRows.push(''); // Espacio

        // Cabecera Hábitos
        csvRows.push('--- SECCION: HABITOS ---');
        csvRows.push('Nombre,Icono,Frecuencia');
        datos.habitos.forEach(h => {
          csvRows.push(`"${h.nombre}","${h.icono}","${h.frecuencia}"`);
        });

        const csvContent = "\ufeff" + csvRows.join('\n'); // \ufeff para soporte acentos en Excel
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        extension = 'csv';
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ImproveMe_Datos_${usuario.nombre_usuario}_${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMostrarOpcionesExportar(false);
      mostrarNotificacion('¡Datos exportados con éxito!');
    } catch (error) {
      mostrarNotificacion('Error al exportar: ' + error.message, 'error');
    }
  };

  // Cargar multimedia real
  const cargarMultimedia = async () => {
    if (!usuario?.id || !token) return;
    setEstaCargandoGaleria(true);
    try {
      const entradas = await obtenerEntradasPorMes(usuario.id, mesFiltro, anioFiltro, token);
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
    <main className="flex-1 relative overflow-y-auto h-full p-8 lg:p-12 pb-24 font-['Inter'] bg-neutral-50 dark:bg-gray-900 transition-colors duration-300">

      {/* HEADER / LOGO */}
      <div className="flex justify-center mb-8">
        <motion.img
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          src={logoCompleto}
          alt="ImproveMe Logo"
          className="h-16 lg:h-20 object-contain transition-all duration-300"
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* TARJETA DE PERFIL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white dark:border-gray-700 rounded-[40px] shadow-2xl overflow-hidden transition-colors duration-300"
        >
          <div className="h-32 bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] relative">
            <div className="absolute -bottom-12 left-12 w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-white overflow-hidden">
              <div className="w-full h-full bg-[#4F99CC]/10 flex items-center justify-center">
                <User size={48} className="text-[#4F99CC]" />
              </div>
            </div>
          </div>
          <div className="pt-16 pb-8 px-12">
            <h2 className="text-3xl font-['Tilt_Warp'] text-gray-800 dark:text-white transition-colors duration-300">
              {usuario?.alias || usuario?.nombre_usuario}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">
              {usuario?.alias ? `@${usuario.nombre_usuario} • ` : ''}{usuario?.correo}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* DATOS PERSONALES */}
          <motion.div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col h-full transition-colors duration-300">
            <h3 className="text-xl font-['Tilt_Warp'] text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors duration-300">
              <User size={20} className="text-[#4F99CC]" /> {t('datos_personales')}
            </h3>
            <form onSubmit={manejarGuardarPerfil} className="space-y-4 flex flex-col flex-1">
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-2 mb-1 block">{idioma === 'es' ? 'Nombre de Usuario' : 'Username'}</label>
                <input
                  type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-800 dark:text-white rounded-2xl outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-2 mb-1 block">{idioma === 'es' ? 'Alias (Cómo te llamamos)' : 'Alias (How we call you)'}</label>
                <input
                  type="text" value={alias} onChange={(e) => setAlias(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-800 dark:text-white rounded-2xl outline-none transition-all font-medium"
                  placeholder="Ej: Adri"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-2 mb-1 block">{idioma === 'es' ? 'Correo' : 'Email'}</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-800 dark:text-white rounded-2xl outline-none transition-all font-medium"
                />
              </div>
              <div className="mt-auto pt-4">
                <button type="submit" className="w-full py-3 bg-[#4F99CC] dark:bg-[#4F99CC]/80 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#3d82b3] dark:hover:bg-[#4F99CC] transition-colors">
                  <Save size={18} /> {t('guardar')}
                </button>
              </div>
            </form>
          </motion.div>

          {/* SEGURIDAD */}
          <motion.div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col h-full transition-colors duration-300">
            <h3 className="text-xl font-['Tilt_Warp'] text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors duration-300">
              <Lock size={20} className="text-[#C6A55E]" /> {t('seguridad')}
            </h3>
            <form onSubmit={manejarCambioPassword} className="space-y-4 flex flex-col flex-1">
              <div className="relative">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-2 mb-1 block">{idioma === 'es' ? 'Contraseña Actual' : 'Current Password'}</label>
                <input
                  type={verActualPasswordSeguridad ? "text" : "password"} value={actualPasswordSeguridad} onChange={(e) => setActualPasswordSeguridad(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-800 dark:text-white rounded-2xl outline-none transition-all" placeholder="••••••••"
                />
                <button type="button" onClick={() => setVerActualPasswordSeguridad(!verActualPasswordSeguridad)} className="absolute right-4 bottom-3 text-gray-400 dark:text-gray-500">
                  {verActualPasswordSeguridad ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-2 mb-1 block">{idioma === 'es' ? 'Nueva Clave' : 'New Password'}</label>
                <input
                  type={verNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-800 dark:text-white rounded-2xl outline-none transition-all" placeholder="••••••••"
                />
                <button type="button" onClick={() => setVerNewPassword(!verNewPassword)} className="absolute right-4 bottom-3 text-gray-400 dark:text-gray-500">
                  {verNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-2 mb-1 block">{idioma === 'es' ? 'Confirmar Clave' : 'Confirm Password'}</label>
                <input
                  type={verConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-800 dark:text-white rounded-2xl outline-none transition-all" placeholder="••••••••"
                />
                <button type="button" onClick={() => setVerConfirmPassword(!verConfirmPassword)} className="absolute right-4 bottom-3 text-gray-400 dark:text-gray-500">
                  {verConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-auto pt-4">
                <button type="submit" className="w-full py-3 bg-[#C6A55E] dark:bg-[#C6A55E]/80 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#b0914d] dark:hover:bg-[#C6A55E] transition-colors">
                  <Lock size={18} /> {t('actualizar_clave')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* MODAL DE CONFIRMACIÓN DE CAMBIOS */}
        <AnimatePresence>
          {mostrarConfirmacion && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[40px] p-10 shadow-2xl text-center">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#4F99CC]">
                  <ShieldCheck size={40} />
                </div>
                <h3 className="text-2xl font-['Tilt_Warp'] text-gray-800 dark:text-white mb-2">{idioma === 'es' ? 'Confirmar Cambios' : 'Confirm Changes'}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">{idioma === 'es' ? `Por seguridad, introduce tu contraseña actual para aplicar los cambios en tu ${tipoCambio === 'perfil' ? 'perfil' : 'contraseña'}.` : `For security, enter your current password to apply changes to your ${tipoCambio === 'perfil' ? 'profile' : 'password'}.`}</p>
 
                 <div className="relative mb-6">
                   <input
                     type="password"
                     value={passwordConfirmacion}
                     onChange={(e) => setPasswordConfirmacion(e.target.value)}
                     placeholder={idioma === 'es' ? "Contraseña actual" : "Current password"}
                     className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none text-center font-bold dark:text-white transition-colors"
                     autoFocus
                   />
                 </div>
 
                 <div className="flex flex-col gap-3">
                   <button
                     onClick={confirmarCambios}
                     disabled={estaCargando || !passwordConfirmacion}
                     className="w-full py-4 bg-[#4F99CC] dark:bg-[#4F99CC]/80 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-[#3d82b3] dark:hover:bg-[#4F99CC] disabled:opacity-50 transition-all"
                   >
                     {estaCargando ? (idioma === 'es' ? 'Procesando...' : 'Processing...') : (idioma === 'es' ? 'Confirmar y Guardar' : 'Confirm and Save')}
                   </button>
                   <button
                     onClick={() => { setMostrarConfirmacion(false); setPasswordConfirmacion(''); }}
                     className="w-full py-4 bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                   >
                     {idioma === 'es' ? 'Cancelar' : 'Cancel'}
                   </button>
                 </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                <h4 className="font-['Tilt_Warp'] text-lg">{t('galeria')}</h4>
                <p className="text-white/70 text-[10px]">{idioma === 'es' ? 'Tus recuerdos' : 'Your memories'}</p>
              </div>
            </div>
            <ChevronRight size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setMostrarAcerca(true)}
            className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white rounded-[32px] shadow-xl group transition-colors duration-300 w-full"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-500">
                <Info size={24} />
              </div>
              <div>
                <h4 className="font-['Tilt_Warp'] text-lg">{t('acerca_de')}</h4>
                <p className="text-gray-400 dark:text-gray-500 text-[10px]">{idioma === 'es' ? 'Sobre ImproveMe' : 'About ImproveMe'}</p>
              </div>
            </div>
            <ChevronRight size={20} className="opacity-30 dark:opacity-50" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={toggleTema}
            className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white rounded-[32px] shadow-xl group transition-colors duration-300 w-full"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-50 dark:bg-orange-900/30 text-orange-500">
                {temaOscuro ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <div>
                <h4 className="font-['Tilt_Warp'] text-lg">{temaOscuro ? t('modo_claro') : t('modo_oscuro')}</h4>
                <p className="text-gray-400 dark:text-gray-500 text-[10px]">{idioma === 'es' ? 'Cambiar apariencia' : 'Change appearance'}</p>
              </div>
            </div>
            <ChevronRight size={20} className="opacity-30 dark:opacity-50" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setMostrarTerminos(true)}
            className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white rounded-[32px] shadow-xl group transition-colors duration-300 w-full"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-500">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="font-['Tilt_Warp'] text-lg">{t('terminos')}</h4>
                <p className="text-gray-400 dark:text-gray-500 text-[10px]">{idioma === 'es' ? 'Legal y condiciones' : 'Legal and conditions'}</p>
              </div>
            </div>
            <ChevronRight size={20} className="opacity-30 dark:opacity-50" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setMostrarIdiomas(true)}
            className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white rounded-[32px] shadow-xl group transition-colors duration-300 w-full"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-500">
                <Languages size={24} />
              </div>
              <div>
                <h4 className="font-['Tilt_Warp'] text-lg">{t('idioma')}</h4>
                <p className="text-gray-400 dark:text-gray-500 text-[10px]">{idioma === 'es' ? 'Elegir idioma / Language' : 'Select language'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">{idioma === 'es' ? 'Español' : 'English'}</span>
              <ChevronRight size={20} className="opacity-30 dark:opacity-50" />
            </div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setMostrarOpcionesExportar(true)}
            className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white rounded-[32px] shadow-xl flex items-center justify-between group w-full transition-colors duration-300"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-[#C6A55E] group-hover:bg-orange-50 dark:group-hover:bg-orange-900/30 transition-colors">
                <Download size={24} />
              </div>
              <div>
                <h4 className="font-['Tilt_Warp'] text-lg">{t('exportar')}</h4>
                <p className="text-gray-400 dark:text-gray-500 text-[10px]">{idioma === 'es' ? 'Toda tu información' : 'All your information'}</p>
              </div>
            </div>
            <ChevronRight size={20} className="opacity-30 dark:opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </motion.button>
        </div>

        {/* ZONA DE PELIGRO */}
        <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[32px] p-8 transition-colors duration-300">
          <div className="flex items-center gap-4 mb-6">
            <AlertTriangle className="text-red-500" size={24} />
            <h3 className="text-xl font-['Tilt_Warp'] text-red-600 dark:text-red-400">{t('zona_peligro')}</h3>
          </div>
          {!mostrarConfirmarBorrado ? (
            <button onClick={() => setMostrarConfirmarBorrado(true)} className="px-6 py-3 bg-red-500 dark:bg-red-600/80 text-white rounded-2xl font-bold hover:bg-red-600 dark:hover:bg-red-500 transition-colors">
              {t('eliminar_cuenta')}
            </button>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-red-200 dark:border-red-900/50 shadow-xl transition-colors duration-300">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{idioma === 'es' ? 'Paso 1: Confirma tu contraseña:' : 'Step 1: Confirm your password:'}</p>
              <div className="relative mb-4">
                <input
                  type={verPasswordBorrado ? "text" : "password"}
                  value={passwordBorrado}
                  onChange={(e) => setPasswordBorrado(e.target.value)}
                  placeholder={idioma === 'es' ? "Tu contraseña actual" : "Your current password"}
                  className="w-full px-5 py-3 bg-red-50 dark:bg-red-900/20 rounded-2xl outline-none font-bold text-red-600 dark:text-red-400"
                />
                <button type="button" onClick={() => setVerPasswordBorrado(!verPasswordBorrado)} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-300">
                  {verPasswordBorrado ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
 
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{idioma === 'es' ? `Paso 2: Escribe "${FRASE_ELIMINAR}":` : `Step 2: Type "${FRASE_ELIMINAR}":`}</p>
               <div className="flex flex-col sm:flex-row gap-4">
                 <input type="text" value={fraseConfirmacion} onChange={(e) => setFraseConfirmacion(e.target.value)} className="flex-1 px-5 py-3 bg-red-50 dark:bg-red-900/20 rounded-2xl outline-none font-bold text-red-600 dark:text-red-400" />
                 <div className="flex gap-2">
                   <button
                     disabled={fraseConfirmacion !== FRASE_ELIMINAR || !passwordBorrado}
                     onClick={manejarBorrarCuenta}
                     className={`px-6 py-3 rounded-2xl font-black transition-colors ${fraseConfirmacion === FRASE_ELIMINAR && passwordBorrado ? 'bg-red-500 dark:bg-red-600/80 text-white hover:bg-red-600 dark:hover:bg-red-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}
                   >
                     {idioma === 'es' ? 'Borrar' : 'Delete'}
                   </button>
                   <button onClick={() => { setMostrarConfirmarBorrado(false); setPasswordBorrado(''); setFraseConfirmacion(''); }} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-2xl font-bold text-gray-500 dark:text-gray-400">{idioma === 'es' ? 'Cancelar' : 'Cancel'}</button>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* CERRAR SESIÓN */}
        <div className="flex justify-center pt-4">
          <button onClick={logout} className="flex items-center gap-3 px-8 py-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full font-black uppercase tracking-widest hover:bg-red-500 dark:hover:bg-red-500 hover:text-white dark:hover:text-white transition-all duration-300">
            <LogOut size={20} /> {t('cerrar_sesion')}
          </button>
        </div>

      </div>

      {/* MODAL GALERÍA */}
      <AnimatePresence>
        {mostrarGaleria && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-12">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-6xl h-full bg-white dark:bg-gray-900 rounded-[48px] overflow-hidden flex flex-col shadow-2xl relative transition-colors duration-300">
              <div className="h-48 bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] p-12 flex flex-col justify-end relative shrink-0">
                <button onClick={() => setMostrarGaleria(false)} className="absolute top-8 right-8 w-12 h-12 bg-white/20 dark:bg-black/20 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-white/40 dark:hover:bg-black/40 transition-colors duration-300"><X /></button>
                <h2 className="text-4xl font-['Tilt_Warp'] text-white">{idioma === 'es' ? 'Galería Multimedia' : 'Media Gallery'}</h2>
                <div className="mt-4 flex gap-3 bg-white/10 w-fit px-4 py-2 rounded-2xl border border-white/20">
                  <Calendar size={16} className="text-white" />
                  <select value={mesFiltro} onChange={(e) => setMesFiltro(parseInt(e.target.value))} className="bg-transparent text-white font-bold text-sm outline-none">
                    {meses.map((m, idx) => <option key={m} value={idx + 1} className="text-gray-800">{idioma === 'es' ? m : (['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][idx])}</option>)}
                  </select>
                  <select value={anioFiltro} onChange={(e) => setAnioFiltro(parseInt(e.target.value))} className="bg-transparent text-white font-bold text-sm outline-none">
                    {[2024, 2025, 2026].map(a => <option key={a} value={a} className="text-gray-800">{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 shrink-0 transition-colors duration-300">
                <button onClick={() => setFiltroGaleria('imagenes')} className={`px-6 py-3 rounded-full font-bold transition-colors duration-300 ${filtroGaleria === 'imagenes' ? 'bg-[#4F99CC] text-white shadow-lg' : 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-300 shadow-sm'}`}>{idioma === 'es' ? 'Imágenes' : 'Images'} ({archivosReales.filter(a => a.tipo_archivo === 'imagen').length})</button>
                <button onClick={() => setFiltroGaleria('audios')} className={`px-6 py-3 rounded-full font-bold transition-colors duration-300 ${filtroGaleria === 'audios' ? 'bg-[#C6A55E] text-white shadow-lg' : 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-300 shadow-sm'}`}>{idioma === 'es' ? 'Audios' : 'Audios'} ({archivosReales.filter(a => a.tipo_archivo === 'audio').length})</button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 bg-neutral-50 dark:bg-gray-900 custom-scrollbar transition-colors duration-300">
                {estaCargandoGaleria ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4"><div className="w-12 h-12 border-4 border-[#4F99CC] border-t-transparent rounded-full animate-spin"></div><p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-xs transition-colors duration-300">{idioma === 'es' ? 'Cargando...' : 'Loading...'}</p></div>
                ) : archivosFiltrados.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {archivosFiltrados.map((archivo) => (
                      <div key={archivo.id} className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden flex flex-col h-80 relative group transition-colors duration-300">
                        {/* Overlay estético - pointer-events-none para no bloquear clics */}
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 relative overflow-hidden flex flex-col transition-colors duration-300">
                          {archivo.tipo_archivo === 'imagen' ? (
                            <img
                              src={`http://localhost:3000${archivo.url_archivo}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                              alt="Recuerdo"
                              onClick={() => setImagenExpandida(`http://localhost:3000${archivo.url_archivo}`)}
                            />
                          ) : (
                            <div className="w-full h-full bg-[#C6A55E]/10 flex flex-col items-center justify-center p-6 text-center z-20 relative">
                              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
                                <Mic size={32} className="text-[#C6A55E]" />
                              </div>
                              <p className="text-[#C6A55E] font-bold text-xs uppercase tracking-widest mb-4">{idioma === 'es' ? 'Nota de Voz' : 'Voice Note'}</p>
                              <div className="w-full max-w-[240px]">
                                <ReproductorAudio src={`http://localhost:3000${archivo.url_archivo}`} light />
                              </div>
                            </div>
                          )}

                          {/* FECHA OVERLAY */}
                          <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-2xl shadow-lg pointer-events-none transition-colors duration-300">
                            <p className="text-[10px] font-black text-gray-800 dark:text-white uppercase transition-colors duration-300">
                              {new Date(archivo.fecha).getUTCDate()} {meses[new Date(archivo.fecha).getUTCMonth()].substring(0, 3)}.
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 dark:text-gray-500 transition-colors duration-300"><h4 className="text-xl font-['Tilt_Warp']">{idioma === 'es' ? `No hay ${filtroGaleria}` : `No ${filtroGaleria} found`}</h4><p className="text-sm">{idioma === 'es' ? 'Intenta con otro mes.' : 'Try another month.'}</p></div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        {mostrarTerminos && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-12">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-3xl h-[80vh] bg-white dark:bg-gray-900 rounded-[48px] overflow-hidden flex flex-col shadow-2xl relative transition-colors duration-300">
              <div className="p-12 bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] flex justify-between items-center shrink-0 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-[2px]" />
                <h2 className="text-3xl font-['Tilt_Warp'] text-white relative z-10">{idioma === 'es' ? 'Términos y Condiciones' : 'Terms and Conditions'}</h2>
                <button onClick={() => setMostrarTerminos(false)} className="w-12 h-12 bg-white/20 dark:bg-black/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 dark:hover:bg-black/40 transition-colors relative z-10 backdrop-blur-md border border-white/30 dark:border-white/10"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 text-gray-600 dark:text-gray-300 space-y-6 custom-scrollbar transition-colors duration-300">
                <section>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 uppercase tracking-widest text-xs transition-colors duration-300">{idioma === 'es' ? '1. Aceptación de los Términos' : '1. Acceptance of Terms'}</h3>
                  <p className="text-sm leading-relaxed">{idioma === 'es' ? 'Al utilizar ImproveMe, aceptas cumplir con estos términos. Esta aplicación está diseñada para el crecimiento personal y el registro de hábitos.' : 'By using ImproveMe, you agree to comply with these terms. This application is designed for personal growth and habit tracking.'}</p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 uppercase tracking-widest text-xs transition-colors duration-300">{idioma === 'es' ? '2. Privacidad de los Datos' : '2. Data Privacy'}</h3>
                  <p className="text-sm leading-relaxed">{idioma === 'es' ? 'Tus registros diarios, audios e imágenes se almacenan de forma segura. ImproveMe no comparte tu información personal con terceros sin tu consentimiento explícito.' : 'Your daily records, audios, and images are stored securely. ImproveMe does not share your personal information with third parties without your explicit consent.'}</p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 uppercase tracking-widest text-xs transition-colors duration-300">{idioma === 'es' ? '3. Uso Responsable' : '3. Responsible Use'}</h3>
                  <p className="text-sm leading-relaxed">{idioma === 'es' ? 'Te comprometes a utilizar la aplicación de manera constructiva. El contenido multimedia subido debe respetar las normas de convivencia y legalidad vigente.' : 'You agree to use the application constructively. Uploaded media content must respect community standards and current laws.'}</p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 uppercase tracking-widest text-xs transition-colors duration-300">{idioma === 'es' ? '4. Propiedad Intelectual' : '4. Intellectual Property'}</h3>
                  <p className="text-sm leading-relaxed">{idioma === 'es' ? 'Toda la propiedad intelectual de la aplicación ImproveMe pertenece a sus desarrolladores. El contenido que subas sigue siendo de tu propiedad.' : 'All intellectual property of the ImproveMe application belongs to its developers. The content you upload remains your property.'}</p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 uppercase tracking-widest text-xs transition-colors duration-300">{idioma === 'es' ? '5. Modificaciones' : '5. Modifications'}</h3>
                  <p className="text-sm leading-relaxed">{idioma === 'es' ? 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Se te notificará de cualquier cambio significativo.' : 'We reserve the right to modify these terms at any time. You will be notified of any significant changes.'}</p>
                </section>
                <div className="pt-8 text-center border-t border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{idioma === 'es' ? 'Última actualización: 22 de Abril de 2026' : 'Last updated: April 22, 2026'}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {mostrarAcerca && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-12">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-3xl h-[80vh] bg-white dark:bg-gray-900 rounded-[48px] overflow-hidden flex flex-col shadow-2xl relative transition-colors duration-300">
              <div className="p-12 bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] flex justify-between items-center shrink-0 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-[2px]" />
                <h2 className="text-3xl font-['Tilt_Warp'] text-white relative z-10">{idioma === 'es' ? 'Acerca del Proyecto' : 'About the Project'}</h2>
                <button onClick={() => setMostrarAcerca(false)} className="w-12 h-12 bg-white/20 dark:bg-black/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 dark:hover:bg-black/40 transition-colors relative z-10 backdrop-blur-md border border-white/30 dark:border-white/10"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 text-gray-600 dark:text-gray-300 space-y-6 custom-scrollbar transition-colors duration-300">
                <div className="flex justify-center mb-8">
                  <img src={logoCompleto} alt="Logo" className="h-20 transition-all duration-300" />
                </div>
                <section>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 uppercase tracking-widest text-xs transition-colors duration-300">{idioma === 'es' ? 'Nuestra Misión' : 'Our Mission'}</h3>
                  <p className="text-sm leading-relaxed text-justify">
                    {idioma === 'es' 
                      ? 'ImproveMe es una plataforma integral diseñada para facilitar el autoconocimiento y el crecimiento personal. Nace de la necesidad de tener un espacio privado y seguro donde registrar no solo lo que hacemos, sino cómo nos sentimos, ayudando a identificar patrones de comportamiento y mejorar nuestra calidad de vida día a día.' 
                      : 'ImproveMe is a comprehensive platform designed to facilitate self-knowledge and personal growth. It is born from the need to have a private and secure space to record not only what we do, but how we feel, helping to identify behavior patterns and improve our quality of life day by day.'}
                  </p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 uppercase tracking-widest text-xs transition-colors duration-300">{idioma === 'es' ? 'Características Principales' : 'Main Features'}</h3>
                  <ul className="list-disc list-inside text-sm space-y-2 ml-2">
                    <li>{idioma === 'es' ? 'Registro diario de emociones y pensamientos.' : 'Daily record of emotions and thoughts.'}</li>
                    <li>{idioma === 'es' ? 'Seguimiento de hábitos saludables (sueño, meditación, etc.).' : 'Tracking of healthy habits (sleep, meditation, etc.).'}</li>
                    <li>{idioma === 'es' ? 'Soporte multimedia: guarda tus recuerdos en voz e imagen.' : 'Multimedia support: save your memories in voice and image.'}</li>
                    <li>{idioma === 'es' ? 'Análisis de progreso mediante estadísticas detalladas.' : 'Progress analysis through detailed statistics.'}</li>
                  </ul>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 uppercase tracking-widest text-xs transition-colors duration-300">{idioma === 'es' ? 'Tecnología' : 'Technology'}</h3>
                  <p className="text-sm leading-relaxed">
                    {idioma === 'es' 
                      ? 'Este proyecto ha sido desarrollado utilizando tecnologías modernas como React para el frontend, Tailwind CSS para un diseño premium y Node.js con Prisma para una gestión de datos eficiente y segura.' 
                      : 'This project has been developed using modern technologies such as React for the frontend, Tailwind CSS for a premium design, and Node.js with Prisma for efficient and secure data management.'}
                  </p>
                </section>
                <div className="pt-8 text-center border-t border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{idioma === 'es' ? 'ImproveMe © 2026 - Tu mejor versión empieza hoy' : 'ImproveMe © 2026 - Your best version starts today'}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarOpcionesExportar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-[40px] p-10 shadow-2xl text-center transition-colors duration-300">
              <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#C6A55E] transition-colors duration-300">
                <Download size={40} />
              </div>
              <h3 className="text-2xl font-['Tilt_Warp'] text-gray-800 dark:text-white mb-2 transition-colors duration-300">{idioma === 'es' ? 'Exportar Datos' : 'Export Data'}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 transition-colors duration-300">{idioma === 'es' ? 'Selecciona el formato en el que quieres descargar tu información.' : 'Select the format in which you want to download your information.'}</p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => manejarExportarDatos('json')}
                  className="w-full py-4 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl font-bold flex items-center justify-between px-6 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-100 dark:hover:border-blue-800 transition-all group duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-[10px]">JSON</div>
                    <span>{idioma === 'es' ? 'Formato Técnico' : 'Technical Format'}</span>
                  </div>
                  <ChevronRight size={18} className="opacity-0 group-hover:opacity-100" />
                </button>

                <button
                  onClick={() => manejarExportarDatos('excel')}
                  className="w-full py-4 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl font-bold flex items-center justify-between px-6 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-100 dark:hover:border-green-800 transition-all group duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-[10px]">CSV</div>
                    <span>{idioma === 'es' ? 'Excel / Hoja de Cálculo' : 'Excel / Spreadsheet'}</span>
                  </div>
                  <ChevronRight size={18} className="opacity-0 group-hover:opacity-100" />
                </button>

                <button
                  onClick={() => setMostrarOpcionesExportar(false)}
                  className="mt-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                >
                  {idioma === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {mostrarIdiomas && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-[40px] p-10 shadow-2xl text-center transition-colors duration-300">
              <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 text-green-500 transition-colors duration-300">
                <Languages size={40} />
              </div>
              <h3 className="text-2xl font-['Tilt_Warp'] text-gray-800 dark:text-white mb-2">{idioma === 'es' ? 'Seleccionar Idioma' : 'Select Language'}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">{idioma === 'es' ? 'Elige el idioma de la aplicación.' : 'Choose the application language.'}</p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setIdioma('es'); setMostrarIdiomas(false); }}
                  className={`w-full py-4 border rounded-2xl font-bold flex items-center justify-between px-6 transition-all group ${idioma === 'es' ? 'bg-green-500 border-green-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇪🇸</span>
                    <span>Español</span>
                  </div>
                  {idioma === 'es' && <ShieldCheck size={18} />}
                </button>

                <button
                  onClick={() => { setIdioma('en'); setMostrarIdiomas(false); }}
                  className={`w-full py-4 border rounded-2xl font-bold flex items-center justify-between px-6 transition-all group ${idioma === 'en' ? 'bg-green-500 border-green-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇺🇸</span>
                    <span>English</span>
                  </div>
                  {idioma === 'en' && <ShieldCheck size={18} />}
                </button>

                <button
                  onClick={() => setMostrarIdiomas(false)}
                  className="mt-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                >
                  {idioma === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mensaje.texto && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white font-bold shadow-2xl z-[500] ${mensaje.tipo === 'exito' ? 'bg-green-500' : 'bg-red-500'}`}>{mensaje.texto}</motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE IMAGEN EXPANDIDA (Z-index alto para estar sobre la galería) */}
      <AnimatePresence>
        {imagenExpandida && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImagenExpandida(null)}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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

export default PaginaUsuario;
