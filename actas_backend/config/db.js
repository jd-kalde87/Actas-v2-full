// config/db.js

// 1. Cargar la librería para leer nuestro archivo .env
require('dotenv').config();

// 2. Importar la librería de MySQL
const mysql = require('mysql2');

// 3. Crear un "pool" de conexiones a la base de datos
// Un pool es más eficiente que una conexión única porque gestiona y reutiliza conexiones.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

// 4. Exportamos una versión del pool que nos permite usar la sintaxis moderna async/await
module.exports = pool.promise();
