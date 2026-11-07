const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { verifyToken, isAdmin, isEditorOrAdmin } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload');

// GET /api/documents - Get all (public, filterable by category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    const documents = await Document.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');

    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/documents/:id - Get single (public)
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error al obtener documento:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/documents - Create with file upload (protected, editor+)
router.post('/', verifyToken, isEditorOrAdmin, uploadDocument, [
  body('title')
    .notEmpty().withMessage('El título es requerido')
    .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres')
    .trim(),
  body('category')
    .optional()
    .isIn(['libro', 'articulo', 'informe', 'discurso']).withMessage('Categoría no válida')
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

    const docData = {
      ...req.body,
      createdBy: req.user._id
    };

    // If file was uploaded, set fileUrl
    if (req.file) {
      docData.fileUrl = `/uploads/${req.file.filename}`;
    }

    if (!docData.fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un archivo (subir archivo o proporcionar fileUrl)'
      });
    }

    // Parse pages as number if provided
    if (docData.pages) {
      docData.pages = parseInt(docData.pages, 10);
    }

    const document = new Document(docData);
    await document.save();

    const populatedDoc = await Document.findById(document._id)
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Documento creado exitosamente',
      document: populatedDoc
    });
  } catch (error) {
    console.error('Error al crear documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/documents/:id - Update (protected, editor+)
router.put('/:id', verifyToken, isEditorOrAdmin, uploadDocument, [
  body('title')
    .optional()
    .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres')
    .trim(),
  body('category')
    .optional()
    .isIn(['libro', 'articulo', 'informe', 'discurso']).withMessage('Categoría no válida')
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

    // If new file was uploaded, update fileUrl
    if (req.file) {
      updateData.fileUrl = `/uploads/${req.file.filename}`;
    }

    // Parse pages as number if provided
    if (updateData.pages) {
      updateData.pages = parseInt(updateData.pages, 10);
    }

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Documento actualizado exitosamente',
      document
    });
  } catch (error) {
    console.error('Error al actualizar documento:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/documents/:id - Delete (protected, admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Documento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/documents/:id/download - Increment download count (public)
router.put('/:id/download', async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Contador de descargas actualizado',
      downloadCount: document.downloadCount
    });
  } catch (error) {
    console.error('Error al incrementar descargas:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
