// ================================================================================
// APP.JSX - COMPONENTE RAÍZ DE LA APLICACIÓN
// ================================================================================
import { useState } from 'react';
import { ProveedorAutenticacion, useAutenticacion } from './contextos/ContextoAutenticacion';
import Autenticacion from './paginas/Autenticacion';
import PaginaDiario from './paginas/PaginaDiario';
import PaginaRegistros from './paginas/PaginaRegistros';
import PaginaUsuario from './paginas/PaginaUsuario';
import LayoutPrincipal from './componentes/LayoutPrincipal';
import { motion } from 'framer-motion';

/**
 * Componente principal de la aplicación que gestiona las rutas privadas
 */
function ContenidoApp() {
  const { usuario } = useAutenticacion();
  const [vistaActual, setVistaActual] = useState('diario');

  console.log("ContenidoApp renderizando con usuario:", usuario?.nombre_usuario, "y vista:", vistaActual);

  // Si el usuario está autenticado, mostramos el layout con la vista correspondiente
  if (usuario) {
    return (
      <LayoutPrincipal vistaActual={vistaActual} setVistaActual={setVistaActual}>
        {vistaActual === 'diario' && <PaginaDiario />}
        {vistaActual === 'registros' && <PaginaRegistros />}
        {vistaActual === 'perfil' && <PaginaUsuario />}
        {vistaActual !== 'diario' && vistaActual !== 'registros' && vistaActual !== 'perfil' && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl text-gray-400 font-['Tilt_Warp']">Vista en construcción: {vistaActual}</p>
          </div>
        )}
      </LayoutPrincipal>
    );
  }

  // Si NO está autenticado, mostramos la pantalla de Login/Registro unificada.
  // IMPORTANTE: Quitamos el 'if (estaCargando)' de aquí arriba para que 
  // el componente Autenticacion no se desmonte al registrarse.
  return (
    <Autenticacion 
      onAccesoExitoso={(u) => {
        console.log("Acceso exitoso:", u);
      }}
    />
  );
}

/**
 * Componente raíz que envuelve todo con el contexto
 */
export function App() {
  return (
    <ProveedorAutenticacion>
      <ContenidoApp />
    </ProveedorAutenticacion>
  );
}

export default App;