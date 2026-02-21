const {
  getProgressHistory,
  getRecentProgress,
  getExerciseProgress,
  getExercisePersonalRecord,
  getProgressStats
} = require('../services/progressService');

const getHistory = async (req, res, next) => {
  try {
    const logs = await getProgressHistory(req.userId, req.query);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const getRecent = async (req, res, next) => {
  try {
    const logs = await getRecentProgress(req.userId, req.query);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const getExercise = async (req, res, next) => {
  try {
    const result = await getExerciseProgress(req.userId, req.params.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getPersonalRecord = async (req, res, next) => {
  try {
    const result = await getExercisePersonalRecord(req.userId, req.params.id);
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
  getPersonalRecord,
  getStats
};
