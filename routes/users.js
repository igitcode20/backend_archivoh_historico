const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(verifyToken, isAdmin);

// GET /api/users - List all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/users - Create new user
router.post('/', [
  body('username')
    .notEmpty().withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres')
    .trim(),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'editor']).withMessage('El rol debe ser admin o editor'),
  body('email')
    .optional()
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { username, password, role, email } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya está en uso'
      });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso'
        });
      }
    }

    const user = new User({
      username,
      password,
      role: role || 'editor',
      email: email || undefined
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario o email ya está en uso'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/users/:id - Update user role
router.put('/:id', [
  body('role')
    .optional()
    .isIn(['admin', 'editor']).withMessage('El rol debe ser admin o editor'),
  body('email')
    .optional()
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('username')
    .optional()
    .isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres')
    .trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const { role, email, username } = req.body;

    if (role) user.role = role;
    if (email !== undefined) user.email = email || undefined;
    if (username) user.username = username;

    await user.save();

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario o email ya está en uso'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/users/:id - Delete user (can't delete self)
router.delete('/:id', async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
