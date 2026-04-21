const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

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
    const { username, email, password } = req.body;

    try {
        // 1. Encriptamos la contraseña (10 vueltas de seguridad)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Guardamos en la base de datos usando Prisma
        const nuevoUsuario = await prisma.usuarios.create({
            data: {
                username,
                email,
                password_hash: hashedPassword, // Guardamos la versión segura
                puntos_xp: 0
            }
        });

        res.status(201).json({ mensaje: "Usuario creado con éxito", usuario: nuevoUsuario.username });
    } catch (error) {
        // Si el email ya existe, Prisma lanzará un error
        res.status(400).json({ error: "El usuario o email ya existe" });
    }
});

// --- RUTA DE LOGIN ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscamos al usuario por email
        const usuario = await prisma.usuarios.findUnique({
            where: { email: email }
        });

        // 2. Si no existe, damos error
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // 3. Comparamos la contraseña escrita con la encriptada en la DB
        const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordCorrecta) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // 4. Si todo está bien, devolvemos éxito y sus datos
        res.json({
            mensaje: "Login exitoso",
            usuario: {
                id: usuario.id_usuario,
                username: usuario.username,
                puntos: usuario.puntos_xp
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
            where: { id_usuario: parseInt(usuarioId) }
        });
        res.json(misHabitos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener hábitos" });
    }
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));