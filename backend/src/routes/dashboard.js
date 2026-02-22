const express = require('express');
const router = express.Router();
const {
  getTodayWithLog,
  getSummary,
  getWeek
} = require('../controllers/dashboardController');


/**
 * GET /api/dashboard/today-with-log
 * Get today's workout combined with existing workout log (if any)
 * This consolidated endpoint eliminates the need for 3 separate API calls
 */
router.get('/today-with-log', getTodayWithLog);

/**
 * GET /api/dashboard/summary
 * Get workout statistics and summary
 */
router.get('/summary', getSummary);

/**
 * GET /api/dashboard/week
 * Get the full workout schedule for active plan based on date range
 */
router.get('/week', getWeek);

module.exports = router;
