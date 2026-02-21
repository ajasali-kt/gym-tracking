const {
  getTodayWorkoutWithLog,
  getDashboardSummary,
  getWeekSchedule
} = require('../services/dashboardService');

const getTodayWithLog = async (req, res, next) => {
  try {
    const result = await getTodayWorkoutWithLog(req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const result = await getDashboardSummary(req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getWeek = async (req, res, next) => {
  try {
    const result = await getWeekSchedule(req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayWithLog,
  getSummary,
  getWeek
};
