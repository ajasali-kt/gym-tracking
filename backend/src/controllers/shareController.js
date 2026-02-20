const {
  createShare,
  findExistingShare,
  renewShare,
  getShareByToken,
  getAllShares,
  revokeShare,
  activateShare,
  deleteShare,
  countTodayShares
} = require('../services/shareService');
const { getWorkoutHistory } = require('../services/historyService');

/**
 * POST /api/share
 * Create a shareable link for workout history
 */
const createShareLink = async (req, res) => {
  try {
    const { fromDate, toDate, expiresInDays } = req.body;
    const userId = req.userId; // From auth middleware

    // Validation
    if (!fromDate || !toDate) {
      return res.status(400).json({
        error: true,
        message: 'Missing required parameters: fromDate and toDate',
        statusCode: 400
      });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Validate dates
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.status(400).json({
        error: true,
        message: 'Invalid date format. Use YYYY-MM-DD',
        statusCode: 400
      });
    }

    if (from > to) {
      return res.status(400).json({
        error: true,
        message: 'Start date must be before end date',
        statusCode: 400
      });
    }

    // Reuse/renew existing link for same date range
    const existingShare = await findExistingShare(userId, from, to);
    if (existingShare) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const isExpired = existingShare.expiresAt && new Date(existingShare.expiresAt) <= new Date();
      const isUsable = existingShare.isActive && !isExpired;

      if (isUsable) {
        const shareUrl = `${frontendUrl}/share/${existingShare.token}`;
        return res.status(200).json({
          success: true,
          data: {
            ...existingShare,
            shareUrl,
            reused: true,
            renewed: false
          }
        });
      }

      // If existing link is inactive/expired, reactivate same token with requested expiry
      const renewedShare = await renewShare(existingShare.token, expiresInDays);
      const shareUrl = `${frontendUrl}/share/${renewedShare.token}`;
      return res.status(200).json({
        success: true,
        data: {
          ...renewedShare,
          shareUrl,
          reused: true,
          renewed: true
        }
      });
    }

    // Rate limiting: max 10 shares per day
    const todayCount = await countTodayShares(userId);
    if (todayCount >= 10) {
      return res.status(429).json({
        error: true,
        message: 'Daily share limit reached (10 shares per day)',
        statusCode: 429
      });
    }

    // Create share
    const share = await createShare(userId, from, to, expiresInDays);

    // Build share URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareUrl = `${frontendUrl}/share/${share.token}`;

    return res.status(201).json({
      success: true,
      data: {
        ...share,
        shareUrl,
        reused: false,
        renewed: false
      }
    });
  } catch (error) {
    console.error('Create share error:', error);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to create share link',
      statusCode: 500
    });
  }
};

/**
 * GET /api/share/:token
 * Get shared workout history (public, no auth required)
 */
const getSharedHistory = async (req, res) => {
  try {
    const { token } = req.params;

    // Validate token format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid share token format',
        statusCode: 400
      });
    }

    // Get and validate share
    const share = await getShareByToken(token);

    if (!share) {
      return res.status(404).json({
        error: true,
        message: 'Share link not found',
        statusCode: 404
      });
    }

    if (share.error) {
      return res.status(share.statusCode).json({
        error: true,
        message: share.error,
        statusCode: share.statusCode
      });
    }

    // Fetch workout history for the shared date range
    const history = await getWorkoutHistory(
      share.user.id,
      share.fromDate,
      share.toDate
    );

    return res.json({
      success: true,
      data: {
        username: share.user.username,
        fromDate: share.fromDate,
        toDate: share.toDate,
        expiresAt: share.expiresAt,
        ...history
      }
    });
  } catch (error) {
    console.error('Get shared history error:', error);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to fetch shared history',
      statusCode: 500
    });
  }
};

/**
 * GET /api/admin/shares
 * Get all shares with filters (admin only)
 */
const listShares = async (req, res) => {
  try {
    const { userId, isActive, search } = req.query;

    const filters = {};
    if (userId) filters.userId = parseInt(userId);
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (search) filters.search = search;

    const shares = await getAllShares(filters);

    return res.json({
      success: true,
      data: {
        shares,
        total: shares.length
      }
    });
  } catch (error) {
    console.error('List shares error:', error);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to list shares',
      statusCode: 500
    });
  }
};

/**
 * PUT /api/admin/share/:token/revoke
 * Revoke a share link (admin only)
 */
const revokeShareLink = async (req, res) => {
  try {
    const { token } = req.params;

    const share = await revokeShare(token);

    return res.json({
      success: true,
      message: 'Share link revoked successfully',
      data: share
    });
  } catch (error) {
    console.error('Revoke share error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: true,
        message: 'Share link not found',
        statusCode: 404
      });
    }

    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to revoke share link',
      statusCode: 500
    });
  }
};

/**
 * PUT /api/admin/share/:token/activate
 * Activate a share link (admin only)
 */
const activateShareLink = async (req, res) => {
  try {
    const { token } = req.params;

    const share = await activateShare(token);

    return res.json({
      success: true,
      message: 'Share link activated successfully',
      data: share
    });
  } catch (error) {
    console.error('Activate share error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: true,
        message: 'Share link not found',
        statusCode: 404
      });
    }

    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to activate share link',
      statusCode: 500
    });
  }
};

/**
 * DELETE /api/admin/share/:token
 * Delete a share link permanently (admin only)
 */
const deleteShareLink = async (req, res) => {
  try {
    const { token } = req.params;

    const share = await deleteShare(token);

    return res.json({
      success: true,
      message: 'Share link deleted successfully',
      data: share
    });
  } catch (error) {
    console.error('Delete share error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: true,
        message: 'Share link not found',
        statusCode: 404
      });
    }

    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to delete share link',
      statusCode: 500
    });
  }
};

module.exports = {
  createShareLink,
  getSharedHistory,
  listShares,
  revokeShareLink,
  activateShareLink,
  deleteShareLink
};
