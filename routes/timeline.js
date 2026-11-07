const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const TimelineEvent = require('../models/TimelineEvent');
const { verifyToken, isAdmin, isEditorOrAdmin } = require('../middleware/auth');

// GET /api/timeline - Get all events (public, sorted by year)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    const events = await TimelineEvent.find(filter)
      .sort({ year: 1 })
      .populate('createdBy', 'username');

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/timeline/:id - Get single event (public)
router.get('/:id', async (req, res) => {
  try {
    const event = await TimelineEvent.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error al obtener evento:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/timeline - Create event (protected, editor+)
router.post('/', verifyToken, isEditorOrAdmin, [
  body('year')
    .isInt({ min: 1900, max: 2100 }).withMessage('El año debe ser un número entre 1900 y 2100'),
  body('title')
    .notEmpty().withMessage('El título es requerido')
    .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres')
    .trim(),
  body('description')
    .notEmpty().withMessage('La descripción es requerida')
    .trim(),
  body('category')
    .optional()
    .isIn(['politico', 'social', 'personal', 'internacional']).withMessage('Categoría no válida')
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

    const eventData = {
      ...req.body,
      createdBy: req.user._id
    };

    const event = new TimelineEvent(eventData);
    await event.save();

    const populatedEvent = await TimelineEvent.findById(event._id)
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      event: populatedEvent
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/timeline/:id - Update event (protected, editor+)
router.put('/:id', verifyToken, isEditorOrAdmin, [
  body('year')
    .optional()
    .isInt({ min: 1900, max: 2100 }).withMessage('El año debe ser un número entre 1900 y 2100'),
  body('title')
    .optional()
    .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres')
    .trim(),
  body('category')
    .optional()
    .isIn(['politico', 'social', 'personal', 'internacional']).withMessage('Categoría no válida')
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

    const event = await TimelineEvent.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      event
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/timeline/:id - Delete event (protected, admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const event = await TimelineEvent.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
