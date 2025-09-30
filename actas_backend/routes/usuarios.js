// routes/usuarios.js

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/authMiddleware');


// --- Rutas Públicas ---
router.post('/login', usuarioController.loginUsuario);


// ****** INICIO DE LA NUEVA RUTA PÚBLICA ******
router.post('/obtener_por_cedulas', usuarioController.obtenerUsuarioParaFirma);
router.post('/crear-asistente', usuarioController.crearAsistentePublico);

// ****** FIN DE LA NUEVA RUTA PÚBLICA ******


// --- Rutas Protegidas (requieren token de admin) ---
router.get('/obtener', authMiddleware, usuarioController.obtenerUsuarios);
router.get('/verificar-token', authMiddleware, usuarioController.verificarToken);
router.get('/obtener/:cedula', authMiddleware, usuarioController.obtenerUsuarioPorCedula);
router.post('/crear', authMiddleware, usuarioController.crearUsuario);
router.patch('/actualizar/:cedula', authMiddleware, usuarioController.actualizarUsuario);
router.delete('/eliminar/:cedula', authMiddleware, usuarioController.eliminarUsuario);

module.exports = router;