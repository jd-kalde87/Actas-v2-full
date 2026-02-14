// controllers/actaController.js

const db = require('../config/db');

// Lógica para obtener todas las actas
exports.obtenerActas = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM acta ORDER BY fecha DESC');
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener las actas:", error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

// Lógica para crear una nueva acta
exports.crearActa = async (req, res) => {
    // 1. Obtener los datos del cuerpo de la petición
    const {
        tipo_reunion, fecha, tema, lugar,
        temario, // Array
        usuarios, // Array
        create_acta_user, horaInicio, horaFin,
        cantidad_asistentes, firma
    } = req.body;

    try {
        // 2. Generar un código único
        const date = new Date();
        const dateString = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(date.getFullYear()).slice(-2)}`;
        
        let sequence = 1;
        let codigo;
        let existente;

        do {
            codigo = `ACTA-${dateString}-${sequence}`;
            const [rows] = await db.query('SELECT codigo FROM acta WHERE codigo = ?', [codigo]);
            existente = rows.length > 0;
            if (existente) sequence++;
        } while (existente);
        
        // 3. Preparar los datos (CON VALIDACIÓN DE ARRAY)
        // Usamos '||' como separador seguro para evitar conflictos con comas
        const temarioString = Array.isArray(temario) ? temario.join('||') : temario;
        const usuariosString = Array.isArray(usuarios) ? usuarios.join('||') : usuarios;

        const nuevaActa = {
            codigo, tipo_reunion, fecha, tema, lugar,
            temario: temarioString,
            usuarios: usuariosString,
            create_acta_user, horaInicio, horaFin, cantidad_asistentes,
            firma: firma || "", // Evita nulos
            estado: 1 
        };

        // 4. Insertar la nueva acta
        await db.query('INSERT INTO acta SET ?', [nuevaActa]);

        res.status(201).json(nuevaActa);

    } catch (error) {
        console.error("Error al crear el acta:", error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

// Lógica para actualizar un acta existente
exports.actualizarActa = async (req, res) => {
    const { codigo } = req.params;
    const camposAActualizar = req.body;

    try {
        // 1. Verificar estado actual
        const [actas] = await db.query('SELECT firma, cantidad_asistentes FROM acta WHERE codigo = ?', [codigo]);
        if (actas.length === 0) {
            return res.status(404).json({ message: 'Acta no encontrada.' });
        }
        const actaActual = actas[0];

        // 2. Bloqueo si ya está finalizada
        if (actaActual.firma && actaActual.firma.toLowerCase() === 'finalizado') {
            return res.status(403).json({ 
                message: 'Acción prohibida: Esta acta está finalizada y no puede ser modificada.' 
            });
        }
        
        // 3. Conversión segura de arrays a string con '||'
        if (camposAActualizar.temario && Array.isArray(camposAActualizar.temario)) {
            camposAActualizar.temario = camposAActualizar.temario.join('||');
        }
        if (camposAActualizar.usuarios && Array.isArray(camposAActualizar.usuarios)) {
            camposAActualizar.usuarios = camposAActualizar.usuarios.join('||');
        }

        // // 4. Verificación de firmas antes de finalizar
        // if (camposAActualizar.firma && camposAActualizar.firma.toLowerCase() === 'finalizado') {
        //     const [firmasResult] = await db.query('SELECT COUNT(*) AS totalFirmas FROM firmas_user WHERE acta = ?', [codigo]);
        //     const firmasRegistradas = firmasResult[0].totalFirmas;
        //     const asistentesRequeridos = actaActual.cantidad_asistentes;

        //     if (firmasRegistradas < asistentesRequeridos) {
        //         const firmasFaltantes = asistentesRequeridos - firmasRegistradas;
        //         return res.status(409).json({ 
        //             message: `No se puede finalizar: Faltan ${firmasFaltantes} firma(s). Se requieren ${asistentesRequeridos} en total.` 
        //         });
        //     }
        // }

        // 5. Ejecutar actualización
        const [result] = await db.query('UPDATE acta SET ? WHERE codigo = ?', [camposAActualizar, codigo]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Acta no encontrada.' });
        }
        res.json({ message: 'Acta actualizada exitosamente.' });

    } catch (error) {
        console.error("Error al actualizar el acta:", error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

// Lógica para eliminar un acta
exports.eliminarActa = async (req, res) => {
    try {
        const { codigo } = req.params;

        const [actas] = await db.query('SELECT firma FROM acta WHERE codigo = ?', [codigo]);
        if (actas.length === 0) return res.status(404).json({ message: 'Acta no encontrada.' });
        
        if (actas[0].firma && actas[0].firma.toLowerCase() === 'finalizado') {
            return res.status(403).json({ message: 'Acción prohibida: Un acta finalizada no puede ser eliminada.' });
        }

        await db.query('DELETE FROM contenido_acta WHERE acta_ID = ?', [codigo]);
        await db.query('DELETE FROM firmas_user WHERE acta = ?', [codigo]);
        const [result] = await db.query('DELETE FROM acta WHERE codigo = ?', [codigo]);
        
        res.json({ message: 'Acta eliminada exitosamente.' });

    } catch (error) {
        console.error("Error al eliminar el acta:", error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

// Lógica para obtener UNA SOLA acta
exports.obtenerActaPorCodigo = async (req, res) => {
    try {
        const { codigo } = req.params;
        const [rows] = await db.query('SELECT * FROM acta WHERE codigo = ?', [codigo]);

        if (rows.length === 0) return res.status(404).json({ message: 'Acta no encontrada.' });
        res.json(rows[0]);
    } catch (error) {
        console.error("Error al obtener el acta:", error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

// --- OPTIMIZACIÓN IMPORTANTE: Promise.all para cargar el PDF más rápido ---
exports.obtenerPdfData = async (req, res) => {
    try {
        const { codigo } = req.params;

        // Ejecutamos las 3 consultas en paralelo para ganar velocidad
        const [actaResult, contenidoResult, firmasResult] = await Promise.all([
            db.query('SELECT *, cantidad_asistentes as numeroParticipantes FROM acta WHERE codigo = ?', [codigo]),
            db.query('SELECT * FROM contenido_acta WHERE acta_ID = ?', [codigo]),
            db.query(`
                SELECT u.nombre, u.apellidos, u.empresa, u.cargo, f.firma 
                FROM firmas_user f
                JOIN usuario u ON f.usuario = u.cedula
                WHERE f.acta = ?
            `, [codigo])
        ]);

        const actas = actaResult[0]; // El primer elemento es el array de filas
        if (actas.length === 0) {
            return res.status(404).json({ message: 'Acta no encontrada.' });
        }

        res.json({
            acta: actas[0],
            contenido: contenidoResult[0], // contenidoResult[0] son las filas
            firmas: firmasResult[0]       // firmasResult[0] son las filas
        });

    } catch (error) {
        console.error("Error al obtener los datos para el PDF:", error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};