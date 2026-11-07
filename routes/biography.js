const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Biography = require('../models/Biography');
const { verifyToken, isAdmin, isEditorOrAdmin } = require('../middleware/auth');

// GET /api/biography - Get all sections (public, sorted by order)
router.get('/', async (req, res) => {
  try {
    const sections = await Biography.find()
      .sort({ order: 1 })
      .populate('createdBy', 'username');

    res.json({
      success: true,
      count: sections.length,
      sections
    });
  } catch (error) {
    console.error('Error al obtener secciones de biografía:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/biography/:id - Get single section (public)
router.get('/:id', async (req, res) => {
  try {
    const section = await Biography.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }

    res.json({
      success: true,
      section
    });
  } catch (error) {
    console.error('Error al obtener sección:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/biography - Create (protected, admin only)
router.post('/', verifyToken, isAdmin, [
  body('section')
    .notEmpty().withMessage('La sección es requerida')
    .trim(),
  body('title')
    .notEmpty().withMessage('El título es requerido')
    .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres')
    .trim(),
  body('content')
    .notEmpty().withMessage('El contenido es requerido'),
  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('El orden debe ser un número entero positivo')
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

    // Check if section already exists
    const existingSection = await Biography.findOne({ section: req.body.section.toLowerCase() });
    if (existingSection) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una sección con ese identificador'
      });
    }

    const sectionData = {
      ...req.body,
      createdBy: req.user._id
    };

    const section = new Biography(sectionData);
    await section.save();

    const populatedSection = await Biography.findById(section._id)
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Sección de biografía creada exitosamente',
      section: populatedSection
    });
  } catch (error) {
    console.error('Error al crear sección:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una sección con ese identificador'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/biography/:id - Update (protected, editor+)
router.put('/:id', verifyToken, isEditorOrAdmin, [
  body('title')
    .optional()
    .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres')
    .trim(),
  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('El orden debe ser un número entero positivo')
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

    const section = await Biography.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Sección actualizada exitosamente',
      section
    });
  } catch (error) {
    console.error('Error al actualizar sección:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una sección con ese identificador'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/biography/:id - Delete (protected, admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const section = await Biography.findByIdAndDelete(req.params.id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Sección eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar sección:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
