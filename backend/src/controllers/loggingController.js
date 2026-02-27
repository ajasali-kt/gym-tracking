const {
  logWorkout,
  startWorkoutLog,
  getWorkoutLogById,
  addWorkoutSet,
  completeWorkoutLog,
  deleteWorkoutLog,
  updateExerciseSet,
  deleteExerciseSet
} = require('../services/loggingService');

const logManualWorkout = async (req, res, next) => {
  try {
    const result = await logWorkout(req.userId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const start = async (req, res, next) => {
  try {
    const result = await startWorkoutLog(req.userId, req.body);
    res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const workoutLog = await getWorkoutLogById(req.userId, req.params.id);
    res.json(workoutLog);
  } catch (error) {
    next(error);
  }
};

const addSet = async (req, res, next) => {
  try {
    const exerciseLog = await addWorkoutSet(req.userId, req.params.id, req.body);
    res.status(201).json(exerciseLog);
  } catch (error) {
    next(error);
  }
};

const complete = async (req, res, next) => {
  try {
    const result = await completeWorkoutLog(req.userId, req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteWorkoutLog(req.userId, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateSet = async (req, res, next) => {
  try {
    const exerciseLog = await updateExerciseSet(req.userId, req.params.setId, req.body);
    res.json(exerciseLog);
  } catch (error) {
    next(error);
  }
};

const removeSet = async (req, res, next) => {
  try {
    const result = await deleteExerciseSet(req.userId, req.params.setId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  logManualWorkout,
  start,
  getById,
  addSet,
  complete,
  remove,
  updateSet,
  removeSet
};
