const {
  getProgressHistory,
  getRecentProgress,
  getExerciseProgress,
  getProgressStats
} = require('../services/progressService');

const getFilterModel = (req) => {
  if (req.method === 'POST') {
    return req.body?.filters || req.body || {};
  }
  return req.query || {};
};

const getHistory = async (req, res, next) => {
  try {
    const logs = await getProgressHistory(req.userId, getFilterModel(req));
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const getRecent = async (req, res, next) => {
  try {
    const logs = await getRecentProgress(req.userId, getFilterModel(req));
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const getExercise = async (req, res, next) => {
  try {
    const result = await getExerciseProgress(req.userId, req.params.id, getFilterModel(req));
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const result = await getProgressStats(req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistory,
  getRecent,
  getExercise,
  getStats
};
