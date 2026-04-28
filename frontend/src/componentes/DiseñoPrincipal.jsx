import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenLine, Library, BarChart2, ListTodo, Trophy, Calendar, User, Flower2 } from 'lucide-react';
import logoImproveMe from '../assets/logo_improveme.png';

// Iconos simplificados para el Sidebar usando Lucide React
const SidebarIcon = ({ Icon, label, active, onClick }) => (
  <div className="flex flex-col items-center mb-3 w-full">
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`w-11 h-11 rounded-[14px] flex items-center justify-center cursor-pointer mb-1 transition-all duration-300 ${active ? 'bg-gradient-to-tr from-[#4F99CC] to-[#C6A55E] text-white shadow-md' : 'bg-white/40 text-[#2C4159] hover:bg-white hover:text-[#4F99CC] shadow-sm hover:shadow-md border border-white/60'}`}
    >
      <Icon strokeWidth={2.5} size={20} />
    </motion.div>
    <span className={`text-[8px] font-black uppercase tracking-tighter text-center px-1 leading-none ${active ? 'text-[#4F99CC]' : 'text-gray-400'}`}>
      {label}
    </span>
  </div>
);

export function DiseñoPrincipal({ children, vistaActual, setVistaActual }) {
  console.log("Vista actual en Diseño:", vistaActual);

  return (
    <div className="h-screen w-full bg-neutral-100 flex flex-row font-['Inter'] overflow-hidden">

      {/* --- SIDEBAR LATERAL --- */}
      <aside className="w-24 h-screen bg-white shadow-[4px_0_24px_rgba(0,0,0,0.05)] border-r border-gray-100 flex flex-col items-center py-4 z-[100] shrink-0 overflow-y-auto custom-scrollbar">
        <div
          className="mb-8 w-16 h-16 rounded-full p-[2px] shadow-lg cursor-pointer hover:scale-105 transition-transform shrink-0"
          style={{ background: 'linear-gradient(135deg, #4F99CC 0%, #C6A55E 100%)' }}
          onClick={() => setVistaActual('diario')}
        >
          <div className="w-full h-full bg-white rounded-full overflow-hidden flex items-center justify-center p-1.5">
            <img src={logoImproveMe} alt="Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        <SidebarIcon
          Icon={PenLine}
          label="Entrada Diaria"
          active={vistaActual === 'diario'}
          onClick={() => setVistaActual('diario')}
        />
        <SidebarIcon
          Icon={Library}
          label="Registros"
          active={vistaActual === 'registros'}
          onClick={() => setVistaActual('registros')}
        />
        <SidebarIcon Icon={BarChart2} label="Estadísticas" active={vistaActual === 'estadisticas'} onClick={() => setVistaActual('estadisticas')} />
        <SidebarIcon Icon={ListTodo} label="Hábitos" active={vistaActual === 'habitos'} onClick={() => setVistaActual('habitos')} />
        <SidebarIcon Icon={Trophy} label="Ranked" active={vistaActual === 'ranked'} onClick={() => setVistaActual('ranked')} />
        <SidebarIcon Icon={Calendar} label="Calendario" active={vistaActual === 'calendario'} onClick={() => setVistaActual('calendario')} />
        <SidebarIcon Icon={Flower2} label="Meditación" active={vistaActual === 'meditacion'} onClick={() => setVistaActual('meditacion')} />

        <div className="mt-auto">
          <SidebarIcon Icon={User} label="Usuario" active={vistaActual === 'perfil'} onClick={() => setVistaActual('perfil')} />
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 h-screen overflow-hidden relative z-10">
        {children}
      </div>
    </div>
  );
}

export default DiseñoPrincipal;
