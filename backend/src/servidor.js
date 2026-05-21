// ================================================================================
// SERVIDOR PRINCIPAL - ImproveMe (Restarted)
// SERVIDOR PRINCIPAL - ImproveMe
// ================================================================================
// Este archivo es el punto de entrada de la aplicación backend.
// Aquí se configura Express, se conecta a la BD, y se registran todas las rutas.

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const prisma = require('./configuracion/baseDatos');
const rutasAutenticacion = require('./rutas/rutasAutenticacion');
const rutasDiario = require('./rutas/rutasDiario');
const rutasMeditacion = require('./rutas/rutasMeditacion');
const rutasTareas = require('./rutas/rutasTareas');
const rutasCalendario = require('./rutas/rutasCalendario');
const rutasEstadisticas = require('./rutas/rutasEstadisticas');
const rutasSoporte = require('./rutas/rutasSoporte');

// ============ CONFIGURACIÓN BÁSICA ============
const app = express();
const ENTORNO = process.env.NODE_ENV || 'desarrollo';
const PUERTO = process.env.PORT || process.env.PUERTO || (ENTORNO === 'produccion' ? 10000 : 3000);

// ============ MIDDLEWARES GLOBALES ============
// Estos se ejecutan en TODAS las solicitudes

// 1. CORS (Debe ir antes de los parsers)
app.use(cors({
    origin: process.env.ORIGEN_CORS || 'http://localhost:5173',
    credentials: true
}));

// 2. Parsers de Body (Importantes para recibir datos)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware para logging (mostrar información de las solicitudes)
app.use((req, res, siguiente) => {
    console.log(`📨 ${req.method} ${req.path}`);
    if (req.method !== 'GET') {
        console.log(`   Headers:`, req.headers['content-type']);
        console.log(`   Body:`, req.body ? 'Presente' : 'Ausente/Undefined');
    }
    siguiente();
});

// ============ RUTAS ============

// Ruta de prueba para verificar que el servidor funciona
app.get('/probar', async (req, res) => {
    try {
        // Intentamos conectar a la base de datos
        const listaUsuarios = await prisma.usuarios.findMany({
            select: {
                id: true,
                nombre_usuario: true,
                correo: true
            }
        });

        return res.json({
            mensaje: '✅ ¡Conexión exitosa con la base de datos!',
            usuariosRegistrados: listaUsuarios.length,
            usuarios: listaUsuarios
        });
    } catch (error) {
        console.error('❌ Error en /probar:', error.message);
        return res.status(500).json({
            error: 'No se pudo conectar a la base de datos',
            mensaje: error.message
        });
    }
});

// Rutas de autenticación
app.use('/api/autenticacion', rutasAutenticacion);

// Rutas de diario
app.use('/api/diario', rutasDiario);

// Rutas de meditación
app.use('/api/meditacion', rutasMeditacion);

// Rutas de tareas y gamificacion
app.use('/api/tareas', rutasTareas);

// Rutas de calendario y resumen
app.use('/api/calendario', rutasCalendario);

// Rutas de estadísticas
app.use('/api/estadisticas', rutasEstadisticas);

// Rutas de soporte
app.use('/api/soporte', rutasSoporte);

// ============ MANEJO DE ERRORES 404 ============
// Si ninguna ruta anterior coincide, devolvemos 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        ruta: req.path,
        metodo: req.method
    });
});

// ============ INICIAR SERVIDOR ============
async function iniciarServidor() {
    try {
        // Verificamos la conexión a la base de datos
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Conexión a BD establecida');
    } catch (error) {
        console.warn('⚠️  ADVERTENCIA: No se pudo verificar la conexión a la base de datos Supabase Online en el arranque.');
        console.warn(`   Detalle: ${error.message}`);
        console.warn('   Nota: Si estás en desarrollo local, es posible que tu proveedor de internet o firewall bloquee el puerto 6543.');
        console.warn('   La aplicación seguirá ejecutándose y funcionará en la nube una vez desplegada.');
    }

    // Iniciamos el servidor Express
    app.listen(PUERTO, () => {
        console.log(`
╔════════════════════════════════════════════╗
║          🚀 ImproveMe - Backend 🚀        ║
╠════════════════════════════════════════════╣
║ 🔗 Servidor corriendo en puerto: ${PUERTO}        ║
║ 📍 Entorno: ${ENTORNO}                       ║
║ 🌐 URL: http://localhost:${PUERTO}              ║
║ 📝 Prueba: http://localhost:${PUERTO}/probar     ║
╚════════════════════════════════════════════╝
        `);
    });
}

// ============ MANEJO DE SEÑALES DEL SISTEMA ============
// Cuando el proceso recibe CTRL+C, cerramos gracefully

process.on('SIGINT', async () => {
    console.log('\n\n⏹️  Cerrando servidor gracefully...');
    await prisma.$disconnect();
    console.log('Conexión a BD cerrada');
    process.exit(0);
});

// ============ INICIAR ============
iniciarServidor();

module.exports = app;
