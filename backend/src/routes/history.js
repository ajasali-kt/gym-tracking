const express = require('express');
const router = express.Router();
const { getHistory } = require('../controllers/historyController');

/**
 * GET /api/history?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Get authenticated user's workout history
 * Auth: Required (JWT)
 */
router.get('/', getHistory);

module.exports = router;
