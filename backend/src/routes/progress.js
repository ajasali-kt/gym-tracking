const express = require('express');
const router = express.Router();
const {
  getHistory,
  getRecent,
  getExercise,
  getStats
} = require('../controllers/progressController');

/**
 * GET /api/progress/history
 * Get workout history with optional filtering
 */
router.get('/history', getHistory);

/**
 * POST /api/progress/recent
 * Get recent workout logs
 */
router.post('/recent', getRecent);

/**
 * POST /api/progress/exercise/:id
 * Get progress for a specific exercise
 */
router.post('/exercise/:id', getExercise);

/**
 * GET /api/progress/stats
 * Get overall progress statistics
 */
router.get('/stats', getStats);

module.exports = router;
