const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
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
  videoUrl: {
    type: String,
    required: [true, 'La URL del video es requerida'],
    trim: true
  },
  thumbnailUrl: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: {
      values: ['discurso', 'entrevista', 'evento', 'documental'],
      message: 'La categoría debe ser discurso, entrevista, evento o documental'
    },
    default: 'evento'
  },
  duration: {
    type: String,
    trim: true
  },
  date: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    trim: true
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

module.exports = mongoose.model('Video', videoSchema);
