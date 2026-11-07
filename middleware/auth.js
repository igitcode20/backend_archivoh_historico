const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token from Authorization header.
 * Attaches the user object to req.user.
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token de autenticación.'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. El usuario no existe.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor inicie sesión nuevamente.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error al verificar el token.'
    });
  }
};

/**
 * Check if user has admin role.
 * Must be used after verifyToken.
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de administrador.'
    });
  }

  next();
};

/**
 * Check if user has editor or admin role.
 * Must be used after verifyToken.
 */
const isEditorOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado.'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'editor') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de editor o administrador.'
    });
  }

  next();
};

module.exports = { verifyToken, isAdmin, isEditorOrAdmin };
