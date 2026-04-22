// ================================================================================
// SERVIDOR PRINCIPAL - ImproveMe
// ================================================================================
// Este archivo es el punto de entrada de la aplicación backend.
// Aquí se configura Express, se conecta a la BD, y se registran todas las rutas.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./configuracion/baseDatos');
const rutasAutenticacion = require('./rutas/rutasAutenticacion');

// ============ CONFIGURACIÓN BÁSICA ============
const app = express();
const PUERTO = process.env.PUERTO || 3000;
const ENTORNO = process.env.NODE_ENV || 'desarrollo';

// ============ MIDDLEWARES GLOBALES ============
// Estos se ejecutan en TODAS las solicitudes

// CORS: Permite que el frontend (React) acceda a nuestro API
app.use(cors({
    origin: process.env.ORIGEN_CORS || 'http://localhost:5173', // Puerto por defecto de Vite
    credentials: true // Permite enviar cookies y headers de autenticación
}));

// Parser JSON: Convierte el body de las solicitudes a objetos JavaScript
app.use(express.json());

// Middleware para logging (mostrar información de las solicitudes)
app.use((req, res, siguiente) => {
    console.log(`📨 ${req.method} ${req.path}`);
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
                username: true,
                email: true
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
    } catch (error) {
        console.error('Error al iniciar servidor:', error.message);
        process.exit(1); // Salir con código de error
    }
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
