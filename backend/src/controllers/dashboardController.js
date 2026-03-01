const {
  getTodayWorkoutWithLog,
  getDashboardSummary,
  getWeekSchedule
} = require('../services/dashboardService');
const { createHttpError } = require('../utils/http');

const getTodayDateFromQuery = (req) => {
  const { todayDate } = req.query;

  if (!todayDate || typeof todayDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(todayDate)) {
    throw createHttpError(400, 'todayDate query param is required in YYYY-MM-DD format');
  }

  return todayDate;
};

const getTodayWithLog = async (req, res, next) => {
  try {
    const todayDate = getTodayDateFromQuery(req);
    const result = await getTodayWorkoutWithLog(req.userId, todayDate);
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
    const todayDate = getTodayDateFromQuery(req);
    const result = await getWeekSchedule(req.userId, todayDate);
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
