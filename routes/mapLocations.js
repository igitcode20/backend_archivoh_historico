const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const MapLocation = require('../models/MapLocation');
const { verifyToken, isAdmin, isEditorOrAdmin } = require('../middleware/auth');

// GET /api/map-locations - Get all (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    const locations = await MapLocation.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');

    res.json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/map-locations/:id - Get single (public)
router.get('/:id', async (req, res) => {
  try {
    const location = await MapLocation.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada'
      });
    }

    res.json({
      success: true,
      location
    });
  } catch (error) {
    console.error('Error al obtener ubicación:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/map-locations - Create (protected, editor+)
router.post('/', verifyToken, isEditorOrAdmin, [
  body('name')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 200 }).withMessage('El nombre no puede exceder 200 caracteres')
    .trim(),
  body('description')
    .notEmpty().withMessage('La descripción es requerida')
    .trim(),
  body('latitude')
    .isFloat({ min: -90, max: 90 }).withMessage('La latitud debe ser un número entre -90 y 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 }).withMessage('La longitud debe ser un número entre -180 y 180'),
  body('category')
    .optional()
    .isIn(['historico', 'politico', 'cultural', 'personal']).withMessage('Categoría no válida')
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

    const locationData = {
      ...req.body,
      createdBy: req.user._id
    };

    const location = new MapLocation(locationData);
    await location.save();

    const populatedLocation = await MapLocation.findById(location._id)
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Ubicación creada exitosamente',
      location: populatedLocation
    });
  } catch (error) {
    console.error('Error al crear ubicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/map-locations/:id - Update (protected, editor+)
router.put('/:id', verifyToken, isEditorOrAdmin, [
  body('name')
    .optional()
    .isLength({ max: 200 }).withMessage('El nombre no puede exceder 200 caracteres')
    .trim(),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('La latitud debe ser un número entre -90 y 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('La longitud debe ser un número entre -180 y 180'),
  body('category')
    .optional()
    .isIn(['historico', 'politico', 'cultural', 'personal']).withMessage('Categoría no válida')
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

    const location = await MapLocation.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Ubicación actualizada exitosamente',
      location
    });
  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/map-locations/:id - Delete (protected, admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const location = await MapLocation.findByIdAndDelete(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Ubicación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar ubicación:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
