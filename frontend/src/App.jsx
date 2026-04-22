// ================================================================================
// APP.JSX - COMPONENTE RAÍZ DE LA APLICACIÓN
// ================================================================================
import { ProveedorAutenticacion, useAutenticacion } from './contextos/ContextoAutenticacion';
import Autenticacion from './paginas/Autenticacion';
import PaginaDiario from './paginas/PaginaDiario';
import { motion } from 'framer-motion';

/**
 * Componente principal de la aplicación que gestiona las rutas privadas
 */
function ContenidoApp() {
  const { usuario } = useAutenticacion();

  // Si el usuario está autenticado, mostramos la página de Registro Diario
  if (usuario) {
    return <PaginaDiario />;
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