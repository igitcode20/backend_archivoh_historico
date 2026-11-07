const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const GalleryPhoto = require('../models/GalleryPhoto');
const { verifyToken, isAdmin, isEditorOrAdmin } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// GET /api/gallery - Get all photos (public, filterable by decade)
router.get('/', async (req, res) => {
  try {
    const { decade, category } = req.query;
    const filter = {};

    if (decade) {
      filter.decade = decade;
    }
    if (category) {
      filter.category = category;
    }

    const photos = await GalleryPhoto.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');

    res.json({
      success: true,
      count: photos.length,
      photos
    });
  } catch (error) {
    console.error('Error al obtener fotos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/gallery/:id - Get single photo (public)
router.get('/:id', async (req, res) => {
  try {
    const photo = await GalleryPhoto.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    res.json({
      success: true,
      photo
    });
  } catch (error) {
    console.error('Error al obtener foto:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/gallery - Create with image upload (protected, editor+)
router.post('/', verifyToken, isEditorOrAdmin, uploadImage, [
  body('title')
    .notEmpty().withMessage('El título es requerido')
    .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres')
    .trim(),
  body('decade')
    .notEmpty().withMessage('La década es requerida')
    .isIn(['1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']).withMessage('Década no válida')
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

    const photoData = {
      ...req.body,
      createdBy: req.user._id
    };

    // If image was uploaded, set imageUrl
    if (req.file) {
      photoData.imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!photoData.imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una imagen (subir archivo o proporcionar imageUrl)'
      });
    }

    const photo = new GalleryPhoto(photoData);
    await photo.save();

    const populatedPhoto = await GalleryPhoto.findById(photo._id)
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Foto creada exitosamente',
      photo: populatedPhoto
    });
  } catch (error) {
    console.error('Error al crear foto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/gallery/:id - Update (protected, editor+)
router.put('/:id', verifyToken, isEditorOrAdmin, uploadImage, [
  body('title')
    .optional()
    .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres')
    .trim(),
  body('decade')
    .optional()
    .isIn(['1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']).withMessage('Década no válida')
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

    const updateData = { ...req.body };

    // If new image was uploaded, update imageUrl
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const photo = await GalleryPhoto.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Foto actualizada exitosamente',
      photo
    });
  } catch (error) {
    console.error('Error al actualizar foto:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/gallery/:id - Delete (protected, admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const photo = await GalleryPhoto.findByIdAndDelete(req.params.id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Foto eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar foto:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
