// ================================================================================
// APP.JSX - COMPONENTE RAÍZ DE LA APLICACIÓN
// ================================================================================
// Este es el punto de entrada de la aplicación React.
// Aquí establecemos el contexto de autenticación y gestionamos
// la navegación entre diferentes vistas (login, registro, dashboard, etc.).

import { useState } from 'react';
import { ProveedorAutenticacion, useAutenticacion } from './contextos/ContextoAutenticacion';
import PaginaLogin from './paginas/PaginaLogin';
import PaginaRegistro from './paginas/PaginaRegistro';
import './App.css';

/**
 * Componente principal de la aplicación
 * NOTA: Este componente DEBE estar dentro de ProveedorAutenticacion
 */
function ContenidoApp() {
  // Obtenemos estado del contexto de autenticación
  const { estaAutenticado, estaCargando, usuario } = useAutenticacion();

  // Estado local: qué vista mostrar (login o registro)
  const [vistaActual, setVistaActual] = useState('login');

  // Mientras está cargando, mostramos un spinner
  if (estaCargando) {
    return (
      <div className="contenedor-carga">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si el usuario está autenticado, mostramos un mensaje de bienvenida
  // (PRÓXIMA: crear dashboard)
  if (estaAutenticado) {
    return (
      <div className="contenedor-autenticado">
        <h1>¡Bienvenido, {usuario?.username}! 🎉</h1>
        <p>Dashboard próximamente...</p>
      </div>
    );
  }

  // Si NO está autenticado, mostramos login o registro
  return (
    <div className="contenedor-autenticacion">
      {vistaActual === 'login' ? (
        <PaginaLogin
          onLoginExitoso={() => {
            // Cuando login es exitoso, redirigimos a dashboard
            // Por ahora, simplemente mostramos el mensaje anterior
          }}
        />
      ) : (
        <PaginaRegistro
          onRegistroExitoso={() => {
            // Cuando registro es exitoso, redirigimos a dashboard
            // Por ahora, simplemente mostramos el mensaje anterior
          }}
        />
      )}

      {/* Botón para cambiar entre login y registro */}
      <button
        className="boton-cambiar-vista"
        onClick={() => setVistaActual(vistaActual === 'login' ? 'registro' : 'login')}
      >
        {vistaActual === 'login'
          ? '¿No tienes cuenta? Regístrate'
          : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </div>
  );
}

/**
 * Componente raíz que envuelve todo con el contexto
 */
export function App() {
  return (
    <ProveedorAutenticacion hijos={<ContenidoApp />} />
  );
}

export default App;