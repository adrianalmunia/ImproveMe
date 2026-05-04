// ================================================================================
// PÁGINA: AUTENTICACIÓN UNIFICADA (LOGIN & REGISTRO)
// ================================================================================
// Este componente gestiona tanto el acceso como el registro en una sola vista.
// Utiliza Framer Motion para animaciones internas fluidas mientras mantiene
// el marco decorativo (card de Figma) estático.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import logoImproveMe from '../assets/logo_improveme.png';

export function Autenticacion({ onAccesoExitoso = () => { } }) {
    const { login, registrar, estaCargando, error } = useAutenticacion();
    
    // Estado para alternar entre Login y Registro
    const [esLogin, setEsLogin] = useState(true);

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
    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0
        })
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-gray-900 overflow-hidden font-['Inter'] transition-colors duration-300">
            {/* MARCO DE FIGMA (ESTÁTICO) */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-[1440px] h-[684px] relative scale-90 lg:scale-100"
            >
                {/* SVG de Fondo */}
                <div className="left-[304px] top-[45px] absolute">
                    <svg width="840" height="602" viewBox="0 0 840 602" fill="none">
                        <g filter="url(#filter0_di_auth)">
                            <path d="M4 20C4 8.95 12.95 0 24 0H816C827.05 0 836 8.95 836 20V574C836 585.05 827.05 594 816 594H24C12.95 594 4 585.05 4 574V20Z" className="fill-white dark:fill-gray-800 transition-colors duration-300" />
                            <path d="M24 1H816C826.49 1 835 9.5 835 20V574C835 584.49 826.49 593 816 593H24C13.5 593 5 584.49 5 574V20C5 9.5 13.5 1 24 1Z" stroke="url(#paint0_linear_auth)" strokeWidth="2" />
                        </g>
                        <defs>
                            <filter id="filter0_di_auth" x="0" y="0" width="840" height="602" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                <feOffset dy="4" /><feGaussianBlur stdDeviation="2" /><feComposite in2="hardAlpha" operator="out" />
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                <feOffset dy="4" /><feGaussianBlur stdDeviation="2" /><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                                <feBlend mode="normal" in2="shape" result="effect2_innerShadow" />
                            </filter>
                            <linearGradient id="paint0_linear_auth" x1="420" y1="0" x2="420" y2="594" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#4F99CC" /><stop offset="0.23" stopColor="#5FA5B3" /><stop offset="0.42" stopColor="#6FB29B" />
                                <stop offset="0.63" stopColor="#7DB57D" /><stop offset="0.78" stopColor="#8BB85E" /><stop offset="1" stopColor="#C6A55E" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Línea Divisoria Vertical con Degradado (Z-index superior para evitar colisiones) */}
                <div 
                    className="w-[2px] h-[594px] left-[724px] top-[45px] absolute z-10"
                    style={{ background: 'linear-gradient(180deg, #4F99CC 0%, #5FA5B3 23%, #6FB29B 42%, #7DB57D 63%, #8BB85E 78%, #C6A55E 100%)' }}
                ></div>

                {/* Logo Central Animado (Perfectamente redondeado) */}
                <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                    className="w-24 h-24 left-[676px] top-[297px] absolute rounded-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-center overflow-hidden z-20 p-[2px]"
                    style={{ background: 'linear-gradient(90deg, #4F99CC 0%, #C6A55E 100%)' }}
                >
                    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden transition-colors duration-300">
                        <img src={logoImproveMe} alt="Logo" className="w-full h-full object-cover rounded-full" />
                    </div>
                </motion.div>

                {/* --- LADO IZQUIERDO (ANIMACIÓN DE ESCALA Y DESVANECIMIENTO) --- */}
                <div className="w-[420px] h-[600px] left-[304px] top-[45px] absolute overflow-hidden pointer-events-none">
                    <AnimatePresence mode="wait">
                        {esLogin ? (
                            <motion.div
                                key="login-content"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full flex flex-col items-center justify-center pointer-events-auto"
                            >
                                {/* Título Login */}
                                <div className="w-80 text-center mb-8">
                                    <h2 className="text-black dark:text-white text-2xl font-normal font-['Tilt_Warp'] transition-colors duration-300">Bienvenido de nuevo.</h2>
                                    <p className="text-black dark:text-gray-300 text-[10px] font-normal font-['Inter'] mt-2 px-6 transition-colors duration-300">
                                        Inicia sesión para retomar tu progreso y seguir avanzando.
                                    </p>
                                </div>
                                {/* Form Login */}
                                <form onSubmit={manejarLogin} className="w-72 relative flex flex-col">
                                    {(errorLocal || error) && (
                                        <div className="w-full text-red-600 text-[11px] text-center bg-red-100/80 backdrop-blur-sm p-2 rounded-md mb-4 shadow-sm border border-red-200">{errorLocal || error}</div>
                                    )}
                                    <div className="mb-6">
                                        <label className="block text-black dark:text-gray-200 text-sm font-['Advent_Pro'] mb-1 ml-2 transition-colors duration-300">E-Mail</label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-7 rounded-full shadow-md outline outline-[0.78px] outline-Gris-Bonito dark:outline-gray-600 dark:bg-gray-700 dark:text-white px-4 text-xs focus:outline-Azul-Principal transition-colors duration-300" />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-black dark:text-gray-200 text-sm font-['Advent_Pro'] mb-1 ml-2 transition-colors duration-300">Contraseña</label>
                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-7 rounded-full shadow-md outline outline-[0.78px] outline-Gris-Bonito dark:outline-gray-600 dark:bg-gray-700 dark:text-white px-4 text-xs focus:outline-Azul-Principal transition-colors duration-300" />
                                    </div>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={estaCargando} className="w-full h-9 bg-black dark:bg-white text-white dark:text-black text-xs rounded-full shadow-lg mt-2 transition-colors duration-300">
                                        {estaCargando ? 'Cargando...' : 'Iniciar Sesión'}
                                    </motion.button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="login-prompt"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full flex flex-col items-center justify-center pointer-events-auto"
                            >
                                <div className="w-64 text-center">
                                    <h2 className="text-black dark:text-white text-2xl font-normal font-['Tilt_Warp'] transition-colors duration-300">¿Ya eres usuario?</h2>
                                    <p className="text-black dark:text-gray-300 text-[10px] font-normal font-['Inter'] mt-2 transition-colors duration-300">Identificate para acceder a ImproveMe</p>
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={alternarVista}
                                        className="w-48 h-7 bg-black dark:bg-white text-white dark:text-black text-xs rounded-full shadow-md mt-6 transition-colors duration-300"
                                    >
                                        Iniciar Sesión
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* --- LADO DERECHO (ANIMACIÓN DE ESCALA Y DESVANECIMIENTO) --- */}
                <div className="w-[420px] h-[600px] left-[724px] top-[45px] absolute overflow-hidden pointer-events-none">
                    <AnimatePresence mode="wait">
                        {!esLogin ? (
                            <motion.div
                                key="register-content"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full flex flex-col items-center justify-center pointer-events-auto"
                            >
                                {/* Título Registro */}
                                <div className="w-80 text-center mb-6">
                                    <h2 className="text-black dark:text-white text-2xl font-normal font-['Tilt_Warp'] transition-colors duration-300">Empieza hoy mismo</h2>
                                    <p className="text-black dark:text-gray-300 text-[10px] font-normal font-['Inter'] mt-2 px-6 transition-colors duration-300">
                                        Regístrate para guardar tu progreso y mejorar cada día.
                                    </p>
                                </div>
                                {/* Form Registro */}
                                <form onSubmit={manejarRegistro} className="w-72 relative flex flex-col">
                                    {(errorLocal || error) && (
                                        <div className="w-full text-red-600 text-[11px] text-center bg-red-100/80 backdrop-blur-sm p-2 rounded-md mb-4 shadow-sm border border-red-200">{errorLocal || error}</div>
                                    )}
                                    <div className="mb-4">
                                        <label className="block text-black dark:text-gray-200 text-sm font-['Advent_Pro'] mb-1 ml-2 transition-colors duration-300">Usuario</label>
                                        <input type="text" value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} className="w-full h-7 rounded-full shadow-md outline outline-[0.78px] outline-Gris-Bonito dark:outline-gray-600 dark:bg-gray-700 dark:text-white px-4 text-xs focus:outline-Azul-Principal transition-colors duration-300" />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-black dark:text-gray-200 text-sm font-['Advent_Pro'] mb-1 ml-2 transition-colors duration-300">E-Mail</label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-7 rounded-full shadow-md outline outline-[0.78px] outline-Gris-Bonito dark:outline-gray-600 dark:bg-gray-700 dark:text-white px-4 text-xs focus:outline-Azul-Principal transition-colors duration-300" />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-black dark:text-gray-200 text-sm font-['Advent_Pro'] mb-1 ml-2 transition-colors duration-300">Contraseña</label>
                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-7 rounded-full shadow-md outline outline-[0.78px] outline-Gris-Bonito dark:outline-gray-600 dark:bg-gray-700 dark:text-white px-4 text-xs focus:outline-Azul-Principal transition-colors duration-300" />
                                    </div>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={estaCargando} className="w-full h-9 bg-black dark:bg-white text-white dark:text-black text-xs rounded-full shadow-lg mt-2 transition-colors duration-300">
                                        {estaCargando ? 'Registrando...' : 'Registrarse'}
                                    </motion.button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="register-prompt"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full flex flex-col items-center justify-center pointer-events-auto"
                            >
                                <div className="w-64 text-center">
                                    <h2 className="text-black dark:text-white text-2xl font-normal font-['Tilt_Warp'] transition-colors duration-300">¿No tienes cuenta?</h2>
                                    <p className="text-black dark:text-gray-300 text-[10px] font-normal font-['Inter'] mt-2 transition-colors duration-300">Registrate para evolucionar con ImproveMe</p>
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={alternarVista}
                                        className="w-48 h-7 bg-black dark:bg-white text-white dark:text-black text-xs rounded-full shadow-md mt-6 transition-colors duration-300"
                                    >
                                        Registrarse
                                    </motion.button>
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
