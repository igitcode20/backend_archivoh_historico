const mongoose = require('mongoose');

const mapLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [200, 'El nombre no puede exceder 200 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true
  },
  latitude: {
    type: Number,
    required: [true, 'La latitud es requerida'],
    min: [-90, 'La latitud debe ser mayor a -90'],
    max: [90, 'La latitud debe ser menor a 90']
  },
  longitude: {
    type: Number,
    required: [true, 'La longitud es requerida'],
    min: [-180, 'La longitud debe ser mayor a -180'],
    max: [180, 'La longitud debe ser menor a 180']
  },
  category: {
    type: String,
    enum: {
      values: ['historico', 'politico', 'cultural', 'personal'],
      message: 'La categoría debe ser historico, politico, cultural o personal'
    },
    default: 'historico'
  },
  year: {
    type: Number
  },
  imageUrl: {
    type: String,
    trim: true
  },
  details: {
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

module.exports = mongoose.model('MapLocation', mapLocationSchema);
