// ================================================================================
// PÁGINA: LOGIN (INICIAR SESIÓN)
// ================================================================================
// Componente para que usuarios registrados inicien sesión.

import { useState } from 'react';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import CampoFormulario from '../componentes/CampoFormulario';
import Boton from '../componentes/Boton';
import '../estilos/PaginaLogin.css';

/**
 * Página de login
 * @param {function} onLoginExitoso - Callback cuando el login es exitoso
 */
export function PaginaLogin({ onLoginExitoso = () => {} }) {
    // Obtenemos la función login del contexto
    const { login, estaCargando, error } = useAutenticacion();

    // Estados del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorLocal, setErrorLocal] = useState('');

    /**
     * Maneja el envío del formulario de login
     */
    async function manejarEnvio(evento) {
        evento.preventDefault();
        setErrorLocal('');

        try {
            // Validación básica
            if (!email || !password) {
                setErrorLocal('Email y contraseña son obligatorios');
                return;
            }

            // Llamamos a la función login del contexto
            const usuario = await login(email, password);

            // Si todo va bien, ejecutamos el callback
            onLoginExitoso(usuario);
        } catch (err) {
            // Mostramos el error
            setErrorLocal(err.message || 'Error al iniciar sesión');
        }
    }

    return (
        <div className="pagina-login">
            <div className="contenedor-login">
                {/* Título */}
                <h1 className="titulo-login">
                    ¡Bienvenido de vuelta!
                </h1>

                <p className="subtitulo-login">
                    Identifícate para continuar cuidando tu bienestar
                </p>

                {/* Formulario */}
                <form onSubmit={manejarEnvio} className="formulario-login">
                    {/* Mensajes de error */}
                    {(errorLocal || error) && (
                        <div className="mensaje-error">
                            <span className="icono-error">⚠️</span>
                            <span>{errorLocal || error}</span>
                        </div>
                    )}

                    {/* Campo Email */}
                    <CampoFormulario
                        etiqueta="Email"
                        tipo="email"
                        valor={email}
                        onChange={setEmail}
                        placeholder="tu@email.com"
                        requerido
                        id="email-login"
                    />

                    {/* Campo Contraseña */}
                    <CampoFormulario
                        etiqueta="Contraseña"
                        tipo="password"
                        valor={password}
                        onChange={setPassword}
                        placeholder="••••••••"
                        requerido
                        id="password-login"
                    />

                    {/* Botón Enviar */}
                    <Boton
                        texto="Iniciar Sesión"
                        tipo="submit"
                        estaCargando={estaCargando}
                        icono="🚀"
                    />
                </form>

                {/* Enlace a registro */}
                <p className="enlace-registro">
                    ¿No tienes cuenta? 
                    <a href="#registro" onClick={(e) => {
                        e.preventDefault();
                        // Aquí iría la lógica para ir a registro
                    }}>
                        Regístrate aquí
                    </a>
                </p>
            </div>
        </div>
    );
}

export default PaginaLogin;
