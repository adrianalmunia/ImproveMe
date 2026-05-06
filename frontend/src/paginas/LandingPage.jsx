import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Target, 
  BarChart2, 
  Flower2, 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  MessageSquare,
  Trophy,
  Moon,
  Smile
} from 'lucide-react';
import logoCompleto from '../assets/logo_completo.png';
import logoImproveMe from '../assets/logo_improveme.png';

const LandingPage = ({ onIrAAutenticacion }) => {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const features = [
    {
      icon: <Smile className="text-blue-500" size={24} />,
      title: "Registro de Ánimo",
      description: "Entiende tus emociones con nuestro sistema de journaling visual y seguimiento de humor diario."
    },
    {
      icon: <Target className="text-amber-500" size={24} />,
      title: "Hábitos Gamificados",
      description: "Gana XP, sube de nivel y compite en el ranking global mientras forjas tu disciplina."
    },
    {
      icon: <BarChart2 className="text-indigo-500" size={24} />,
      title: "Estadísticas Avanzadas",
      description: "Descubre correlaciones entre tu sueño, tus hábitos y tu bienestar emocional con gráficos interactivos."
    },
    {
      icon: <Flower2 className="text-teal-500" size={24} />,
      title: "Meditación y Mindfulness",
      description: "Sesiones guiadas y sonidos ambiente para reducir el estrés y mejorar tu enfoque."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6F5F7] dark:bg-gray-900 font-['Inter'] selection:bg-blue-100 selection:text-blue-600 transition-colors duration-300 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImproveMe} alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-['Tilt_Warp'] text-[#2C4159] dark:text-white transition-colors duration-300">ImproveMe</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onIrAAutenticacion('login')}
              className="px-6 py-2 text-sm font-bold text-[#2C4159] dark:text-gray-300 hover:text-blue-500 transition-colors"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => onIrAAutenticacion('registro')}
              className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-all active:scale-95"
            >
              Empezar Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 p-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-amber-500/10 border border-blue-200 dark:border-gray-700"
          >
            <span className="px-4 py-1 text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Transformación 2.0</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-['Tilt_Warp'] text-[#2C4159] dark:text-white leading-[1.1] mb-8 transition-colors duration-300"
          >
            Desbloquea tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-amber-500">Mejor Versión</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-12 font-medium transition-colors duration-300"
          >
            La aplicación todo-en-uno que combina psicología, gamificación y análisis de datos para ayudarte a construir una vida más plena y productiva.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button 
              onClick={() => onIrAAutenticacion('registro')}
              className="px-10 py-5 bg-[#4F99CC] text-white rounded-3xl font-black text-lg shadow-2xl shadow-blue-200 dark:shadow-blue-900/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-3"
            >
              Comenzar Ahora <ArrowRight size={24} />
            </button>
            <button className="px-10 py-5 bg-white dark:bg-gray-800 text-[#2C4159] dark:text-white rounded-3xl font-black text-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
              Ver Demo
            </button>
          </motion.div>

          {/* Preview Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 w-full max-w-5xl relative"
          >
            <div className="relative z-10 p-2 rounded-[40px] bg-gradient-to-b from-gray-200 to-white dark:from-gray-700 dark:to-gray-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]">
              <div className="bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden aspect-video relative group">
                <div className="absolute inset-0 bg-neutral-100 dark:bg-gray-900 flex items-center justify-center">
                  {/* Mockup Content */}
                  <div className="w-full h-full p-8 grid grid-cols-12 gap-6 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="col-span-3 space-y-4">
                      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                      <div className="h-40 w-full bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800"></div>
                      <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                    </div>
                    <div className="col-span-6 space-y-4">
                      <div className="h-64 w-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center">
                        <BarChart2 className="text-blue-500/20" size={64} />
                      </div>
                      <div className="h-24 w-full bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800"></div>
                    </div>
                    <div className="col-span-3 space-y-4">
                      <div className="h-48 w-full bg-teal-50 dark:bg-teal-900/20 rounded-2xl border border-teal-100 dark:border-teal-800"></div>
                      <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                    </div>
                  </div>
                  {/* Overlay text */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white/10 dark:bg-black/10 backdrop-blur-[2px]">
                    <div className="p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-white dark:border-gray-700 text-center scale-110">
                      <img src={logoCompleto} alt="Logo" className="h-12 mx-auto mb-4" />
                      <p className="font-bold text-[#2C4159] dark:text-white text-lg">Tu Dashboard Personalizado</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/5 blur-[120px] rounded-full -z-10"></div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-white dark:bg-gray-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-['Tilt_Warp'] text-[#2C4159] dark:text-white mb-6">Todo lo que necesitas</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">Diseñado meticulosamente para que cada interacción sea un paso hacia tu objetivo.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="p-8 bg-[#F6F5F7] dark:bg-gray-900 rounded-[32px] border border-transparent hover:border-blue-200 dark:hover:border-blue-900 transition-all group"
              >
                <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-[#2C4159] dark:text-white mb-4 transition-colors">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium transition-colors">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Preview Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-8">
              <BarChart2 size={16} /> Inteligencia de Datos
            </div>
            <h2 className="text-4xl md:text-5xl font-['Tilt_Warp'] text-[#2C4159] dark:text-white leading-tight mb-8">Tus datos cuentan una <span className="text-blue-500">historia</span></h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 font-medium">
              ¿Sabías que tu productividad aumenta un 40% cuando duermes más de 7 horas? O que meditar por la mañana reduce tu ansiedad nocturna. 
              ImproveMe analiza tus registros y te da insights accionables.
            </p>
            
            <ul className="space-y-6">
              {[
                "Mapas de correlación hábito-ánimo",
                "Seguimiento de racha de meditación",
                "Análisis de calidad del sueño",
                "Predicción de estados emocionales"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#2C4159] dark:text-gray-300 font-bold">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                    <CheckCircle2 size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-700 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <p className="font-black text-[#2C4159] dark:text-white uppercase tracking-widest text-xs">Bienestar Semanal</p>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
              </div>
              
              <div className="h-64 flex items-end justify-between gap-4">
                {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3">
                    <motion.div 
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`w-full rounded-t-xl ${i === 6 ? 'bg-gradient-to-b from-blue-400 to-blue-600' : 'bg-gray-100 dark:bg-gray-700'}`}
                    />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">¡Nivel Superado!</p>
                  <p className="text-sm font-bold text-[#2C4159] dark:text-white leading-tight">Has ganado 250 XP esta semana</p>
                </div>
              </div>
            </div>
            
            {/* Floating element */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 p-6 bg-amber-500 text-white rounded-3xl shadow-2xl z-20"
            >
              <Trophy size={32} />
              <p className="text-xs font-black mt-2">Rank #4</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="py-32 bg-black text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-['Tilt_Warp'] mb-8">Mejora en la <span className="text-amber-500">Vida Real</span></h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto font-medium">
              Trata tu vida como un RPG. Completa tus hábitos diarios, sube de nivel y desbloquea rangos. 
              Desde "Novato" hasta "Maestro de Vida", el camino es tuyo.
            </p>
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-20">
             {['Hierro', 'Bronce', 'Plata', 'Oro', 'Platino', 'Diamante', 'Maestro'].map((rank, i) => (
               <div key={i} className="px-6 py-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full ${[
                   'bg-gray-500', 'bg-orange-800', 'bg-gray-300', 'bg-yellow-400', 'bg-teal-400', 'bg-blue-400', 'bg-purple-500'
                 ][i]}`}></div>
                 <span className="font-black uppercase tracking-widest text-xs">{rank}</span>
               </div>
             ))}
          </div>
          
          <button 
            onClick={() => onIrAAutenticacion('registro')}
            className="px-12 py-6 bg-white text-black rounded-full font-black text-xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] active:scale-95"
          >
            Únete a la competición
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <img src={logoImproveMe} alt="Logo" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-['Tilt_Warp'] text-[#2C4159] dark:text-white">ImproveMe</span>
            </div>
            
            <div className="flex gap-10">
              <a href="#" className="text-gray-400 hover:text-blue-500 font-bold transition-colors">Privacidad</a>
              <a href="#" className="text-gray-400 hover:text-blue-500 font-bold transition-colors">Términos</a>
              <a href="#" className="text-gray-400 hover:text-blue-500 font-bold transition-colors">Contacto</a>
            </div>
            
            <p className="text-gray-400 font-medium text-sm">© 2026 ImproveMe. Hecho para tu mejor versión.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
