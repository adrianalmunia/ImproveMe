// ================================================================================
// SERVICIO DE ALMACENAMIENTO - SUPABASE STORAGE
// ================================================================================
// Este servicio gestiona la subida de fotos y audios al almacenamiento de Supabase.
// El objetivo principal es que los archivos sean accesibles desde cualquier dispositivo
// a través de una URL pública permanente.
// Solo se recurre al almacenamiento local como medida de emergencia ante fallos de red.

const fs = require('fs');
const path = require('path');

const subirArchivoASupabase = async (archivo, carpeta = 'diario') => {
  const urlSupabase = process.env.SUPABASE_URL;
  const claveSupabase = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

  const nombreLimpio = `${Date.now()}-${archivo.originalname.replace(/\s+/g, '_')}`;

  // Validaciones detalladas para el almacenamiento con logs sin emojis
  if (!urlSupabase) {
    console.warn('[Storage] Advertencia: SUPABASE_URL no esta configurada. Guardando localmente.');
    return guardarEnLocal(archivo.buffer, nombreLimpio);
  }
  if (!claveSupabase || claveSupabase.includes('TU_CLAVE_ANONIMA')) {
    console.warn('[Storage] Advertencia: SUPABASE_SERVICE_KEY o SUPABASE_KEY no esta configurada o es invalida. Guardando localmente.');
    return guardarEnLocal(archivo.buffer, nombreLimpio);
  }

  // Intentamos subir el archivo a Supabase Storage
  const urlDestino = `${urlSupabase}/storage/v1/object/multimedia/${carpeta}/${nombreLimpio}`;
  console.log(`[Storage] Subiendo a Supabase: ${carpeta}/${nombreLimpio} (${archivo.size} bytes)`);

  try {
    // Evitar bugs de serializacion de Buffer en Node.js (Undici fetch) convirtiendolo a un Blob estandar
    const cuerpoCarga = typeof Blob !== 'undefined'
      ? new Blob([archivo.buffer], { type: archivo.mimetype })
      : archivo.buffer;

    const respuesta = await fetch(urlDestino, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${claveSupabase}`,
        'apikey': claveSupabase,
        'Content-Type': archivo.mimetype,
        'Content-Length': archivo.size.toString()
      },
      body: cuerpoCarga
    });

    if (!respuesta.ok) {
      const resultado = await respuesta.json().catch(() => ({}));
      const mensajeError = resultado.message || resultado.error || `Codigo HTTP ${respuesta.status}`;
      throw new Error(mensajeError);
    }

    // La URL publica de Supabase permite acceder al archivo desde cualquier dispositivo
    const urlPublica = `${urlSupabase}/storage/v1/object/public/multimedia/${carpeta}/${nombreLimpio}`;
    console.log(`[Storage] Subida correcta. URL publica: ${urlPublica}`);
    return urlPublica;

  } catch (error) {
    // Si Supabase falla (problema de red, permisos de bucket, etc.), guardamos en local
    // para no perder el archivo del usuario, pero dejamos constancia clara del problema.
    console.error(`[Storage] Error al subir a Supabase: ${error.message}`);
    console.warn('[Storage] Fallback de emergencia: guardando en disco local. NOTA: este archivo no sera visible desde otros dispositivos hasta que se suba a Supabase.');
    return guardarEnLocal(archivo.buffer, nombreLimpio);
  }
};

// Funcion auxiliar que escribe el buffer en el disco local
// y devuelve la ruta relativa que el servidor Express puede servir
function guardarEnLocal(buffer, nombreArchivo) {
  const dirSubidas = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(dirSubidas)) {
    fs.mkdirSync(dirSubidas, { recursive: true });
  }
  const rutaCompleta = path.join(dirSubidas, nombreArchivo);
  fs.writeFileSync(rutaCompleta, buffer);
  console.log(`[Storage] Archivo guardado localmente: /uploads/${nombreArchivo}`);
  return `/uploads/${nombreArchivo}`;
}

module.exports = {
  subirArchivoASupabase
};
