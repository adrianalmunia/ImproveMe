// ================================================================================
// SERVICIO DE ALMACENAMIENTO - SUPABASE STORAGE
// ================================================================================
// Este servicio maneja la subida de fotos y audios a Supabase de forma directa
// mediante peticiones HTTPS nativas, sin requerir dependencias externas pesadas.

const subirArchivoASupabase = async (archivo, carpeta = 'diario') => {
  const urlSupabase = process.env.SUPABASE_URL;
  const claveSupabase = process.env.SUPABASE_KEY;

  // Si no está configurada la clave en el .env, hacemos un fallback local para desarrollo
  if (!urlSupabase || !claveSupabase || claveSupabase.includes('TU_CLAVE_ANONIMA')) {
    console.warn('⚠️ [Storage] Supabase no configurado o clave por defecto. Guardando en modo simulado local.');
    // Simulamos una ruta local que el servidor pueda resolver en local
    return `/uploads/simulado_${Date.now()}_${archivo.originalname.replace(/\s+/g, '_')}`;
  }

  const nombreLimpio = `${Date.now()}-${archivo.originalname.replace(/\s+/g, '_')}`;
  
  // URL de la API REST de Supabase Storage para subir el objeto:
  // https://[project-id].supabase.co/storage/v1/object/[bucket]/[ruta_del_archivo]
  const urlDestino = `${urlSupabase}/storage/v1/object/multimedia/${carpeta}/${nombreLimpio}`;

  console.log(`[Storage] Subiendo archivo a Supabase Storage: ${carpeta}/${nombreLimpio}...`);

  const respuesta = await fetch(urlDestino, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${claveSupabase}`,
      'Content-Type': archivo.mimetype
    },
    body: archivo.buffer // Enviamos el buffer del archivo directamente en el cuerpo
  });

  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    console.error('❌ [Storage] Error en la subida a Supabase:', resultado);
    throw new Error(resultado.message || resultado.error || 'Error al subir el archivo a Supabase Storage');
  }

  // URL pública de Supabase Storage:
  // https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[ruta_del_archivo]
  const urlPublica = `${urlSupabase}/storage/v1/object/public/multimedia/${carpeta}/${nombreLimpio}`;
  
  console.log(`✅ [Storage] ¡Subida exitosa! URL pública: ${urlPublica}`);
  return urlPublica;
};

module.exports = {
  subirArchivoASupabase
};
