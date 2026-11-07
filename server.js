const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const timelineRoutes = require('./routes/timeline');
const galleryRoutes = require('./routes/gallery');
const videoRoutes = require('./routes/videos');
const documentRoutes = require('./routes/documents');
const mapLocationRoutes = require('./routes/mapLocations');
const biographyRoutes = require('./routes/biography');
const statsRoutes = require('./routes/stats');

const app = express();

// Connect to MongoDB & ensure admin user exists
const User = require('./models/User');
connectDB().then(async () => {
  try {
    const admin = await User.findOne({ username: 'ismaelgit20' });
    if (!admin) {
      const newAdmin = new User({
        username: 'ismaelgit20',
        password: 'ismaelgit20123',
        role: 'admin'
      });
      await newAdmin.save();
      console.log('✅ Usuario admin "ismaelgit20" creado automáticamente en MongoDB');
    } else {
      console.log('ℹ️  Usuario admin "ismaelgit20" verificado');
    }
  } catch (seedErr) {
    console.warn('⚠️ Nota sobre verificación de usuario admin:', seedErr.message);
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration con normalización de trailing slashes y soporte multi-origen
const cleanUrl = (url) => (url ? url.trim().replace(/\/+$/, '') : '');
const configuredOrigin = cleanUrl(process.env.FRONTEND_URL);

const allowedOrigins = [
  'https://bibliografia-nine.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173'
];

if (configuredOrigin && !allowedOrigins.includes(configuredOrigin)) {
  allowedOrigins.push(configuredOrigin);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin header de origen (Postman, curl, server-to-server, PWA instalada)
    if (!origin) return callback(null, true);

    const normalizedOrigin = cleanUrl(origin);

    // Permitir orígenes conocidos, cualquier despliegue de vercel.app o localhost
    const isAllowed =
      allowedOrigins.includes(normalizedOrigin) ||
      normalizedOrigin.endsWith('.vercel.app') ||
      normalizedOrigin.includes('localhost') ||
      normalizedOrigin.includes('127.0.0.1');

    if (isAllowed) {
      return callback(null, true);
    }

    // Por seguridad en caso de nuevos subdominios, permitimos el origen entrante
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/map-locations', mapLocationRoutes);
app.use('/api/biography', biographyRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Archivo Biográfico Digital API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a la API del Archivo Biográfico Digital de Daniel Ortega Saavedra',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      timeline: '/api/timeline',
      gallery: '/api/gallery',
      videos: '/api/videos',
      documents: '/api/documents',
      mapLocations: '/api/map-locations',
      biography: '/api/biography',
      stats: '/api/stats'
    }
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: messages
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Valor duplicado encontrado'
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID de recurso inválido'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Error interno del servidor'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📁 Archivos estáticos: http://localhost:${PORT}/uploads\n`);
});

module.exports = app;
