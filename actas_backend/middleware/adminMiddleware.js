// middleware/adminMiddleware.js
// Restringe la ruta solo a usuarios con rol de administrador (debe usarse después de authMiddleware).

module.exports = function(req, res, next) {
    if (!req.usuario || !req.usuario.admin) {
        return res.status(403).json({ message: 'Acción no permitida. Solo un administrador puede realizar esta operación.' });
    }
    next();
};
