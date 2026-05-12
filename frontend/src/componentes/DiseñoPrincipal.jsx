import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenLine, Library, BarChart2, ListTodo, Trophy, Calendar, User, Flower2 } from 'lucide-react';
import logoImproveMe from '../assets/logo_improveme.png';
import { useIdioma } from '../contextos/ContextoIdioma';

// Iconos simplificados para el Sidebar usando Lucide React
const SidebarIcon = ({ Icon, label, active, onClick }) => (
  <div className="flex flex-col items-center mb-3 w-full">
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
      className={`w-11 h-11 rounded-[14px] flex items-center justify-center cursor-pointer mb-1 transition-all duration-300 outline-none focus:ring-2 focus:ring-[#4F99CC] focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${active ? 'bg-gradient-to-tr from-[#4F99CC] to-[#C6A55E] text-white shadow-md' : 'bg-white/40 dark:bg-gray-700/50 text-[#2C4159] dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:text-[#4F99CC] dark:hover:text-[#4F99CC] shadow-sm hover:shadow-md border border-white/60 dark:border-gray-600/50'}`}
    >
      <Icon strokeWidth={2.5} size={20} />
    </motion.button>
    <span className={`text-[8px] font-black uppercase tracking-tighter text-center px-1 leading-none transition-colors duration-300 ${active ? 'text-[#4F99CC]' : 'text-gray-400 dark:text-gray-500'}`}>
      {label}
    </span>
  </div>
);

const MobileNavButton = ({ Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 outline-none focus:ring-2 focus:ring-[#4F99CC] ${active ? 'text-[#4F99CC]' : 'text-gray-400 dark:text-gray-500'}`}
  >
    <Icon strokeWidth={2.5} size={20} className={active ? 'text-[#4F99CC]' : ''} />
    <span className={`text-[8px] font-black uppercase tracking-tighter leading-none ${active ? 'text-[#4F99CC]' : 'text-gray-400 dark:text-gray-500'}`}>
      {label}
    </span>
    {active && <div className="w-1 h-1 rounded-full bg-[#4F99CC] mt-0.5" />}
  </button>
);

export function DiseñoPrincipal({ children, vistaActual, setVistaActual }) {
  const { t } = useIdioma();
  console.log("Vista actual en Diseño:", vistaActual);

  return (
    <div className="h-screen w-full bg-neutral-100 dark:bg-gray-900 flex flex-col md:flex-row font-['Inter'] overflow-hidden transition-colors duration-300">

      {/* --- SIDEBAR LATERAL (desktop) --- */}
      <aside className="hidden md:flex w-24 h-screen bg-white dark:bg-gray-800 shadow-[4px_0_24px_rgba(0,0,0,0.05)] border-r border-gray-100 dark:border-gray-700 flex-col items-center py-4 z-[100] shrink-0 overflow-y-auto custom-scrollbar transition-colors duration-300">
        <button
          className="mb-8 w-16 h-16 rounded-full p-[2px] shadow-lg hover:scale-105 transition-transform shrink-0 outline-none focus:ring-2 focus:ring-[#4F99CC] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          style={{ background: 'linear-gradient(135deg, #4F99CC 0%, #C6A55E 100%)' }}
          onClick={() => setVistaActual('diario')}
          aria-label="Ir a Inicio"
        >
          <div className="w-full h-full bg-white rounded-full overflow-hidden flex items-center justify-center p-1.5 transition-colors duration-300">
            <img src={logoImproveMe} alt="Logo" className="w-full h-full object-contain" />
          </div>
        </button>

        <SidebarIcon
          Icon={PenLine}
          label={t('nav_diario')}
          active={vistaActual === 'diario'}
          onClick={() => setVistaActual('diario')}
        />
        <SidebarIcon
          Icon={Library}
          label={t('nav_registros')}
          active={vistaActual === 'registros'}
          onClick={() => setVistaActual('registros')}
        />
        <SidebarIcon Icon={BarChart2} label={t('nav_estadisticas')} active={vistaActual === 'estadisticas'} onClick={() => setVistaActual('estadisticas')} />
        <SidebarIcon Icon={ListTodo} label={t('nav_habitos')} active={vistaActual === 'habitos'} onClick={() => setVistaActual('habitos')} />
        <SidebarIcon Icon={Trophy} label={t('nav_ranked')} active={vistaActual === 'ranked'} onClick={() => setVistaActual('ranked')} />
        <SidebarIcon Icon={Calendar} label={t('nav_calendario')} active={vistaActual === 'calendario'} onClick={() => setVistaActual('calendario')} />
        <SidebarIcon Icon={Flower2} label={t('nav_meditacion')} active={vistaActual === 'meditacion'} onClick={() => setVistaActual('meditacion')} />

        <div className="mt-auto">
          <SidebarIcon Icon={User} label={t('nav_usuario')} active={vistaActual === 'perfil'} onClick={() => setVistaActual('perfil')} />
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 h-screen overflow-hidden relative z-10 pb-[4.5rem] md:pb-0">
        {children}
      </div>

      {/* --- BOTTOM NAV (mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[200] bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] flex items-center justify-around px-2 py-2 transition-colors duration-300">
        <MobileNavButton Icon={PenLine} label={t('nav_diario')} active={vistaActual === 'diario'} onClick={() => setVistaActual('diario')} />
        <MobileNavButton Icon={Library} label={t('nav_registros')} active={vistaActual === 'registros'} onClick={() => setVistaActual('registros')} />
        <MobileNavButton Icon={BarChart2} label={t('nav_estadisticas')} active={vistaActual === 'estadisticas'} onClick={() => setVistaActual('estadisticas')} />
        <MobileNavButton Icon={ListTodo} label={t('nav_habitos')} active={vistaActual === 'habitos'} onClick={() => setVistaActual('habitos')} />
        <MobileNavButton Icon={Trophy} label={t('nav_ranked')} active={vistaActual === 'ranked'} onClick={() => setVistaActual('ranked')} />
        <MobileNavButton Icon={Calendar} label={t('nav_calendario')} active={vistaActual === 'calendario'} onClick={() => setVistaActual('calendario')} />
        <MobileNavButton Icon={User} label={t('nav_usuario')} active={vistaActual === 'perfil'} onClick={() => setVistaActual('perfil')} />
      </nav>
    </div>
  );
}

export default DiseñoPrincipal;
