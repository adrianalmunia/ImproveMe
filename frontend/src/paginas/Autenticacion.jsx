// ================================================================================
// PÁGINA: AUTENTICACIÓN UNIFICADA (LOGIN & REGISTRO)
// ================================================================================
// Este componente gestiona tanto el acceso como el registro en una sola vista.
// Se ha actualizado el diseño para coincidir con el estilo general de la app.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import logoImproveMe from '../assets/logo_improveme.png';

export function Autenticacion({ 
    onAccesoExitoso = () => { }, 
    modoInicial = 'login', 
    onVolverALanding = () => { } 
}) {
    const { login, registrar, estaCargando, error } = useAutenticacion();

    // Estado para alternar entre Login y Registro, inicializado según prop
    const [esLogin, setEsLogin] = useState(modoInicial === 'login');

    // Estados de Formulario
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorLocal, setErrorLocal] = useState('');

    // --- MANEJADORES ---

    async function manejarLogin(evento) {
        evento.preventDefault();
        setErrorLocal('');
        try {
            if (!email || !password) {
                setErrorLocal('Email y contraseña son obligatorios');
                return;
            }
            const usuario = await login(email, password);
            onAccesoExitoso(usuario);
        } catch (err) {
            setErrorLocal(err.message || 'Error al iniciar sesión');
        }
    }

    async function manejarRegistro(evento) {
        evento.preventDefault();
        setErrorLocal('');
        try {
            if (!nombreUsuario || !email || !password) {
                setErrorLocal('Todos los campos son obligatorios');
                return;
            }
            if (password.length < 8) {
                setErrorLocal('Mínimo 8 caracteres');
                return;
            }

            // Llamada al contexto para registrar
            const resultado = await registrar(nombreUsuario, email, password);

            // SOLO si el resultado es exitoso y tenemos usuario, procedemos
            if (resultado && (resultado.usuario || resultado.id)) {
                onAccesoExitoso(resultado);
            } else {
                // Si no hay usuario en la respuesta, algo fue mal pero no saltó el catch
                setErrorLocal('No se pudo completar el registro. Inténtalo de nuevo.');
            }
        } catch (err) {
            // El error se queda aquí y NO cambia la vista
            console.error("Error en el componente de Registro:", err);
            setErrorLocal(err.message || 'Error al registrarse');
        }
    }

    // Limpiar estados al cambiar de vista
    const alternarVista = () => {
        setEsLogin(!esLogin);
        setErrorLocal('');
    };

    // --- ANIMACIONES ---
    const formVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: "easeIn" } }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-gray-900 overflow-hidden font-['Inter'] transition-colors duration-300 p-4 lg:p-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[1000px] min-h-[600px] bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
            >
                {/* LADO IZQUIERDO: BRANDING (Visible solo en md+) */}
                <div className="hidden md:flex md:w-[45%] relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#4F99CC] to-[#C6A55E]">
                    {/* Elementos decorativos de fondo */}
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-black/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                            className="w-20 h-20 bg-white rounded-2xl p-2 shadow-lg mb-8"
                        >
                            <img src={logoImproveMe} alt="Logo" className="w-full h-full object-contain" />
                        </motion.div>
                        <h1 className="text-white text-4xl font-['Tilt_Warp'] leading-tight mb-4">
                            Desbloquea tu<br />mejor versión.
                        </h1>
                        <p className="text-white/80 text-sm max-w-[80%] font-medium">
                            Únete a ImproveMe y comienza a transformar tus hábitos, hacer un seguimiento de tu progreso y subir de nivel en la vida real.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-1 bg-white/30 rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                </div>

                {/* LADO DERECHO: FORMULARIO */}
                <div className="w-full md:w-[55%] p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative bg-white dark:bg-gray-800 transition-colors duration-300">
                    
                    {/* Cabecera del Formulario con botón Volver */}
                    <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-20">
                        <button 
                            onClick={onVolverALanding}
                            className="text-gray-400 hover:text-[#4F99CC] transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
                        >
                            ← Volver
                        </button>
                    </div>

                    {/* Versión móvil del logo */}
                    <div className="md:hidden flex justify-center mb-8">
                        <div className="w-16 h-16 rounded-full p-[2px] shadow-lg" style={{ background: 'linear-gradient(135deg, #4F99CC 0%, #C6A55E 100%)' }}>
                            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center p-2">
                                <img src={logoImproveMe} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {esLogin ? (
                            <motion.div
                                key="login-form"
                                variants={formVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="w-full max-w-md mx-auto"
                            >
                                <div className="mb-8 text-center md:text-left">
                                    <h2 className="text-3xl font-['Tilt_Warp'] text-gray-800 dark:text-white transition-colors duration-300">Bienvenido de nuevo</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 transition-colors duration-300">Inicia sesión para continuar tu progreso</p>
                                </div>

                                {(errorLocal || error) && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full text-red-600 bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-center p-3 rounded-2xl mb-6 font-medium">
                                        {errorLocal || error}
                                    </motion.div>
                                )}

                                <form onSubmit={manejarLogin} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-4 uppercase tracking-widest transition-colors duration-300">Correo Electrónico</label>
                                        <div className="w-full bg-neutral-50 dark:bg-gray-900/50 rounded-full border-2 border-transparent focus-within:border-[#4F99CC] transition-all duration-300 px-6 py-3.5 shadow-sm">
                                            <input 
                                                type="email" 
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)} 
                                                placeholder="tu@email.com"
                                                className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-200 text-sm font-medium placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-4 uppercase tracking-widest transition-colors duration-300">Contraseña</label>
                                        <div className="w-full bg-neutral-50 dark:bg-gray-900/50 rounded-full border-2 border-transparent focus-within:border-[#4F99CC] transition-all duration-300 px-6 py-3.5 shadow-sm">
                                            <input 
                                                type="password" 
                                                value={password} 
                                                onChange={(e) => setPassword(e.target.value)} 
                                                placeholder="••••••••"
                                                className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-200 text-sm font-medium placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4">
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }} 
                                            whileTap={{ scale: 0.98 }} 
                                            type="submit" 
                                            disabled={estaCargando} 
                                            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                                        >
                                            {estaCargando ? 'Iniciando sesión...' : 'Entrar a ImproveMe'}
                                        </motion.button>
                                    </div>
                                </form>

                                <div className="mt-8 text-center">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
                                        ¿No tienes una cuenta? {' '}
                                        <button onClick={alternarVista} className="text-[#4F99CC] font-bold hover:underline transition-all duration-300">
                                            Regístrate aquí
                                        </button>
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="register-form"
                                variants={formVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="w-full max-w-md mx-auto"
                            >
                                <div className="mb-8 text-center md:text-left">
                                    <h2 className="text-3xl font-['Tilt_Warp'] text-gray-800 dark:text-white transition-colors duration-300">Crea tu cuenta</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 transition-colors duration-300">Comienza tu viaje de mejora continua</p>
                                </div>

                                {(errorLocal || error) && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full text-red-600 bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-center p-3 rounded-2xl mb-6 font-medium">
                                        {errorLocal || error}
                                    </motion.div>
                                )}

                                <form onSubmit={manejarRegistro} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-4 uppercase tracking-widest transition-colors duration-300">Usuario</label>
                                        <div className="w-full bg-neutral-50 dark:bg-gray-900/50 rounded-full border-2 border-transparent focus-within:border-[#4F99CC] transition-all duration-300 px-6 py-3.5 shadow-sm">
                                            <input 
                                                type="text" 
                                                value={nombreUsuario} 
                                                onChange={(e) => setNombreUsuario(e.target.value)} 
                                                placeholder="Tu alias"
                                                className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-200 text-sm font-medium placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-4 uppercase tracking-widest transition-colors duration-300">Correo Electrónico</label>
                                        <div className="w-full bg-neutral-50 dark:bg-gray-900/50 rounded-full border-2 border-transparent focus-within:border-[#4F99CC] transition-all duration-300 px-6 py-3.5 shadow-sm">
                                            <input 
                                                type="email" 
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)} 
                                                placeholder="tu@email.com"
                                                className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-200 text-sm font-medium placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-4 uppercase tracking-widest transition-colors duration-300">Contraseña</label>
                                        <div className="w-full bg-neutral-50 dark:bg-gray-900/50 rounded-full border-2 border-transparent focus-within:border-[#4F99CC] transition-all duration-300 px-6 py-3.5 shadow-sm">
                                            <input 
                                                type="password" 
                                                value={password} 
                                                onChange={(e) => setPassword(e.target.value)} 
                                                placeholder="Mínimo 8 caracteres"
                                                className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-200 text-sm font-medium placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4">
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }} 
                                            whileTap={{ scale: 0.98 }} 
                                            type="submit" 
                                            disabled={estaCargando} 
                                            className="w-full py-4 bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] text-white rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                                        >
                                            {estaCargando ? 'Creando cuenta...' : 'Crear Cuenta'}
                                        </motion.button>
                                    </div>
                                </form>

                                <div className="mt-8 text-center">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
                                        ¿Ya eres miembro? {' '}
                                        <button onClick={alternarVista} className="text-[#4F99CC] font-bold hover:underline transition-all duration-300">
                                            Inicia Sesión
                                        </button>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

export default Autenticacion;
