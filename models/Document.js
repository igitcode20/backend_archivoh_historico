const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'La URL del archivo es requerida'],
    trim: true
  },
  category: {
    type: String,
    enum: {
      values: ['libro', 'articulo', 'informe', 'discurso'],
      message: 'La categoría debe ser libro, articulo, informe o discurso'
    },
    default: 'articulo'
  },
  author: {
    type: String,
    trim: true
  },
  date: {
    type: String,
    trim: true
  },
  pages: {
    type: Number,
    min: [0, 'El número de páginas no puede ser negativo']
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', documentSchema);
