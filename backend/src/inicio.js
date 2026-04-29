const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Importamos las rutas modulares
const rutasAutenticacion = require('./rutas/rutasAutenticacion');
const rutasDiario = require('./rutas/rutasDiario');

// Registro de Rutas
app.use('/api/auth', rutasAutenticacion); // Todas las rutas de auth ahora cuelgan de /api/auth
app.use('/api/diario', rutasDiario);

app.get('/probar', async (req, res) => {
    try {
        const listaUsuarios = await prisma.usuarios.findMany();
        res.json({
            mensaje: "¡Conexión exitosa con la versión estable!",
            datos: listaUsuarios
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- RUTA DE REGISTRO ---
app.post('/api/registro', async (req, res) => {
    const { nombre_usuario, correo, contrasena } = req.body;

    try {
        // 1. Encriptamos la contraseña (10 vueltas de seguridad)
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        // 2. Guardamos en la base de datos usando Prisma
        const nuevoUsuario = await prisma.usuarios.create({
            data: {
                nombre_usuario,
                correo,
                contrasena_hash: hashedPassword, // Guardamos la versión segura
                puntos_experiencia: 0
            }
        });

        res.status(201).json({ mensaje: "Usuario creado con éxito", usuario: nuevoUsuario.nombre_usuario });
    } catch (error) {
        // Si el email ya existe, Prisma lanzará un error
        res.status(400).json({ error: "El usuario o email ya existe" });
    }
});

// --- RUTA DE LOGIN ---
app.post('/api/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        // 1. Buscamos al usuario por correo
        const usuario = await prisma.usuarios.findUnique({
            where: { correo: correo }
        });

        // 2. Si no existe, damos error
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // 3. Comparamos la contraseña escrita con la encriptada en la DB
        const passwordCorrecta = await bcrypt.compare(contrasena, usuario.contrasena_hash);

        if (!passwordCorrecta) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // 4. Si todo está bien, devolvemos éxito y sus datos
        res.json({
            mensaje: "Login exitoso",
            usuario: {
                id: usuario.id,
                nombre_usuario: usuario.nombre_usuario,
                puntos: usuario.puntos_experiencia
            }
        });

    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// --- RUTA OBTENER HÁBITOS DE UN USUARIO ---
app.get('/api/habitos/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;

    try {
        const misHabitos = await prisma.habitos.findMany({
            where: { usuario_id: parseInt(usuarioId) }
        });
        res.json(misHabitos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener hábitos" });
    }
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));