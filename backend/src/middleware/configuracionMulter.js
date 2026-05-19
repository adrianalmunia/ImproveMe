const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que la carpeta de subidas existe
const dirSubidas = path.join(__dirname, '../../uploads');
if (!fs.existsSync(dirSubidas)) {
    fs.mkdirSync(dirSubidas, { recursive: true });
}

// Configuración de almacenamiento en memoria RAM (ideal para subir a la nube como Supabase)
const almacenamiento = multer.memoryStorage();

// Filtro de archivos
const filtroArchivos = (req, archivo, cb) => {
    if (archivo.fieldname === 'imagen') {
        if (archivo.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('El archivo debe ser una imagen'), false);
        }
    } else if (archivo.fieldname === 'audio') {
        if (archivo.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('El archivo debe ser un audio'), false);
        }
    } else {
        cb(null, true);
    }
};

const upload = multer({ 
    storage: almacenamiento,
    fileFilter: filtroArchivos,
    limits: {
        fileSize: 10 * 1024 * 1024 // Límite de 10MB
    }
});

module.exports = upload;
