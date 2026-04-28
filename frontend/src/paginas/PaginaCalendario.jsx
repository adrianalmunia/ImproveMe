import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import * as servicioAPI from '../servicios/servicioAPI';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Moon, 
  Sun, 
  Wind, 
  Flame, 
  CheckCircle2,
  FileText,
  Smile,
  Meh,
  Frown,
  Zap,
  Music
} from 'lucide-react';

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

const DATOS_CURIOSOS = [
  "Los días que meditas sueles reportar un 20% más de felicidad. ¡Sigue así!",
  "Registrar tus emociones te ayuda a identificar patrones y mejorar tu bienestar a largo plazo.",
  "¿Sabías que beber agua al despertar activa tu metabolismo y mejora tu enfoque diario?",
  "La racha más larga registrada en ImproveMe es de 365 días. ¡Tú puedes superarlo!",
  "Dormir entre 7 y 8 horas aumenta tu productividad un 30% al día siguiente.",
  "Escribir tres cosas por las que estás agradecido reduce los niveles de cortisol.",
  "Las personas que planifican su día la noche anterior tienen un 40% más de éxito en sus tareas.",
  "Hacer ejercicio por la mañana libera endorfinas que te mantienen positivo todo el día.",
  "El cerebro humano tarda unos 21 días en empezar a automatizar un nuevo hábito.",
  "Tomar descansos de 5 minutos cada hora evita el agotamiento mental y mejora la creatividad.",
  "La música ambiental sin letra ayuda a mantener la concentración en tareas complejas.",
  "Mantener tu espacio de trabajo ordenado reduce la ansiedad y el estrés visual.",
  "Evitar las pantallas 30 minutos antes de dormir mejora significativamente la calidad del sueño.",
  "Las tareas más difíciles deben hacerse primero; es cuando tu fuerza de voluntad está al máximo.",
  "Sonreír, incluso si es forzado, envía señales al cerebro para reducir el estrés.",
  "El contacto con la naturaleza, aunque sea una planta en tu mesa, mejora el estado de ánimo.",
  "Aprender algo nuevo cada día mantiene el cerebro joven y previene el deterioro cognitivo.",
  "La técnica Pomodoro (25 min trabajo / 5 min descanso) es ideal para vencer la procrastinación.",
  "Hablar con un amigo o ser querido eleva los niveles de oxitocina y calma los nervios.",
  "Un pequeño progreso diario se suma para obtener resultados masivos a largo plazo."
];

const PaginaCalendario = () => {
  const { usuario, token } = useAutenticacion();
  
  const [fechaActual, setFechaActual] = useState(new Date());
  const [datosMes, setDatosMes] = useState({});
  const [estaCargando, setEstaCargando] = useState(true);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [datoAleatorio, setDatoAleatorio] = useState("");

  // Cambiar el dato curioso aleatoriamente cada vez que cambia el día seleccionado
  useEffect(() => {
    if (diaSeleccionado) {
      const indice = Math.floor(Math.random() * DATOS_CURIOSOS.length);
      setDatoAleatorio(DATOS_CURIOSOS[indice]);
    }
  }, [diaSeleccionado]);

  // Cargar datos del mes actual
  useEffect(() => {
    const cargarDatos = async () => {
      if (!usuario || !token) return;
      try {
        setEstaCargando(true);
        const mes = fechaActual.getMonth() + 1;
        const anio = fechaActual.getFullYear();
        const data = await servicioAPI.obtenerResumenCalendario(usuario.id, mes, anio, token);
        setDatosMes(data);
        
        // Seleccionar automáticamente hoy si es el mes actual
        const hoy = new Date();
        if (hoy.getMonth() === fechaActual.getMonth() && hoy.getFullYear() === fechaActual.getFullYear()) {
          const keyHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
          setDiaSeleccionado(keyHoy);
        }
      } catch (error) {
        console.error("Error al cargar datos del calendario:", error);
      } finally {
        setEstaCargando(false);
      }
    };
    cargarDatos();
  }, [fechaActual, usuario, token]);

  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(fechaActual.setMonth(fechaActual.getMonth() + direccion));
    setFechaActual(new Date(nuevaFecha));
    setDiaSeleccionado(null);
  };

  // Generar días del mes para el calendario
  const generarCalendario = () => {
    const primerDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const ultimoDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
    
    const dias = [];
    
    // Rellenar días del mes anterior
    const diaSemanaInicio = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1; // Ajustar a Lunes inicio
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push({ fecha: null, tipo: 'vacio' });
    }
    
    // Rellenar días del mes actual
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), d);
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
      dias.push({ 
        fecha, 
        clave, 
        datos: datosMes[clave] || null,
        esHoy: new Date().toDateString() === fecha.toDateString()
      });
    }
    
    return dias;
  };

  const obtenerColorAnimo = (puntos) => {
    if (!puntos) return 'bg-gray-100';
    const humor = humores.find(h => h.id === puntos);
    return humor ? `bg-[${humor.color}]/10` : 'bg-gray-100';
  };

  const renderIconoAnimo = (puntos, size = 14) => {
    const humor = humores.find(h => h.id === puntos);
    if (!humor) return null;
    return <img src={humor.imagen} alt={humor.label} className="object-cover rounded-full" style={{ width: size, height: size }} />;
  };

  const dias = generarCalendario();
  const infoDia = diaSeleccionado ? datosMes[diaSeleccionado] : null;

  return (
    <div className="h-full w-full bg-neutral-50 overflow-hidden flex flex-col md:flex-row p-6 gap-6">
      
      {/* SECCIÓN IZQUIERDA: CALENDARIO */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Calendario */}
        <header className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#2C4159] flex items-center gap-2">
              <CalendarIcon className="text-[#4F99CC]" />
              {fechaActual.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
            </h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Tu viaje personal en el tiempo</p>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => cambiarMes(-1)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => setFechaActual(new Date())} className="px-4 py-2 hover:bg-gray-50 rounded-xl text-xs font-black text-[#4F99CC] transition-colors uppercase">
              Hoy
            </button>
            <button onClick={() => cambiarMes(1)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>
        </header>

        {/* Grid de Días de la Semana */}
        <div className="grid grid-cols-7 border-b border-gray-50">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-tighter">
              {d}
            </div>
          ))}
        </div>

        {/* Grid del Calendario */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr relative">
          {estaCargando && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F99CC]" />
            </div>
          )}
          
          {dias.map((dia, idx) => (
            <div 
              key={idx} 
              onClick={() => dia.clave && setDiaSeleccionado(dia.clave)}
              className={`
                border-r border-b border-gray-50 p-2 min-h-[80px] transition-all cursor-pointer group
                ${!dia.fecha ? 'bg-gray-50/50' : 'hover:bg-[#4F99CC]/5'}
                ${diaSeleccionado === dia.clave ? 'bg-[#4F99CC]/10 ring-2 ring-inset ring-[#4F99CC]' : ''}
              `}
            >
              {dia.fecha && (
                <div className="h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-black ${dia.esHoy ? 'bg-[#4F99CC] text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-sm' : 'text-[#2C4159]'}`}>
                      {dia.fecha.getDate()}
                    </span>
                    {dia.datos?.diario && (
                      <div className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm">
                        {renderIconoAnimo(dia.datos.diario.animo, 20)}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {dia.datos?.habitos?.length > 0 && (
                      <div className="w-2 h-2 rounded-full bg-orange-400" title="Hábitos realizados" />
                    )}
                    {dia.datos?.meditación?.length > 0 && (
                      <div className="w-2 h-2 rounded-full bg-blue-400" title="Meditación" />
                    )}
                    {dia.datos?.diarias?.length > 0 && (
                      <div className="w-2 h-2 rounded-full bg-yellow-500" title="Tareas diarias" />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN DERECHA: DETALLES DEL DÍA */}
      <div className="w-full md:w-80 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
        <AnimatePresence mode="wait">
          {diaSeleccionado ? (
            <motion.div 
              key={diaSeleccionado}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-6 pb-4"
            >
              {/* Card de Resumen Diario */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-black text-[#2C4159] mb-1">
                  {new Date(diaSeleccionado + "T00:00:00").toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Resumen de actividad</p>

                {infoDia ? (
                  <div className="space-y-6">
                    {/* Animo y Sueño */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-neutral-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Ánimo</p>
                        <div className="text-[#2C4159] flex items-center gap-1">
                          {renderIconoAnimo(infoDia.diario?.animo, 16) || <div className="w-4 h-4 rounded-full bg-gray-200" />}
                          <span className="font-black">{infoDia.diario?.animo || '--'}/5</span>
                        </div>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Sueño</p>
                        <div className="text-[#2C4159] flex items-center gap-1">
                          <Moon size={14} className="text-blue-400" />
                          <span className="font-black">{infoDia.diario?.sueno || '--'}h</span>
                        </div>
                      </div>
                    </div>

                    {/* Hábitos y Diarias */}
                    <div className="space-y-4">
                      {infoDia.habitos?.some(h => h.estado === 'positivo') && (
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1">
                            <Flame size={12} className="text-orange-500" /> Hábitos cumplidos
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {infoDia.habitos.filter(h => h.estado === 'positivo').map(h => (
                              <span key={h.id} className="px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-lg border border-orange-100">
                                {h.nombre}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {infoDia.diarias?.some(d => d.completada) && (
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-yellow-500" /> Tareas completadas
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {infoDia.diarias.filter(d => d.completada).map(d => (
                              <span key={d.id} className="px-2 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-bold rounded-lg border border-yellow-100">
                                {d.nombre}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {infoDia.meditación?.length > 0 && (
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1">
                            <Wind size={12} className="text-blue-500" /> Meditación
                          </p>
                          {infoDia.meditación.map(m => (
                            <div key={m.id} className="bg-blue-50/50 p-2 rounded-xl flex items-center gap-2 mb-1">
                              <Music size={12} className="text-blue-500" />
                              <span className="text-[10px] font-bold text-blue-700">{Math.floor(m.duracion / 60)} min - {m.tecnica}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Texto del Diario */}
                    {infoDia.diario?.contenido && (
                      <div className="pt-4 border-t border-gray-50">
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1">
                          <FileText size={12} /> Reflexión del día
                        </p>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar bg-neutral-50 p-3 rounded-2xl border border-gray-100">
                          <p className="text-xs text-gray-600 leading-relaxed italic">
                            "{infoDia.diario.contenido}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
                    <Zap size={48} className="mb-4 text-gray-300" />
                    <p className="text-sm font-bold text-gray-400">Sin actividad registrada</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gradient-to-br from-[#4F99CC] to-[#2C4159] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
                <h3 className="text-lg font-black mb-1">Dato curioso</h3>
                <p className="text-[10px] text-white/70 mb-4 uppercase font-bold tracking-widest">Basado en tus registros</p>
                <p className="text-[11px] font-medium leading-tight z-10 relative pr-4">
                  {datoAleatorio}
                </p>
                <CalendarIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-dashed border-gray-200">
              <CalendarIcon size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold text-sm">Selecciona un día para ver los detalles de tu progreso</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PaginaCalendario;
