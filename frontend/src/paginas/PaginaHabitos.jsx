import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import * as servicioAPI from '../servicios/servicioAPI';
import {
  Plus,
  Minus,
  CheckCircle2,
  Flame,
  Calendar,
  CheckSquare,
  MoreVertical,
  Trophy,
  Zap,
  Target,
  Trash2
} from 'lucide-react';

const PaginaHabitos = ({ setVistaActual }) => {
  const { usuario, token, actualizarUsuario, refrescarUsuario } = useAutenticacion();
  // const navigate = useNavigate();

  // Puntos de XP guardados en el usuario (o por defecto)
  const xpActual = usuario?.puntos_experiencia || 0;
  const nivelActual = Math.floor(xpActual / 100) + 1; // Cada 100 XP es un nivel (por simplificar)
  const xpParaSiguienteNivel = 100 - (xpActual % 100);

  // IDs temporales (timestamps) para que el backend los trate como nuevos
  const habitosPorDefecto = [
    { id: Date.now() + 1, nombre: 'Beber Agua', racha: 0, rachaAnterior: 0, estado: null, tipo: 'habito', fechaCreacion: Date.now() - 86400000, frecuenciaSemanal: 7 },
    { id: Date.now() + 2, nombre: 'Leer 10 min', racha: 0, rachaAnterior: 0, estado: null, tipo: 'habito', fechaCreacion: Date.now() - 86400000, frecuenciaSemanal: 7 },
    { id: Date.now() + 3, nombre: 'No fumar', racha: 0, rachaAnterior: 0, estado: null, tipo: 'habito', fechaCreacion: Date.now() - 86400000, frecuenciaSemanal: 7 },
  ];

  const diariasPorDefecto = [
    { id: Date.now() + 4, nombre: 'Hacer la cama', completada: false, racha: 0, fechaCreacion: Date.now() - 86400000 },
    { id: Date.now() + 5, nombre: 'Meditación', completada: false, racha: 0, fechaCreacion: Date.now() - 86400000 },
    { id: Date.now() + 6, nombre: 'Estudiar Inglés', completada: false, racha: 0, fechaCreacion: Date.now() - 86400000 },
  ];

  const tareasPorDefecto = [
    { id: Date.now() + 7, nombre: 'Comprar comida perro', completada: false, prioridad: 'alta', fechaCreacion: Date.now() - 86400000 },
    { id: Date.now() + 8, nombre: 'Llamar al médico', completada: false, prioridad: 'media', fechaCreacion: Date.now() - 86400000 },
    { id: Date.now() + 9, nombre: 'Limpiar el teclado', completada: false, prioridad: 'baja', fechaCreacion: Date.now() - 86400000 },
  ];

  const [habitos, setHabitos] = useState([]);
  const [diarias, setDiarias] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [estaCargandoDatos, setEstaCargandoDatos] = useState(true);
  const [primeraCarga, setPrimeraCarga] = useState(true);

  // Refs para sincronización al desmontar el componente
  const datosRef = useRef({ habitos: [], diarias: [], tareas: [] });
  const tokenRef = useRef(token);
  const necesitaSincronizar = useRef(false);
  const timerRef = useRef(null);

  // Mantener refs actualizados
  useEffect(() => { tokenRef.current = token; }, [token]);
  useEffect(() => { datosRef.current = { habitos, diarias, tareas }; }, [habitos, diarias, tareas]);

  // Cargar datos desde el backend
  useEffect(() => {
    let montado = true;
    const cargarDatos = async () => {
      if (!token) return;
      try {
        setEstaCargandoDatos(true);
        
        // 1. Refrescar datos del usuario (XP, nivel)
        await refrescarUsuario();

        // 2. Obtener hábitos y tareas
        const datos = await servicioAPI.obtenerGamificacion(token);
        if (montado) {
          if (datos.habitos.length === 0 && datos.diarias.length === 0 && datos.tareas.length === 0) {
            setHabitos(habitosPorDefecto);
            setDiarias(diariasPorDefecto);
            setTareas(tareasPorDefecto);
          } else {
            setHabitos(datos.habitos);
            setDiarias(datos.diarias);
            setTareas(datos.tareas);
          }
          setPrimeraCarga(false);
        }
      } catch (error) {
        console.error("Error al cargar tareas:", error);
      } finally {
        if (montado) setEstaCargandoDatos(false);
      }
    };
    cargarDatos();
    return () => { montado = false; };
  }, [token]);

  // Sincronizar con el backend de forma automática (debounce 1s)
  useEffect(() => {
    if (primeraCarga || estaCargandoDatos) return;
    if (!token) return;

    necesitaSincronizar.current = true;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      necesitaSincronizar.current = false;
      servicioAPI.sincronizarGamificacion(datosRef.current, tokenRef.current)
        .catch(err => console.error("Error guardando progreso:", err));
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [habitos, diarias, tareas, token, primeraCarga, estaCargandoDatos]);

  // Sincronizar al desmontar el componente (cambio de pantalla)
  useEffect(() => {
    return () => {
      if (necesitaSincronizar.current && tokenRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        // Lanzamos la sincronización inmediata; el fetch continúa aunque el componente se desmonte
        servicioAPI.sincronizarGamificacion(datosRef.current, tokenRef.current)
          .catch(err => console.error("Error guardando progreso al salir:", err));
      }
    };
  }, []);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaPrioridad, setNuevaPrioridad] = useState('media');
  const [frecuenciaSeleccionada, setFrecuenciaSeleccionada] = useState(7);
  const [seccionActiva, setSeccionActiva] = useState(null);

  // Estado para animaciones de XP flotante
  const [notificacionesXP, setNotificacionesXP] = useState([]);

  // Añadir experiencia y mostrar animación
  const ganarXP = (cantidad, e) => {
    // 1. Actualizar XP global
    if (usuario) {
      actualizarUsuario(prev => ({ 
        puntos_experiencia: (prev.puntos_experiencia || 0) + cantidad 
      }));
    }

    // 2. Crear notificación flotante en la posición del click
    if (e && e.clientX) {
      const id = Date.now();
      setNotificacionesXP(prev => [...prev, { id, x: e.clientX, y: e.clientY, cantidad }]);

      // Eliminar notificación después de la animación
      setTimeout(() => {
        setNotificacionesXP(prev => prev.filter(n => n.id !== id));
      }, 1500);
    }
  };

  const agregarItem = (tipo) => {
    if (!nuevoNombre.trim()) return;

    if (tipo === 'habito') {
      setHabitos([...habitos, { id: Date.now(), nombre: nuevoNombre, racha: 0, rachaAnterior: 0, estado: null, tipo: 'habito', fechaCreacion: Date.now(), frecuenciaSemanal: frecuenciaSeleccionada }]);
    } else if (tipo === 'diaria') {
      setDiarias([...diarias, { id: Date.now(), nombre: nuevoNombre, completada: false, racha: 0, fechaCreacion: Date.now() }]);
    } else if (tipo === 'tarea') {
      setTareas([...tareas, { id: Date.now(), nombre: nuevoNombre, completada: false, prioridad: nuevaPrioridad, fechaCreacion: Date.now() }]);
    }

    setNuevoNombre('');
    setNuevaPrioridad('media');
    setFrecuenciaSeleccionada(7);
    setSeccionActiva(null);
  };

  const esDeHoy = (fecha) => {
    if (!fecha) return false;
    const hoy = new Date();
    const fechaItem = new Date(fecha);
    return fechaItem.getDate() === hoy.getDate() &&
           fechaItem.getMonth() === hoy.getMonth() &&
           fechaItem.getFullYear() === hoy.getFullYear();
  };

  const eliminarItem = (id, tipo) => {
    if (tipo === 'habito') {
      const item = habitos.find(h => h.id === id);
      if (item && esDeHoy(item.fechaCreacion)) {
        if (item.estado === 'positivo') ganarXP(-10, null);
        if (item.estado === 'negativo') ganarXP(10, null);
      }
      setHabitos(habitos.filter(h => h.id !== id));
    }
    if (tipo === 'diaria') {
      const item = diarias.find(d => d.id === id);
      if (item && esDeHoy(item.fechaCreacion) && item.completada) ganarXP(-20, null);
      setDiarias(diarias.filter(d => d.id !== id));
    }
    if (tipo === 'tarea') {
      const item = tareas.find(t => t.id === id);
      if (item && esDeHoy(item.fechaCreacion) && item.completada) ganarXP(-30, null);
      setTareas(tareas.filter(t => t.id !== id));
    }
  };

  return (
    <div className="h-full w-full bg-neutral-50 overflow-y-auto custom-scrollbar p-6 relative">

      {/* Notificaciones Flotantes de XP */}
      <AnimatePresence>
        {notificacionesXP.map(nota => (
          <motion.div
            key={nota.id}
            initial={{ opacity: 1, y: nota.y - 20, x: nota.x - 20, scale: 0.5 }}
            animate={{ opacity: 0, y: nota.y - 100, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={`fixed z-[9999] font-black text-xl drop-shadow-md pointer-events-none ${nota.cantidad > 0 ? 'text-yellow-500' : 'text-red-500'}`}
          >
            {nota.cantidad > 0 ? '+' : ''}{nota.cantidad} XP
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header */}
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-[#2C4159] tracking-tight mb-1">
            Mis <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F99CC] to-[#C6A55E]">Hábitos</span>
          </h1>
          <p className="text-gray-500 font-medium">Forja tu mejor versión día tras día.</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">Mejor Racha</p>
              {(() => {
                const todos = [...habitos, ...diarias];
                const rachaMax = Math.max(0, ...todos.map(i => i.racha || 0));
                
                if (rachaMax === 0) {
                  return <p className="text-2xl font-black text-[#2C4159] leading-tight">0 Días</p>;
                }

                const mejores = todos.filter(i => i.racha === rachaMax);
                const nombresStr = mejores.length > 2 
                  ? `${mejores[0].nombre} y ${mejores.length - 1} más` 
                  : mejores.map(i => i.nombre).join(', ');

                return (
                  <div className="relative group cursor-help">
                    <p className="text-2xl font-black text-[#2C4159] leading-tight">{rachaMax} Días</p>
                    <p className="text-[10px] font-bold text-[#4F99CC] truncate max-w-[120px]">
                      {nombresStr}
                    </p>
                    
                    {/* Tooltip Custom Visual */}
                    <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-[100]">
                      <div className="bg-[#2C4159] text-white text-[10px] px-3 py-2 rounded-xl shadow-xl border border-white/10 backdrop-blur-sm min-w-[150px]">
                        <p className="font-bold border-b border-white/10 pb-1 mb-1 opacity-60 uppercase text-[8px]">En racha:</p>
                        {mejores.map((i, idx) => (
                          <div key={idx} className="flex items-center gap-2 py-0.5">
                            <div className="w-1 h-1 rounded-full bg-orange-400" />
                            <span>{i.nombre}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F99CC] to-[#C6A55E] flex items-center justify-center text-white shadow-md">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">Nivel {nivelActual}</p>
              <p className="text-xl font-black text-[#2C4159]">{xpActual} XP</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] rounded-full"
                  style={{ width: `${(xpActual % 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Grid de 3 Columnas (Estilo Habitica) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* COLUMNA 1: HÁBITOS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-[#2C4159] flex items-center gap-2">
              <Flame size={18} className="text-orange-500" /> Hábitos
            </h2>
            <button
              onClick={() => setSeccionActiva('habito')}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#4F99CC] hover:bg-[#4F99CC] hover:text-white transition-colors shadow-sm"
            >
              <Plus size={18} />
            </button>
          </div>

          <AnimatePresence>
            {seccionActiva === 'habito' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-3 rounded-2xl shadow-sm border border-[#4F99CC]/20"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Nuevo hábito..."
                  className="w-full bg-neutral-50 p-2 rounded-xl border-none focus:ring-2 focus:ring-[#4F99CC] outline-none text-sm mb-2"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && agregarItem('habito')}
                />
                <div className="flex justify-between items-center mb-3">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">Días/Semana:</p>
                   <div className="flex gap-1">
                     {[1, 2, 3, 4, 5, 6, 7].map(d => (
                       <button
                         key={d}
                         onClick={() => setFrecuenciaSeleccionada(d)}
                         className={`w-6 h-6 rounded-md text-[10px] font-bold transition-colors ${frecuenciaSeleccionada === d ? 'bg-[#4F99CC] text-white' : 'bg-gray-100 text-gray-400'}`}
                       >
                         {d}
                       </button>
                     ))}
                   </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setSeccionActiva(null)} className="text-xs font-bold text-gray-400 px-2 py-1">Cancelar</button>
                  <button onClick={() => agregarItem('habito')} className="text-xs font-bold bg-[#4F99CC] text-white px-3 py-1 rounded-lg">Añadir</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-3">
            {habitos.map(h => (
              <motion.div
                layout
                key={h.id}
                className={`bg-white group p-4 rounded-2xl shadow-sm border flex items-center justify-between hover:shadow-md transition-all border-l-4 ${h.estado === 'positivo' ? 'border-l-green-400 opacity-80' : h.estado === 'negativo' ? 'border-l-red-400 opacity-80' : 'border-l-[#4F99CC]'}`}
              >
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => eliminarItem(h.id, 'habito')}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className={`p-2 rounded-lg ${h.estado === 'positivo' ? 'bg-green-50 text-green-500' : h.estado === 'negativo' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    <Target size={18} />
                  </div>
                  <div>
                    <p className={`font-bold text-[#2C4159] leading-tight ${h.estado ? 'text-gray-500 line-through' : ''}`}>{h.nombre}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                         <div className="flex items-center gap-1">
                           <Flame size={12} className={h.racha > 0 ? 'text-orange-500' : 'text-gray-300'} />
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{h.racha} días</p>
                         </div>
                         {h.frecuenciaSemanal < 7 && (
                           <div className="flex items-center gap-1">
                             <Calendar size={12} className="text-[#4F99CC]" />
                             <p className="text-[10px] text-[#4F99CC] font-bold uppercase tracking-wider">{h.frecuenciaSemanal} d/sem</p>
                           </div>
                         )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        if (h.estado === 'positivo') {
                            // Deshacer positivo: volver a neutro y bajar racha
                            setHabitos(habitos.map(item => item.id === h.id ? { ...item, estado: null, racha: Math.max(0, item.racha - 1) } : item));
                            ganarXP(-10, e);
                        } else {
                            // Marcar positivo: si estaba en negativo, restauramos rachaAnterior antes de sumar
                            const rachaBase = h.estado === 'negativo' ? h.rachaAnterior : h.racha;
                            setHabitos(habitos.map(item => item.id === h.id ? { ...item, estado: 'positivo', racha: rachaBase + 1 } : item));
                            ganarXP(10, e);
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-transform active:scale-90 ${h.estado === 'positivo' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        if (h.estado === 'negativo') {
                            // Deshacer negativo: restaurar la racha que teníamos
                            setHabitos(habitos.map(item => item.id === h.id ? { ...item, estado: null, racha: item.rachaAnterior || 0 } : item));
                            ganarXP(10, e);
                        } else {
                            // Marcar negativo: guardar racha actual solo si venimos de neutro
                            const nuevaRachaAnterior = h.estado === 'positivo' ? Math.max(0, h.racha - 1) : h.racha;
                            setHabitos(habitos.map(item => item.id === h.id ? { ...item, estado: 'negativo', rachaAnterior: nuevaRachaAnterior, racha: 0 } : item));
                            ganarXP(-10, e);
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-transform active:scale-90 ${h.estado === 'negativo' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    >
                      <Minus size={16} />
                    </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* COLUMNA 2: DIARIAS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-[#2C4159] flex items-center gap-2">
              <Calendar size={18} className="text-[#C6A55E]" /> Diarias
            </h2>
            <button
              onClick={() => setSeccionActiva('diaria')}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#C6A55E] hover:bg-[#C6A55E] hover:text-white transition-colors shadow-sm"
            >
              <Plus size={18} />
            </button>
          </div>

          <AnimatePresence>
            {seccionActiva === 'diaria' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-3 rounded-2xl shadow-sm border border-[#C6A55E]/20"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Nueva diaria..."
                  className="w-full bg-neutral-50 p-2 rounded-xl border-none focus:ring-2 focus:ring-[#C6A55E] outline-none text-sm mb-2"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && agregarItem('diaria')}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setSeccionActiva(null)} className="text-xs font-bold text-gray-400 px-2 py-1">Cancelar</button>
                  <button onClick={() => agregarItem('diaria')} className="text-xs font-bold bg-[#C6A55E] text-white px-3 py-1 rounded-lg">Añadir</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-3">
            {diarias.map(d => (
              <motion.div
                layout
                key={d.id}
                className={`bg-white group p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all border-l-4 hover:shadow-md ${d.completada ? 'border-l-green-400 opacity-60' : 'border-l-[#C6A55E]'}`}
              >
                <button
                  onClick={(e) => {
                    const completando = !d.completada;
                    setDiarias(diarias.map(item => item.id === d.id ? { ...item, completada: completando, racha: completando ? (item.racha || 0) + 1 : Math.max(0, (item.racha || 0) - 1) } : item));
                    if (completando) {
                      ganarXP(20, e);
                    } else {
                      ganarXP(-20, e);
                    }
                  }}
                  className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${d.completada ? 'bg-green-500 border-green-500 text-white scale-90' : 'border-gray-300 text-transparent hover:border-[#C6A55E]'}`}
                >
                  <CheckCircle2 size={16} />
                </button>
                <div className="flex-1">
                  <p className={`font-bold text-[#2C4159] leading-tight ${d.completada ? 'line-through text-gray-400' : ''}`}>{d.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Flame size={12} className={d.racha > 0 ? 'text-orange-500' : 'text-gray-300'} />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{d.racha} días</p>
                  </div>
                </div>
                <button 
                  onClick={() => eliminarItem(d.id, 'diaria')}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* COLUMNA 3: TAREAS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-[#2C4159] flex items-center gap-2">
              <CheckSquare size={18} className="text-indigo-500" /> Pendientes
            </h2>
            <button
              onClick={() => setSeccionActiva('tarea')}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors shadow-sm"
            >
              <Plus size={18} />
            </button>
          </div>

          <AnimatePresence>
            {seccionActiva === 'tarea' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-3 rounded-2xl shadow-sm border border-indigo-500/20"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Nueva tarea..."
                  className="w-full bg-neutral-50 p-2 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm mb-2"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && agregarItem('tarea')}
                />
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setNuevaPrioridad('alta')} className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${nuevaPrioridad === 'alta' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>Alta</button>
                  <button onClick={() => setNuevaPrioridad('media')} className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${nuevaPrioridad === 'media' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>Media</button>
                  <button onClick={() => setNuevaPrioridad('baja')} className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${nuevaPrioridad === 'baja' ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>Baja</button>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setSeccionActiva(null)} className="text-xs font-bold text-gray-400 px-2 py-1">Cancelar</button>
                  <button onClick={() => agregarItem('tarea')} className="text-xs font-bold bg-indigo-500 text-white px-3 py-1 rounded-lg">Añadir</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-3">
            {tareas.map(t => (
              <motion.div
                layout
                key={t.id}
                className={`bg-white group p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all border-l-4 hover:shadow-md ${t.completada ? 'border-l-green-400 opacity-60' : 'border-l-indigo-500'}`}
              >
                <button
                  onClick={(e) => {
                    const completando = !t.completada;
                    if (completando) {
                      ganarXP(30, e);
                      // Borrar tarea al completarla
                      setTimeout(() => {
                        setTareas(prev => prev.filter(item => item.id !== t.id));
                      }, 500);
                    } else {
                      setTareas(tareas.map(item => item.id === t.id ? { ...item, completada: false } : item));
                      ganarXP(-30, e);
                    }
                  }}
                  className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${t.completada ? 'bg-green-500 border-green-500 text-white scale-90' : 'border-gray-300 text-transparent hover:border-indigo-500'}`}
                >
                  <CheckCircle2 size={16} />
                </button>
                <div className="flex-1">
                  <p className={`font-bold text-[#2C4159] leading-tight ${t.completada ? 'line-through text-gray-400' : ''}`}>{t.nombre}</p>
                  <span className={`inline-block mt-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${t.prioridad === 'alta' ? 'bg-red-100 text-red-600' :
                      t.prioridad === 'media' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                    }`}>
                    {t.prioridad}
                  </span>
                </div>
                <button 
                  onClick={() => eliminarItem(t.id, 'tarea')}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* Stats Section Bottom */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#4F99CC] to-[#2C4159] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2">Progreso hacia Lvl {nivelActual + 1}</h3>
            <p className="text-white/70 text-sm mb-6 max-w-xs">Te faltan {xpParaSiguienteNivel} XP para alcanzar el siguiente nivel. ¡Completa más tareas!</p>
            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(xpActual % 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-white"
              />
            </div>
          </div>
          <Zap className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10" />
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#C6A55E]/10 flex items-center justify-center text-[#C6A55E]">
              <Trophy size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#2C4159]">Ranked Mode</h3>
              <p className="text-gray-400 text-sm font-medium leading-tight mt-1">Acumula XP para competir en la tabla de clasificación semanal.</p>
            </div>
          </div>
          <button 
            onClick={() => setVistaActual('ranked')}
            className="w-full py-3 bg-[#2C4159] text-white rounded-2xl font-black text-sm hover:bg-[#1A2836] transition-colors shadow-md"
          >
            VER CLASIFICACIÓN
          </button>
        </div>
      </section>

    </div>
  );
};

export default PaginaHabitos;
