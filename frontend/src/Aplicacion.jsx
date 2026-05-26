// ================================================================================
// APLICACION.JSX - COMPONENTE RAÍZ DE LA APLICACIÓN
// ================================================================================
import { useState, useEffect } from 'react';
import { ProveedorAutenticacion, useAutenticacion } from './contextos/ContextoAutenticacion';
import { ProveedorTema } from './contextos/ContextoTema';
import { ProveedorIdioma } from './contextos/ContextoIdioma';
import Autenticacion from './paginas/Autenticacion';
import PaginaDiario from './paginas/PaginaDiario';
import PaginaRegistros from './paginas/PaginaRegistros';
import PaginaUsuario from './paginas/PaginaUsuario';
import PaginaMeditacion from './paginas/PaginaMeditacion';
import PaginaHabitos from './paginas/PaginaHabitos';
import PaginaRangos from './paginas/PaginaRangos';
import PaginaCalendario from './paginas/PaginaCalendario';
import PaginaEstadisticas from './paginas/PaginaEstadisticas';
import DiseñoPrincipal from './componentes/DiseñoPrincipal';
import { motion } from 'framer-motion';

import LandingPage from './paginas/LandingPage';

/**
 * Componente principal de la aplicación que gestiona las rutas privadas
 */
function ContenidoAplicacion() {
  const { usuario } = useAutenticacion();
  const [vistaActual, setVistaActual] = useState('diario');
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [modoAuth, setModoAuth] = useState('login'); // 'login' o 'registro'



  console.log("ContenidoAplicacion renderizando con usuario:", usuario?.nombre_usuario, "y vista:", vistaActual);

  // Si el usuario está autenticado, mostramos el diseño con la vista correspondiente
  if (usuario) {
    return (
      <DiseñoPrincipal vistaActual={vistaActual} setVistaActual={setVistaActual}>
        {vistaActual === 'diario' && <PaginaDiario />}
        {vistaActual === 'registros' && <PaginaRegistros />}
        {vistaActual === 'perfil' && <PaginaUsuario />}
        {vistaActual === 'meditacion' && <PaginaMeditacion />}
        {vistaActual === 'habitos' && <PaginaHabitos setVistaActual={setVistaActual} />}
        {vistaActual === 'ranked' && <PaginaRangos />}
        {vistaActual === 'calendario' && <PaginaCalendario />}
        {vistaActual === 'estadisticas' && <PaginaEstadisticas />}
        {!['diario', 'registros', 'perfil', 'meditacion', 'habitos', 'ranked', 'calendario', 'estadisticas'].includes(vistaActual) && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl text-gray-400 font-['Tilt_Warp']">Vista en construcción: {vistaActual}</p>
          </div>
        )}
      </DiseñoPrincipal>
    );
  }

  // Si NO está autenticado, mostramos primero la Landing Page
  if (!mostrarAuth) {
    return (
      <LandingPage 
        onIrAAutenticacion={(modo) => {
          setModoAuth(modo);
          setMostrarAuth(true);
        }} 
      />
    );
  }

  // Si el usuario decidió ir a Login/Registro desde la Landing
  return (
    <Autenticacion
      modoInicial={modoAuth}
      onAccesoExitoso={(u) => {
        console.log("Acceso exitoso:", u);
      }}
      onVolverALanding={() => setMostrarAuth(false)}
    />
  );
}

/**
 * Componente raíz que envuelve todo con el contexto
 */
export function Aplicacion() {
  return (
    <ProveedorIdioma>
      <ProveedorTema>
        <ProveedorAutenticacion>
          <ContenidoAplicacion />
        </ProveedorAutenticacion>
      </ProveedorTema>
    </ProveedorIdioma>
  );
}

export default Aplicacion;