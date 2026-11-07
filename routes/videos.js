const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Video = require('../models/Video');
const { verifyToken, isAdmin, isEditorOrAdmin } = require('../middleware/auth');

// GET /api/videos - Get all (public, filterable by category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    const videos = await Video.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');

    res.json({
      success: true,
      count: videos.length,
      videos
    });
  } catch (error) {
    console.error('Error al obtener videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/videos/:id - Get single (public)
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video no encontrado'
      });
    }

    res.json({
      success: true,
      video
    });
  } catch (error) {
    console.error('Error al obtener video:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Video no encontrado'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/videos - Create (protected, editor+)
router.post('/', verifyToken, isEditorOrAdmin, [
  body('title')
    .notEmpty().withMessage('El título es requerido')
    .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres')
    .trim(),
  body('videoUrl')
    .notEmpty().withMessage('La URL del video es requerida')
    .isURL().withMessage('Debe ser una URL válida')
    .trim(),
  body('category')
    .optional()
    .isIn(['discurso', 'entrevista', 'evento', 'documental']).withMessage('Categoría no válida')
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

    const videoData = {
      ...req.body,
      createdBy: req.user._id
    };

    const video = new Video(videoData);
    await video.save();

    const populatedVideo = await Video.findById(video._id)
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Video creado exitosamente',
      video: populatedVideo
    });
  } catch (error) {
    console.error('Error al crear video:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/videos/:id - Update (protected, editor+)
router.put('/:id', verifyToken, isEditorOrAdmin, [
  body('title')
    .optional()
    .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres')
    .trim(),
  body('videoUrl')
    .optional()
    .isURL().withMessage('Debe ser una URL válida')
    .trim(),
  body('category')
    .optional()
    .isIn(['discurso', 'entrevista', 'evento', 'documental']).withMessage('Categoría no válida')
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

    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Video actualizado exitosamente',
      video
    });
  } catch (error) {
    console.error('Error al actualizar video:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Video no encontrado'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/videos/:id - Delete (protected, admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Video eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar video:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Video no encontrado'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
