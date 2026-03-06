// controllers/usuarioController.js

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Lógica de Login (CON DIAGNÓSTICO) ---
exports.loginUsuario = async (req, res) => {
    const { cedula, contrasena } = req.body;
    
    // 1. Ver qué llega del formulario
    console.log("--- INTENTO DE LOGIN ---");
    console.log(`Cédula recibida: '${cedula}'`);
    console.log(`Contraseña recibida: '${contrasena}'`);

    if (!cedula || !contrasena) { 
        console.log("❌ Faltan datos");
        return res.status(400).json({ message: 'Cédula y contraseña son requeridas.' }); 
    }

    try {
        const [rows] = await db.query('SELECT * FROM usuario WHERE cedula = ?', [cedula]);
        
        if (rows.length === 0) { 
            console.log("❌ Usuario NO encontrado en BD");
            return res.status(404).json({ message: 'Usuario no encontrado.' }); 
        }

        const usuario = rows[0];
        console.log("✅ Usuario encontrado:", usuario.nombre);
        console.log("🔑 Hash en BD:", usuario.contrasena);
        console.log("👮 Es Admin?:", usuario.admin);

        // Comparar contraseña
        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
        console.log("Resultado comparación bcrypt:", contrasenaValida);

        if (!contrasenaValida) { 
            console.log("❌ Contraseña INCORRECTA (El hash no coincide)");
            return res.status(401).json({ message: 'Credenciales incorrectas.' }); 
        }

        const esAdmin = !!usuario.admin;
        const esColaborador = !!(usuario.colaborador === 1 || usuario.colaborador === true);
        if (!esAdmin && !esColaborador) {
            console.log("❌ El usuario no tiene permiso para acceder al panel (requiere Administrador o Colaborador).");
            return res.status(403).json({ message: 'Acceso denegado. Solo usuarios con rol Administrador o Colaborador pueden acceder al sistema.' });
        }

        console.log("🚀 LOGIN EXITOSO");
        const payload = { cedula: usuario.cedula, nombre: usuario.nombre, admin: esAdmin, colaborador: esColaborador };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, nombre: usuario.nombre, admin: esAdmin, colaborador: esColaborador });

    } catch (error) {
        console.error("🔥 Error CRÍTICO en el login:", error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

// --- Lógica para Token de Firma ---
exports.obtenerUsuarioParaFirma = async (req, res) => {
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
        let query = `SELECT cedula, nombre, apellidos, email, empresa, cargo, admin, colaborador, estado FROM usuario`;
        let [rows] = await db.query(query);
        if (rows.length === 0) return res.json([]);
        res.json(rows);
    } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR' && error.message && error.message.includes('colaborador')) {
            try {
                const [rows] = await db.query(`SELECT cedula, nombre, apellidos, email, empresa, cargo, admin, estado FROM usuario`);
                const rowsConRol = rows.map(r => ({ ...r, colaborador: 0 }));
                return res.json(rowsConRol);
            } catch (err2) {
                console.error("Error al obtener los usuarios:", err2);
                return res.status(500).json({ message: 'Error en el servidor al obtener usuarios.' });
            }
        }
        console.error("Error al obtener los usuarios:", error);
        res.status(500).json({ message: 'Error en el servidor al obtener usuarios.' });
    }
};

// --- Lógica para obtener UN SOLO usuario por su cédula ---
exports.obtenerUsuarioPorCedula = async (req, res) => {
    const { cedula } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM usuario WHERE cedula = ?', [cedula]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

// --- Lógica para Crear un Nuevo Usuario ---
exports.crearUsuario = async (req, res) => {
    const { cedula, nombre, apellidos, email, empresa, cargo, contrasena, admin, colaborador, estado } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena || cedula.toString(), salt);

        const nuevoUsuario = {
            cedula, nombre, apellidos, email, empresa, cargo,
            contrasena: contrasenaEncriptada,
            admin: admin ? 1 : 0,
            colaborador: colaborador ? 1 : 0,
            estado: estado || 'activo'
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
    let camposAActualizar = { ...req.body };

    try {
        if (camposAActualizar.contrasena && camposAActualizar.contrasena.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            camposAActualizar.contrasena = await bcrypt.hash(camposAActualizar.contrasena, salt);
        } else {
            delete camposAActualizar.contrasena;
        }
        if (typeof camposAActualizar.admin !== 'undefined') {
            camposAActualizar.admin = camposAActualizar.admin ? 1 : 0;
        }
        if (typeof camposAActualizar.colaborador !== 'undefined') {
            camposAActualizar.colaborador = camposAActualizar.colaborador ? 1 : 0;
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

// --- Lógica para que el ADMIN cambie/restablezca la contraseña de un usuario ---
exports.cambiarContrasena = async (req, res) => {
    const { cedula } = req.params;
    const { nuevaContrasena } = req.body;

    if (!nuevaContrasena || typeof nuevaContrasena !== 'string' || nuevaContrasena.trim().length < 4) {
        return res.status(400).json({ message: 'La nueva contraseña es obligatoria y debe tener al menos 4 caracteres.' });
    }

    try {
        const [rows] = await db.query('SELECT cedula FROM usuario WHERE cedula = ?', [cedula]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(nuevaContrasena.trim(), salt);
        const [result] = await db.query('UPDATE usuario SET contrasena = ? WHERE cedula = ?', [contrasenaEncriptada, cedula]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ message: 'Error en el servidor al cambiar la contraseña.' });
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

// --- Lógica de Verificación de Token ---
// Esta función ahora está correctamente ubicada en la raíz
exports.verificarToken = (req, res) => {
    res.json({ success: true, message: 'Token válido.' });
};

// --- NUEVA FUNCIÓN PARA REGISTRO PÚBLICO ---
exports.crearAsistentePublico = async (req, res) => {
    const { cedula, nombre, apellidos, empresa, cargo, telefono, email } = req.body;
    
    // La contraseña por defecto es la cédula
    const contrasenaDefault = cedula.toString(); 

    try {
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasenaDefault, salt);

        const nuevoUsuario = {
            cedula, nombre, apellidos, empresa, cargo, telefono, email,
            contrasena: contrasenaEncriptada,
            admin: 0,
            estado: 'activo'
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
};