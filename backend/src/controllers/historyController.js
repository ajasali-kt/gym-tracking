const { getWorkoutHistory } = require('../services/historyService');

/**
 * GET /api/history?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Get authenticated user's workout history for date range
 */
const getHistory = async (req, res) => {
  try {
    const { from, to } = req.query;
    const userId = req.userId; // From auth middleware

    // Validation
    if (!from || !to) {
      return res.status(400).json({
        error: true,
        message: 'Missing required parameters: from and to dates',
        statusCode: 400
      });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Validate dates
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({
        error: true,
        message: 'Invalid date format. Use YYYY-MM-DD',
        statusCode: 400
      });
    }

    if (fromDate > toDate) {
      return res.status(400).json({
        error: true,
        message: 'Start date must be before end date',
        statusCode: 400
      });
    }

    // Limit range to 1 year to prevent abuse
    const daysDiff = (toDate - fromDate) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      return res.status(400).json({
        error: true,
        message: 'Date range cannot exceed 365 days',
        statusCode: 400
      });
    }

    // Fetch history
    const history = await getWorkoutHistory(userId, fromDate, toDate);

    return res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to fetch workout history',
      statusCode: 500
    });
  }
};

module.exports = {
  getHistory
};
