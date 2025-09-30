// controllers/usuarioController.js

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Lógica de Login ---
exports.loginUsuario = async (req, res) => {
    // ... tu código de login que ya funciona bien ...
    const { cedula, contrasena } = req.body;
    if (!cedula || !contrasena) { return res.status(400).json({ message: 'Cédula y contraseña son requeridas.' }); }
    try {
        const [rows] = await db.query('SELECT * FROM usuario WHERE cedula = ?', [cedula]);
        if (rows.length === 0) { return res.status(404).json({ message: 'Usuario no encontrado.' }); }
        const usuario = rows[0];
        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!contrasenaValida) { return res.status(401).json({ message: 'Credenciales incorrectas.' }); }
        if (!usuario.admin) { return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' }); }
        const payload = { cedula: usuario.cedula, nombre: usuario.nombre };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, nombre: usuario.nombre, admin: usuario.admin });
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

// --- Lógica para Token de Firma ---
exports.obtenerUsuarioParaFirma = async (req, res) => {
    // ... tu código de token para firma no cambia ...
    try {
        const { cedula, acta_codigo } = req.body;
        if (!cedula || !acta_codigo) { return res.status(400).json({ message: 'La cédula y el código del acta son requeridos.' }); }
        const [rows] = await db.query('SELECT * FROM usuario WHERE cedula = ?', [cedula]);
        if (rows.length === 0) { return res.status(404).json({ message: 'Usuario no encontrado.' }); }
        const usuario = rows[0];
        const payload = { cedula: usuario.cedula, nombre: `${usuario.nombre} ${usuario.apellidos}`, acta_codigo: acta_codigo };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json([token]);
    } catch (error) {
        console.error("Error al generar token de firma:", error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

// --- Lógica para Obtener todos los Usuarios ---
exports.obtenerUsuarios = async (req, res) => {
    try {
        const query = `SELECT cedula, nombre, apellidos, email, empresa, cargo, admin, estado FROM usuario`;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        res.status(500).json({ message: 'Error en el servidor al obtener usuarios.' });
    }
};

// --- Lógica para obtener UN SOLO usuario por su cédula ---
exports.obtenerUsuarioPorCedula = async (req, res) => {
    const { cedula } = req.params; // Obtenemos la cédula desde la URL
    try {
        const [rows] = await db.query('SELECT * FROM usuario WHERE cedula = ?', [cedula]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json(rows[0]); // Devolvemos el objeto del usuario
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

// --- Lógica para Crear un Nuevo Usuario ---
exports.crearUsuario = async (req, res) => {
    const { cedula, nombre, apellidos, email, empresa, cargo, contrasena, admin, estado } = req.body;
    try {
        // Encriptar la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

        const nuevoUsuario = {
            cedula, nombre, apellidos, email, empresa, cargo, 
            contrasena: contrasenaEncriptada,
            admin: admin || 0, // Por defecto no es admin
            estado: estado || 'activo' // Por defecto está activo
        };

        await db.query('INSERT INTO usuario SET ?', [nuevoUsuario]);
        res.status(201).json({ message: 'Usuario creado exitosamente.' });
    } catch (error) {
        console.error("Error al crear usuario:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El número de documento ya se encuentra registrado.' });
        }
        res.status(500).json({ message: 'Error en el servidor al crear usuario.' });
    }
};

// --- Lógica para Actualizar un Usuario ---
exports.actualizarUsuario = async (req, res) => {
    const { cedula } = req.params;
    const camposAActualizar = req.body;

    try {
        // Si se está actualizando la contraseña, hay que encriptarla
        if (camposAActualizar.contrasena) {
            const salt = await bcrypt.genSalt(10);
            camposAActualizar.contrasena = await bcrypt.hash(camposAActualizar.contrasena, salt);
        }

        const [result] = await db.query('UPDATE usuario SET ? WHERE cedula = ?', [camposAActualizar, cedula]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json({ message: 'Usuario actualizado exitosamente.' });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ message: 'Error en el servidor al actualizar usuario.' });
    }
};

// --- Lógica para Eliminar un Usuario ---
exports.eliminarUsuario = async (req, res) => {
    const { cedula } = req.params;
    try {
        const [result] = await db.query('DELETE FROM usuario WHERE cedula = ?', [cedula]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json({ message: 'Usuario eliminado exitosamente.' });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ message: 'Error en el servidor al eliminar usuario.' });
    }
};
// Esta función solo se ejecuta si el authMiddleware (el "guardia") dice que el token es válido
exports.verificarToken = (req, res) => {
    // Si el código llega hasta aquí, significa que el token es bueno.
    // Simplemente enviamos una respuesta de éxito para confirmar.
    res.json({ success: true, message: 'Token válido.' });
};
// --- NUEVA FUNCIÓN PARA REGISTRO PÚBLICO ---
exports.crearAsistentePublico = async (req, res) => {
    // Tomamos los datos del formulario que envía el frontend
    const { cedula, nombre, apellidos, empresa, cargo, telefono, email } = req.body;

    // La contraseña será la misma cédula por defecto, y no será admin
    const contrasena = cedula; 
    const admin = 0;
    const estado = 'activo';

    try {
        // Encriptamos la contraseña (la cédula) antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena.toString(), salt);

        const nuevoUsuario = {
            cedula, nombre, apellidos, empresa, cargo, telefono, email,
            contrasena: contrasenaEncriptada,
            admin,
            estado
        };

        await db.query('INSERT INTO usuario SET ?', [nuevoUsuario]);
        res.status(201).json({ message: 'Usuario registrado exitosamente.' });

    } catch (error) {
        console.error("Error al crear asistente público:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El número de documento ya se encuentra registrado.' });
        }
        res.status(500).json({ message: 'Error en el servidor.' });
    }

    // Esta función solo se ejecuta si el authMiddleware dice que el token es válido
    exports.verificarToken = (req, res) => {
    // Si llegamos aquí, el token es bueno. Simplemente enviamos una respuesta de éxito.
    res.json({ success: true, message: 'Token válido.' });
    };

};