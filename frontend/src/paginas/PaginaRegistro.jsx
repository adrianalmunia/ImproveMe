// ================================================================================
// PÁGINA: REGISTRO (CREAR CUENTA)
// ================================================================================
// Componente para que nuevos usuarios se registren en la aplicación.
// Utiliza el diseño exacto exportado desde Figma con los mismos refinamientos que Login.

import { motion } from 'framer-motion';

export function PaginaRegistro({ onRegistroExitoso = () => { }, onIrALogin = () => { } }) {
    const { registrar, estaCargando, error } = useAutenticacion();
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorLocal, setErrorLocal] = useState('');

    async function manejarEnvio(evento) {
        evento.preventDefault();
        setErrorLocal('');

        try {
            if (!nombreUsuario || !email || !password) {
                setErrorLocal('Todos los campos son obligatorios');
                return;
            }

            if (password.length < 8) {
                setErrorLocal('La contraseña debe tener al menos 8 caracteres');
                return;
            }

            const usuario = await registrar(nombreUsuario, email, password);
            onRegistroExitoso(usuario);
        } catch (err) {
            setErrorLocal(err.message || 'Error al registrarse');
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100 overflow-hidden font-['Inter']">
            {/* Contenedor Principal (basado en el tamaño de Figma pero centrado) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-[1440px] h-[684px] relative bg-neutral-100 overflow-hidden scale-90 lg:scale-100"
            >
                
                {/* SVG de Fondo / Card Decorativa */}
                <div data-svg-wrapper className="left-[304px] top-[45px] absolute">
                    <svg width="840" height="602" viewBox="0 0 840 602" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g filter="url(#filter0_di_194_74)">
                            <path d="M4 20C4 8.95429 12.9543 0 24 0H816C827.046 0 836 8.95431 836 20V574C836 585.046 827.046 594 816 594H24C12.9543 594 4 585.046 4 574V20Z" fill="white" />
                            <path d="M24 1H816C826.493 1 835 9.50659 835 20V574C835 584.493 826.493 593 816 593H24C13.5066 593 5 584.493 5 574V20C5 9.50659 13.5066 1 24 1Z" stroke="url(#paint0_linear_194_74)" strokeWidth="2" />
                        </g>
                        <defs>
                            <filter id="filter0_di_194_74" x="0" y="0" width="840" height="602" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                <feOffset dy="4" />
                                <feGaussianBlur stdDeviation="2" />
                                <feComposite in2="hardAlpha" operator="out" />
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_194_74" />
                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_194_74" result="shape" />
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                <feOffset dy="4" />
                                <feGaussianBlur stdDeviation="2" />
                                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                                <feBlend mode="normal" in2="shape" result="effect2_innerShadow_194_74" />
                            </filter>
                            <linearGradient id="paint0_linear_194_74" x1="420" y1="0" x2="420" y2="594" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#4F99CC" />
                                <stop offset="0.23" stopColor="#5FA5B3" />
                                <stop offset="0.42" stopColor="#6FB29B" />
                                <stop offset="0.63" stopColor="#7DB57D" />
                                <stop offset="0.78" stopColor="#8BB85E" />
                                <stop offset="1" stopColor="#C6A55E" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Línea Divisoria Vertical con Degradado (Centrada en la card) */}
                <div 
                    className="w-[2px] h-[594px] left-[724px] top-[45px] absolute"
                    style={{ background: 'linear-gradient(180deg, #4F99CC 0%, #5FA5B3 23%, #6FB29B 42%, #7DB57D 63%, #8BB85E 78%, #C6A55E 100%)' }}
                ></div>

                {/* Logo / Imagen Central con Borde Degradado (Centrado en la línea) */}
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                    className="w-24 h-24 left-[676px] top-[297px] absolute rounded-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-center overflow-hidden z-10 p-[2px]"
                    style={{ background: 'linear-gradient(90deg, #4F99CC 0%, #5FA5B3 23%, #6FB29B 42%, #7DB57D 63%, #8BB85E 78%, #C6A55E 100%)' }}
                >
                    <div className="w-full h-full bg-white rounded-full overflow-hidden flex items-center justify-center">
                        <img src={logoImproveMe} alt="ImproveMe Logo" className="w-full h-full object-cover" />
                    </div>
                </motion.div>

                {/* Título y Subtítulo Derecha (Centrado en su mitad) */}
                <div className="w-80 h-28 left-[774px] top-[111px] absolute text-center flex flex-col justify-center">
                    <span className="text-black text-2xl font-normal font-['Tilt_Warp']">Empieza a cuidar de ti hoy mismo</span>
                    <span className="text-black text-[10px] font-normal font-['Inter'] mt-2 px-6">
                        Regístrate para guardar tu progreso, crear hábitos saludables y avanzar día a día hacia tu mejor versión. Tu bienestar empieza aquí.
                    </span>
                </div>

                {/* Sección Izquierda: ¿Ya eres usuario? (Centrado en su mitad) */}
                <div className="w-64 h-20 left-[386px] top-[264px] absolute text-center flex flex-col justify-center">
                    <span className="text-black text-2xl font-normal font-['Tilt_Warp']">¿Ya eres usuario?</span>
                    <span className="text-black text-[10px] font-normal font-['Inter'] mt-2">Identificate para acceder a ImproveMe</span>
                </div>

                {/* Botón Iniciar Sesión (Centrado en su mitad) */}
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onIrALogin}
                    className="w-48 h-7 left-[418px] top-[364px] absolute bg-black rounded-[49.97px] shadow-[0px_1.8px_1.8px_0px_rgba(0,0,0,0.25)] flex justify-center items-center hover:bg-neutral-800 transition-all active:scale-95"
                >
                    <div className="text-white text-xs font-normal font-['Inter']">Iniciar Sesión</div>
                </motion.button>

                {/* Formulario de Registro (Centrado en su mitad derecha) */}
                <form onSubmit={manejarEnvio} className="w-72 h-64 left-[790px] top-[249px] absolute">
                    
                    {/* Mensaje de Error dinámico */}
                    {(errorLocal || error) && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute top-[-50px] left-[-20px] w-80 text-red-500 text-[10px] text-center bg-red-50 p-1 rounded-lg border border-red-100"
                        >
                            {errorLocal || error}
                        </motion.div>
                    )}

                    {/* Input Usuario */}
                    <div className="w-24 h-7 left-[-4px] top-[19px] absolute text-center justify-center text-black text-base font-normal font-['Advent_Pro']">Usuario</div>
                    <input 
                        type="text"
                        value={nombreUsuario}
                        onChange={(e) => setNombreUsuario(e.target.value)}
                        className="w-72 h-7 left-[3.43px] top-[40.52px] absolute rounded-[44.44px] shadow-[0px_3.1px_3.1px_0px_rgba(0,0,0,0.25)] outline outline-[0.78px] outline-offset-[-0.39px] outline-Gris-Bonito px-4 text-xs focus:outline-Azul-Principal focus:ring-0"
                        placeholder="tu_usuario"
                    />

                    {/* Input E-Mail */}
                    <div className="w-14 h-7 left-[3px] top-[84px] absolute text-center justify-center text-black text-base font-normal font-['Advent_Pro']">E-Mail</div>
                    <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-72 h-7 left-[3.43px] top-[114.46px] absolute rounded-[44.44px] shadow-[0px_3.1px_3.1px_0px_rgba(0,0,0,0.25)] outline outline-[0.78px] outline-offset-[-0.39px] outline-Gris-Bonito px-4 text-xs focus:outline-Azul-Principal focus:ring-0"
                        placeholder="ejemplo@correo.com"
                    />

                    {/* Input Contraseña */}
                    <div className="w-24 h-7 left-[-4px] top-[163px] absolute text-center justify-center text-black text-base font-normal font-['Advent_Pro']">Contraseña</div>
                    <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-72 h-7 left-[3.43px] top-[188.40px] absolute rounded-[44.44px] shadow-[0px_3.1px_3.1px_0px_rgba(0,0,0,0.25)] outline outline-[0.78px] outline-offset-[-0.39px] outline-Gris-Bonito px-4 text-xs focus:outline-Azul-Principal focus:ring-0"
                        placeholder="••••••••"
                    />

                    {/* Botón Registrarse (Alineado con inputs) */}
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={estaCargando}
                        className="w-72 h-9 left-[3.43px] top-[241.61px] absolute bg-black rounded-[47.17px] shadow-[0px_3.1px_3.1px_0px_rgba(0,0,0,0.25)] flex justify-center items-center hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <div className="text-white text-xs font-normal font-['Inter']">
                            {estaCargando ? 'Registrando...' : 'Registrarse'}
                        </div>
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}

export default PaginaRegistro;

