// server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// --- Rutas ---
app.get('/', (req, res) => {
    res.json({ mensaje: '¡El nuevo backend de Actas VOSIN está funcionando!' });
});

// Usar las rutas
app.use('/usuario', require('./routes/usuarios'));
app.use('/actas', require('./routes/actas'));
app.use('/contenido-actas', require('./routes/contenido'));
app.use('/firmas-users', require('./routes/firmas'));

const PORT = process.env.PORT || 3000; // <--- Render usa process.env.PORT
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
