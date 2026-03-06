// controllers/firmaController.js
const db = require('../config/db');

// --- FUNCIÓN DE AYUDA (HELPER) ---
// Copiamos la misma función reutilizable para comprobar si un acta está finalizada.
async function isActaFinalizada(codigoActa) {
    const [actas] = await db.query('SELECT firma FROM acta WHERE codigo = ?', [codigoActa]);
    if (actas.length === 0) {
        throw new Error('Acta no encontrada.');
    }
    return actas[0].firma.toLowerCase() === 'finalizado';
}


exports.crearFirma = async (req, res) => {
    // Obtenemos los datos del asistente desde el middleware
    const { cedula, acta_codigo } = req.asistente;
    // Obtenemos la imagen de la firma del cuerpo de la petición
    const { firma } = req.body;

    if (!firma) {
        return res.status(400).json({ message: 'No se proporcionó la firma.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // --- INICIO DE LA NUEVA VERIFICACIÓN DE BLOQUEO ---
        // Usamos nuestra función de ayuda. Si el acta está cerrada, detenemos todo.
        if (await isActaFinalizada(acta_codigo)) {
            await connection.rollback(); // Revertimos la transacción antes de salir
            return res.status(403).json({ 
                message: 'Acción prohibida: Esta acta está finalizada y ya no se pueden añadir más firmas.' 
            });
        }
        // --- FIN DE LA NUEVA VERIFICACIÓN DE BLOQUEO ---

        // Si el acta no está bloqueada, el código original continúa
        // 1. Insertar la nueva firma en la tabla 'firmas_user'
        await connection.query('INSERT INTO firmas_user SET ?', {
            usuario: cedula,
            acta: acta_codigo,
            firma: firma
        });

        // 2. Actualizar la lista de usuarios en la tabla 'acta'
        const [actas] = await connection.query('SELECT usuarios FROM acta WHERE codigo = ?', [acta_codigo]);
        if (!actas || actas.length === 0) {
            await connection.rollback();
            return res.status(500).json({ message: 'Error al actualizar el acta.' });
        }
        let usuariosActuales = actas[0].usuarios ? actas[0].usuarios.split(',') : [];

        if (!usuariosActuales.includes(String(cedula))) {
            usuariosActuales.push(cedula);
            await connection.query('UPDATE acta SET usuarios = ? WHERE codigo = ?', [usuariosActuales.join(','), acta_codigo]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Firma registrada exitosamente.' });

    } catch (error) {
        await connection.rollback();
        console.error("Error al registrar la firma:", error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Error: Este usuario ya ha firmado esta acta.' });
        }
        
        res.status(500).json({ message: 'Error en el servidor al registrar la firma.' });

    } finally {
        connection.release();
    }
};

// La función para verificar si un usuario ya firmó no necesita cambios.
exports.verificarFirmaExistente = async (req, res) => {
    try {
        const { acta_codigo, cedula } = req.body;

        if (!acta_codigo || !cedula) {
            return res.status(400).json({ message: 'Faltan datos para la verificación.' });
        }

        const [rows] = await db.query(
            'SELECT COUNT(*) AS total FROM firmas_user WHERE acta = ? AND usuario = ?', 
            [acta_codigo, cedula]
        );
        
        const yaFirmo = rows[0].total > 0;
        
        res.json({ yaFirmo: yaFirmo });

    } catch (error) {
        console.error("Error al verificar la firma:", error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};