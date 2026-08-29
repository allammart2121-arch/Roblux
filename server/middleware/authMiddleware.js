const jwt = require('jsonwebtoken');
const config = require('../config/config');
const db = require('../models/db');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Acceso no autorizado. Token requerido.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    const user = db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuario no encontrado o sesión expirada.' });
    }

    // Exclude password hash from req.user
    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token inválido o expirado.' });
  }
};
