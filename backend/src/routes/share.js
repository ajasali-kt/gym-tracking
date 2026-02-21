const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createShareLink,
  getSharedHistory
} = require('../controllers/shareController');

/**
 * POST /api/share
 * Create a shareable link for workout history
 * Auth: Required (JWT)
 */
router.post('/', authenticate, createShareLink);

/**
 * GET /api/share/:token
 * Get shared workout history (public, no auth required)
 * Auth: None (Public)
 */
router.get('/:token', getSharedHistory);

module.exports = router;
