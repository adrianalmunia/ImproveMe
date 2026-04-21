// ================================================================================
// CONFIGURACIÓN DE LA BASE DE DATOS CON PRISMA ORM
// ================================================================================
// Este archivo centraliza la conexión a la base de datos PostgreSQL.
// Usamos una instancia única de Prisma para evitar crear múltiples conexiones
// que podrían causar problemas de rendimiento.

const { PrismaClient } = require('@prisma/client');

// Creamos una única instancia de Prisma (singleton pattern)
// Esto asegura que toda la aplicación use la misma conexión
const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'stdout',
            level: 'error',
        },
        {
            emit: 'stdout',
            level: 'warn',
        },
    ],
});

// En desarrollo, podemos monitorear las queries que se ejecutan
if (process.env.NODE_ENV === 'desarrollo') {
    prisma.$on('query', (evento) => {
        console.log('⚡ Query ejecutada:', evento.query);
        console.log('⏱️  Duración:', evento.duration, 'ms');
    });
}

module.exports = prisma;
