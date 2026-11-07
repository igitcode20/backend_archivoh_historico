const mongoose = require('mongoose');

const galleryPhotoSchema = new mongoose.Schema({
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
  imageUrl: {
    type: String,
    required: [true, 'La URL de la imagen es requerida'],
    trim: true
  },
  decade: {
    type: String,
    required: [true, 'La década es requerida'],
    enum: {
      values: ['1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],
      message: 'Década no válida'
    }
  },
  category: {
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

module.exports = mongoose.model('GalleryPhoto', galleryPhotoSchema);
