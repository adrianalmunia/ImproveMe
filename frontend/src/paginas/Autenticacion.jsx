// ================================================================================
// PÁGINA: AUTENTICACIÓN UNIFICADA (LOGIN & REGISTRO)
// ================================================================================
import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import logoImproveMe from '../assets/logo_improveme.png';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// --- COMPONENTES AUXILIARES (Fuera para evitar re-renderizados innecesarios) ---

const Separador = memo(() => (
    <div className="flex items-center gap-3 my-3 mt-4">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            o continúa con
        </span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
    </div>
));

const SeccionGoogle = memo(({ googleNoConfigurado, botonGoogleRef }) => (
    <div className="w-full min-h-[44px]">
        {googleNoConfigurado ? (
            <div className="w-full py-3 px-4 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 text-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                ⚙️ Configura <code className="font-mono text-[#4F99CC]">VITE_GOOGLE_CLIENT_ID</code> para activar Google
            </div>
        ) : (
            <div
                ref={botonGoogleRef}
                className="contenedor-google-gsi w-full flex justify-center [&>div]:w-full [&>div>div]:w-full"
            />
        )}
    </div>
));

export function Autenticacion({
    onAccesoExitoso = () => { },
    modoInicial = 'login',
    onVolverALanding = () => { }
}) {
    const { login, registrar, loginGoogle, estaCargando, error } = useAutenticacion();
    const [esLogin, setEsLogin] = useState(modoInicial === 'login');

    // Estados de Formulario
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [notificacion, setNotificacion] = useState(null); // { mensaje, tipo: 'validacion' | 'error' | 'info' }

    // Limpiar notificaciones al cambiar de vista
    useEffect(() => {
        setNotificacion(null);
    }, [esLogin]);

    // Detectar si el error global es de sesión expirada
    useEffect(() => {
        if (error && (error.includes('expirada') || error.includes('token') || error.includes('sesión'))) {
            setNotificacion({ mensaje: 'Sesión expirada', tipo: 'info' });
        } else if (error) {
            setNotificacion({ mensaje: error, tipo: 'error' });
        }
    }, [error]);

    const manejarCredencialGoogle = useCallback(async (respuesta) => {
        setNotificacion(null);
        try {
            const usuario = await loginGoogle(respuesta.credential);
            onAccesoExitoso(usuario);
        } catch (err) {
            setNotificacion({ mensaje: err.message || 'Error al iniciar sesión con Google', tipo: 'error' });
        }
    }, [loginGoogle, onAccesoExitoso]);

    const renderizarBotonEnElemento = useCallback((elemento) => {
        if (!window.google?.accounts?.id || !elemento) return;

        // Limpiamos el contenido previo antes de renderizar para evitar duplicados
        elemento.innerHTML = '';

        window.google.accounts.id.renderButton(elemento, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: elemento.parentElement?.offsetWidth || 300,
            locale: 'es',
        });
    }, []);

    // La clave es que esta ref solo dispare el renderizado si el NODO cambia (cambio de pestaña)
    const botonGoogleRef = useCallback((nodo) => {
        if (nodo !== null) {
            // Usamos un pequeño delay para asegurar que el DOM está estable
            const timer = setTimeout(() => renderizarBotonEnElemento(nodo), 50);
            return () => clearTimeout(timer);
        }
    }, [renderizarBotonEnElemento]);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('TU_GOOGLE')) return;

        const inicializarGoogle = () => {
            if (!window.google) return;
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: manejarCredencialGoogle,
                auto_select: false,
                cancel_on_tap_outside: true,
            });

            const contenedor = document.querySelector('.contenedor-google-gsi');
            if (contenedor) renderizarBotonEnElemento(contenedor);
        };

        if (window.google?.accounts) {
            inicializarGoogle();
        } else {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = inicializarGoogle;
            document.head.appendChild(script);
        }
    }, [manejarCredencialGoogle, renderizarBotonEnElemento]);

    const alternarVista = () => {
        setEsLogin(!esLogin);
    };

    async function manejarLogin(evento) {
        evento.preventDefault();
        setNotificacion(null);
        try {
            if (!email || !password) {
                setNotificacion({ mensaje: 'Email y contraseña son obligatorios', tipo: 'validacion' });
                return;
            }
            const usuario = await login(email, password);
            onAccesoExitoso(usuario);
        } catch (err) {
            // Si el error parece de conexión (no hay respuesta o mensaje de fetch)
            if (err.message?.includes('fetch') || err.message?.includes('Network')) {
                setNotificacion({ mensaje: 'Error al sincronizar datos', tipo: 'error' });
            } else {
                setNotificacion({ mensaje: err.message || 'Error al iniciar sesión', tipo: 'error' });
            }
        }
    }

    async function manejarRegistro(evento) {
        evento.preventDefault();
        setNotificacion(null);
        try {
            if (!nombreUsuario || !email || !password) {
                setNotificacion({ mensaje: 'Todos los campos son obligatorios', tipo: 'validacion' });
                return;
            }
            if (password.length < 8) {
                setNotificacion({ mensaje: 'La contraseña debe tener al menos 8 caracteres', tipo: 'validacion' });
                return;
            }
            const resultado = await registrar(nombreUsuario, email, password);
            if (resultado && (resultado.usuario || resultado.id)) {
                onAccesoExitoso(resultado);
            }
        } catch (err) {
            if (err.message?.includes('fetch') || err.message?.includes('Network')) {
                setNotificacion({ mensaje: 'Error al sincronizar datos', tipo: 'error' });
            } else {
                setNotificacion({ mensaje: err.message || 'Error al registrarse', tipo: 'error' });
            }
        }
    }

    const formVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    const googleNoConfigurado = !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('TU_GOOGLE');

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-gray-900 overflow-y-auto font-['Inter'] transition-colors duration-300 p-4 sm:p-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[1000px] min-h-[450px] sm:min-h-[600px] bg-white dark:bg-gray-800 rounded-3xl md:rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
            >
                {/* LADO IZQUIERDO: BRANDING */}
                <div className="hidden md:flex md:w-[45%] relative flex-col justify-between p-8 overflow-hidden bg-gradient-to-br from-[#4F99CC] to-[#C6A55E]">
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-lg mb-8">
                            <img src={logoImproveMe} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-white text-4xl font-['Tilt_Warp'] leading-tight mb-4">
                            Desbloquea tu<br />mejor versión.
                        </h1>
                        <p className="text-white/80 text-sm max-w-[80%] font-medium">
                            Únete a ImproveMe y comienza a transformar tus hábitos.
                        </p>
                    </div>
                </div>

                {/* LADO DERECHO: FORMULARIO */}
                <div className="w-full md:w-[55%] p-6 sm:p-8 lg:p-12 flex flex-col justify-center relative bg-white dark:bg-gray-800">
                    <div className="absolute top-6 left-6 z-20">
                        <button onClick={onVolverALanding} className="text-gray-400 hover:text-[#4F99CC] transition-colors text-[10px] font-bold uppercase tracking-widest">
                            ← Volver
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={esLogin ? 'login' : 'register'}
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full max-w-md mx-auto"
                        >
                            <div className="mb-6 mt-8 sm:mt-4 text-center md:text-left">
                                <h2 className="text-2xl sm:text-3xl font-['Tilt_Warp'] text-gray-800 dark:text-white">
                                    {esLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                                    {esLogin ? 'Inicia sesión para continuar' : 'Comienza tu viaje de mejora'}
                                </p>
                            </div>

                            {notificacion && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className={`w-full text-sm text-center p-3 rounded-2xl mb-6 border transition-all ${
                                        notificacion.tipo === 'validacion' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                        notificacion.tipo === 'error' ? 'bg-red-50 border-red-200 text-red-600' :
                                        'bg-blue-50 border-blue-200 text-blue-600'
                                    }`}
                                >
                                    {notificacion.mensaje}
                                </motion.div>
                            )}

                            <SeccionGoogle
                                googleNoConfigurado={googleNoConfigurado}
                                botonGoogleRef={botonGoogleRef}
                            />

                            <Separador />

                            <form onSubmit={esLogin ? manejarLogin : manejarRegistro} className="space-y-3 sm:space-y-4">
                                {!esLogin && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 ml-4 uppercase tracking-widest">Usuario</label>
                                        <input
                                            type="text"
                                            value={nombreUsuario}
                                            onChange={(e) => setNombreUsuario(e.target.value)}
                                            placeholder="Tu alias"
                                            className="w-full bg-neutral-50 dark:bg-gray-900/50 rounded-full border-2 border-transparent focus:border-[#4F99CC] outline-none px-5 py-2.5 text-sm"
                                        />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 ml-4 uppercase tracking-widest">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="tu@email.com"
                                        className="w-full bg-neutral-50 dark:bg-gray-900/50 rounded-full border-2 border-transparent focus:border-[#4F99CC] outline-none px-6 py-3 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 ml-4 uppercase tracking-widest">Contraseña</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-neutral-50 dark:bg-gray-900/50 rounded-full border-2 border-transparent focus:border-[#4F99CC] outline-none px-6 py-3 text-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={estaCargando}
                                    className={`w-full py-4 mt-4 rounded-full font-bold shadow-xl transition-all ${esLogin ? 'bg-black text-white' : 'bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] text-white'}`}
                                >
                                    {estaCargando ? 'Procesando...' : (esLogin ? 'Entrar a ImproveMe' : 'Crear Cuenta')}
                                </button>
                            </form>

                            <div className="mt-4 text-center">
                                <p className="text-gray-500 text-sm">
                                    {esLogin ? '¿No tienes cuenta?' : '¿Ya eres miembro?'} {' '}
                                    <button onClick={alternarVista} className="text-[#4F99CC] font-bold hover:underline">
                                        {esLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

export default Autenticacion;
