const mongoose = require('mongoose');

const biographySchema = new mongoose.Schema({
  section: {
    type: String,
    required: [true, 'La sección es requerida'],
    unique: true,
    trim: true,
    lowercase: true
  },
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  content: {
    type: String,
    required: [true, 'El contenido es requerido']
  },
  imageUrl: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

biographySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

biographySchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Biography', biographySchema);
