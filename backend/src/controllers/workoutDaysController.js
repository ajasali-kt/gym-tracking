const {
  getWorkoutDayById,
  addExerciseToWorkoutDay,
  deleteWorkoutDayById
} = require('../services/workoutDaysService');

const getWorkoutDay = async (req, res, next) => {
  try {
    const workoutDay = await getWorkoutDayById(req.params.dayId, req.userId);
    res.json(workoutDay);
  } catch (error) {
    next(error);
  }
};

const createWorkoutDayExercise = async (req, res, next) => {
  try {
    const workoutDayExercise = await addExerciseToWorkoutDay(req.params.dayId, req.userId, req.body);
    res.status(201).json(workoutDayExercise);
  } catch (error) {
    next(error);
  }
};

const deleteWorkoutDay = async (req, res, next) => {
  try {
    const result = await deleteWorkoutDayById(req.params.dayId, req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkoutDay,
  createWorkoutDayExercise,
  deleteWorkoutDay
};
