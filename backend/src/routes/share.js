const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const {
  createShareLink,
  getSharedHistory,
  listShares,
  revokeShareLink,
  activateShareLink,
  deleteShareLink
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

/**
 * GET /api/admin/shares
 * List all shares with optional filters
 * Auth: Required (Admin JWT)
 */
router.get('/admin/shares', authenticate, isAdmin, listShares);

/**
 * PUT /api/admin/share/:token/revoke
 * Revoke a share link
 * Auth: Required (Admin JWT)
 */
router.put('/admin/share/:token/revoke', authenticate, isAdmin, revokeShareLink);

/**
 * PUT /api/admin/share/:token/activate
 * Activate a share link
 * Auth: Required (Admin JWT)
 */
router.put('/admin/share/:token/activate', authenticate, isAdmin, activateShareLink);

/**
 * DELETE /api/admin/share/:token
 * Delete a share link permanently
 * Auth: Required (Admin JWT)
 */
router.delete('/admin/share/:token', authenticate, isAdmin, deleteShareLink);

module.exports = router;
