const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: [true, 'El año es requerido'],
    min: [1900, 'El año debe ser mayor a 1900'],
    max: [2100, 'El año debe ser menor a 2100']
  },
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true
  },
  category: {
    type: String,
    enum: {
      values: ['politico', 'social', 'personal', 'internacional'],
      message: 'La categoría debe ser politico, social, personal o internacional'
    },
    default: 'politico'
  },
  imageUrl: {
    type: String,
    trim: true
  },
  detailedContent: {
    type: String,
    trim: true
  },
  sources: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

timelineEventSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

timelineEventSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('TimelineEvent', timelineEventSchema);
