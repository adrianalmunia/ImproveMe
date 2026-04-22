// ================================================================================
// CONTEXTO DE AUTENTICACIÓN
// ================================================================================
// Este contexto mantiene el estado global de la autenticación.
// Esto permite que cualquier componente acceda al usuario actual sin
// tener que pasar props de arriba hacia abajo (prop drilling).

import { createContext, useState, useContext, useEffect } from 'react';
import * as servicioAPI from '../servicios/servicioAPI';

// Creamos el contexto
const ContextoAutenticacion = createContext(null);

/**
 * Proveedor de contexto de autenticación
 * Envuelve la app para que todos los componentes accedan al estado de autenticación
 */
export function ProveedorAutenticacion({ children }) {
    // Estado: usuario autenticado
    const [usuario, setUsuario] = useState(null);

    // Estado: token JWT
    const [token, setToken] = useState(null);

    // Estado: está cargando (para mostrar spinners)
    const [estaCargando, setEstaCargando] = useState(true);

    // Estado: mensajes de error
    const [error, setError] = useState(null);

    // Al montar el componente, cargamos datos del localStorage
    // (en caso de que el usuario haya estado autenticado previamente)
    useEffect(() => {
        const tokenGuardado = localStorage.getItem('tokenAutenticacion');
        const usuarioGuardado = localStorage.getItem('usuarioAutenticacion');

        if (tokenGuardado && usuarioGuardado) {
            try {
                setToken(tokenGuardado);
                setUsuario(JSON.parse(usuarioGuardado));
            } catch (err) {
                console.error('Error al cargar datos guardados:', err);
                limpiarAutenticacion();
            }
        }

        setEstaCargando(false);
    }, []);

    /**
     * Registra un nuevo usuario
     * @param {string} nombreUsuario
     * @param {string} email
     * @param {string} password
     */
    async function registrar(nombreUsuario, email, password) {
        try {
            setError(null);
            setEstaCargando(true);

            // Llamamos al servicio de API
            const { usuario: nuevoUsuario, token: nuevoToken } = 
                await servicioAPI.registrarUsuario(nombreUsuario, email, password);

            // Guardamos el token y usuario en estado
            setToken(nuevoToken);
            setUsuario(nuevoUsuario);

            // Guardamos también en localStorage para persistencia
            localStorage.setItem('tokenAutenticacion', nuevoToken);
            localStorage.setItem('usuarioAutenticacion', JSON.stringify(nuevoUsuario));

            return nuevoUsuario;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setEstaCargando(false);
        }
    }

    /**
     * Inicia sesión con email y contraseña
     * @param {string} email
     * @param {string} password
     */
    async function login(email, password) {
        try {
            setError(null);
            setEstaCargando(true);

            // Llamamos al servicio de API
            const { usuario: usuarioLogin, token: tokenLogin } = 
                await servicioAPI.iniciarSesion(email, password);

            // Guardamos el token y usuario en estado
            setToken(tokenLogin);
            setUsuario(usuarioLogin);

            // Guardamos también en localStorage para persistencia
            localStorage.setItem('tokenAutenticacion', tokenLogin);
            localStorage.setItem('usuarioAutenticacion', JSON.stringify(usuarioLogin));

            return usuarioLogin;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setEstaCargando(false);
        }
    }

    /**
     * Cierra sesión eliminando el usuario y token
     */
    function logout() {
        setUsuario(null);
        setToken(null);
        setError(null);

        // Limpiamos localStorage
        localStorage.removeItem('tokenAutenticacion');
        localStorage.removeItem('usuarioAutenticacion');
    }

    /**
     * Limpia el estado de autenticación
     */
    function limpiarAutenticacion() {
        setUsuario(null);
        setToken(null);
        localStorage.removeItem('tokenAutenticacion');
        localStorage.removeItem('usuarioAutenticacion');
    }

    // Valor que pasamos a todos los componentes
    const valor = {
        usuario,
        token,
        estaCargando,
        error,
        registrar,
        login,
        logout,
        limpiarAutenticacion,
        estaAutenticado: !!usuario && !!token,
    };

    return (
        <ContextoAutenticacion.Provider value={valor}>
            {children}
        </ContextoAutenticacion.Provider>
    );
}

/**
 * Hook para usar el contexto de autenticación en cualquier componente
 * Uso: const { usuario, token, login } = useAutenticacion();
 */
export function useAutenticacion() {
    const contexto = useContext(ContextoAutenticacion);

    if (!contexto) {
        throw new Error(
            'useAutenticacion debe usarse dentro de ProveedorAutenticacion'
        );
    }

    return contexto;
}
