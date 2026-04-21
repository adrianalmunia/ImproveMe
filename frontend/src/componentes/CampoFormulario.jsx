// ================================================================================
// COMPONENTE: CAMPO DE FORMULARIO
// ================================================================================
// Componente reutilizable para campos de entrada en formularios.
// Reduce repetición de código y mantiene consistencia visual.

import '../estilos/CampoFormulario.css';

/**
 * Componente de campo de formulario
 * @param {string} etiqueta - Texto de la etiqueta
 * @param {string} tipo - Tipo de input (text, email, password, etc.)
 * @param {string} valor - Valor actual del input
 * @param {function} onChange - Función que se ejecuta al cambiar
 * @param {string} placeholder - Texto de placeholder
 * @param {boolean} requerido - Si el campo es obligatorio
 * @param {string} id - ID único del input (para accessibility)
 */
export function CampoFormulario({
    etiqueta,
    tipo = 'text',
    valor,
    onChange,
    placeholder = '',
    requerido = false,
    id = '',
}) {
    return (
        <div className="campo-formulario">
            {/* Etiqueta del campo */}
            <label htmlFor={id} className="etiqueta-campo">
                {etiqueta}
                {requerido && <span className="asterisco-requerido">*</span>}
            </label>

            {/* Input */}
            <input
                id={id}
                type={tipo}
                value={valor}
                onChange={(evento) => onChange(evento.target.value)}
                placeholder={placeholder}
                required={requerido}
                className="input-campo"
                aria-label={etiqueta}
            />
        </div>
    );
}

export default CampoFormulario;
