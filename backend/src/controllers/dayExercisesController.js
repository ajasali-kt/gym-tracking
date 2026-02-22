const {
  deleteDayExerciseAssignment,
  updateDayExerciseAssignment
} = require('../services/dayExercisesService');

const removeDayExercise = async (req, res, next) => {
  try {
    const result = await deleteDayExerciseAssignment(req.params.assignmentId, req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const editDayExercise = async (req, res, next) => {
  try {
    const updated = await updateDayExerciseAssignment(req.params.assignmentId, req.userId, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  removeDayExercise,
  editDayExercise
};
