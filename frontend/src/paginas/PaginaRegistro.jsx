// ================================================================================
// PÁGINA: REGISTRO (CREAR CUENTA)
// ================================================================================
// Componente para que nuevos usuarios se registren en la aplicación.

import { useState } from 'react';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import CampoFormulario from '../componentes/CampoFormulario';
import Boton from '../componentes/Boton';
import '../estilos/PaginaRegistro.css';

/**
 * Página de registro
 * @param {function} onRegistroExitoso - Callback cuando el registro es exitoso
 */
export function PaginaRegistro({ onRegistroExitoso = () => {} }) {
    // Obtenemos la función registrar del contexto
    const { registrar, estaCargando, error } = useAutenticacion();

    // Estados del formulario
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmar, setPasswordConfirmar] = useState('');
    const [errorLocal, setErrorLocal] = useState('');

    /**
     * Maneja el envío del formulario de registro
     */
    async function manejarEnvio(evento) {
        evento.preventDefault();
        setErrorLocal('');

        try {
            // Validación básica
            if (!nombreUsuario || !email || !password) {
                setErrorLocal('Todos los campos son obligatorios');
                return;
            }

            if (password.length < 8) {
                setErrorLocal('La contraseña debe tener al menos 8 caracteres');
                return;
            }

            if (password !== passwordConfirmar) {
                setErrorLocal('Las contraseñas no coinciden');
                return;
            }

            // Llamamos a la función registrar del contexto
            const usuario = await registrar(nombreUsuario, email, password);

            // Si todo va bien, ejecutamos el callback
            onRegistroExitoso(usuario);
        } catch (err) {
            // Mostramos el error
            setErrorLocal(err.message || 'Error al registrarse');
        }
    }

    return (
        <div className="pagina-registro">
            <div className="contenedor-registro">
                {/* Título */}
                <h1 className="titulo-registro">
                    ¡Empieza tu viaje hoy!
                </h1>

                <p className="subtitulo-registro">
                    Crea tu cuenta en ImproveMe y comienza a cuidar tu bienestar
                </p>

                {/* Formulario */}
                <form onSubmit={manejarEnvio} className="formulario-registro">
                    {/* Mensajes de error */}
                    {(errorLocal || error) && (
                        <div className="mensaje-error">
                            <span className="icono-error">⚠️</span>
                            <span>{errorLocal || error}</span>
                        </div>
                    )}

                    {/* Campo Nombre de Usuario */}
                    <CampoFormulario
                        etiqueta="Nombre de Usuario"
                        tipo="text"
                        valor={nombreUsuario}
                        onChange={setNombreUsuario}
                        placeholder="tu_nombre_usuario"
                        requerido
                        id="nombre-usuario-registro"
                    />

                    {/* Campo Email */}
                    <CampoFormulario
                        etiqueta="Email"
                        tipo="email"
                        valor={email}
                        onChange={setEmail}
                        placeholder="tu@email.com"
                        requerido
                        id="email-registro"
                    />

                    {/* Campo Contraseña */}
                    <CampoFormulario
                        etiqueta="Contraseña"
                        tipo="password"
                        valor={password}
                        onChange={setPassword}
                        placeholder="Mínimo 8 caracteres"
                        requerido
                        id="password-registro"
                    />

                    {/* Campo Confirmar Contraseña */}
                    <CampoFormulario
                        etiqueta="Confirmar Contraseña"
                        tipo="password"
                        valor={passwordConfirmar}
                        onChange={setPasswordConfirmar}
                        placeholder="Repite tu contraseña"
                        requerido
                        id="password-confirmar-registro"
                    />

                    {/* Botón Enviar */}
                    <Boton
                        texto="Crear Cuenta"
                        tipo="submit"
                        estaCargando={estaCargando}
                        icono="✨"
                    />
                </form>

                {/* Enlace a login */}
                <p className="enlace-login">
                    ¿Ya tienes cuenta? 
                    <a href="#login" onClick={(e) => {
                        e.preventDefault();
                        // Aquí iría la lógica para ir a login
                    }}>
                        Inicia sesión
                    </a>
                </p>
            </div>
        </div>
    );
}

export default PaginaRegistro;
