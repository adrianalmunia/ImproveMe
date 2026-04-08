const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient(); // En la v6, esto busca automáticamente la URL en el .env

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

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));