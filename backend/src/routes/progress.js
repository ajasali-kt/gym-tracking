const express = require('express');
const router = express.Router();
const {
  getHistory,
  getRecent,
  getExercise,
  getPersonalRecord,
  getStats
} = require('../controllers/progressController');

/**
 * GET /api/progress/history
 * Get workout history with optional filtering
 */
router.get('/history', getHistory);

/**
 * GET /api/progress/recent
 * Get recent workout logs
 */
router.get('/recent', getRecent);

/**
 * GET /api/progress/exercise/:id
 * Get progress for a specific exercise
 */
router.get('/exercise/:id', getExercise);

/**
 * GET /api/progress/exercise/:id/personal-record
 * Get personal record for a specific exercise
 */
router.get('/exercise/:id/personal-record', getPersonalRecord);

/**
 * GET /api/progress/stats
 * Get overall progress statistics
 */
router.get('/stats', getStats);

module.exports = router;
