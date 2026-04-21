// ================================================================================
// COMPONENTE: BOTÓN GENÉRICO
// ================================================================================
// Botón reutilizable con diferentes variantes y estados.

import '../estilos/Boton.css';

/**
 * Componente de botón
 * @param {string} texto - Texto del botón
 * @param {function} onClick - Función al hacer clic
 * @param {string} variante - 'primario', 'secundario', 'peligro'
 * @param {boolean} estaCargando - Si el botón está en proceso
 * @param {boolean} deshabilitado - Si el botón está deshabilitado
 * @param {string} tipo - Tipo de botón HTML (button, submit, reset)
 * @param {string} icono - Emoji o caractere opcional
 * @param {string} className - Clases CSS adicionales
 */
export function Boton({
    texto,
    onClick = () => {},
    variante = 'primario',
    estaCargando = false,
    deshabilitado = false,
    tipo = 'button',
    icono = '',
    className = '',
}) {
    const clasesCombinadas = `boton boton-${variante} ${className}`;

    return (
        <button
            className={clasesCombinadas}
            onClick={onClick}
            disabled={deshabilitado || estaCargando}
            type={tipo}
            aria-busy={estaCargando}
        >
            {estaCargando ? (
                <>
                    <span className="spinner-cargando"></span>
                    Cargando...
                </>
            ) : (
                <>
                    {icono && <span className="icono-boton">{icono}</span>}
                    {texto}
                </>
            )}
        </button>
    );
}

export default Boton;
