const express = require('express');
const router = express.Router();
const TimelineEvent = require('../models/TimelineEvent');
const GalleryPhoto = require('../models/GalleryPhoto');
const Video = require('../models/Video');
const Document = require('../models/Document');
const MapLocation = require('../models/MapLocation');
const Biography = require('../models/Biography');

// GET /api/stats - Get counts of all collections (public)
router.get('/', async (req, res) => {
  try {
    const [
      timelineCount,
      galleryCount,
      videosCount,
      documentsCount,
      mapLocationsCount,
      biographySectionsCount
    ] = await Promise.all([
      TimelineEvent.countDocuments(),
      GalleryPhoto.countDocuments(),
      Video.countDocuments(),
      Document.countDocuments(),
      MapLocation.countDocuments(),
      Biography.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        timeline: timelineCount,
        gallery: galleryCount,
        videos: videosCount,
        documents: documentsCount,
        mapLocations: mapLocationsCount,
        biographySections: biographySectionsCount,
        total: timelineCount + galleryCount + videosCount + documentsCount + mapLocationsCount + biographySectionsCount
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
