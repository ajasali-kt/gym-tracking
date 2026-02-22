const {
  listExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  removeExercise
} = require('../services/exercisesService');

const getExercises = async (req, res, next) => {
  try {
    const exercises = await listExercises(req.query.muscleGroupId);
    res.json(exercises);
  } catch (error) {
    next(error);
  }
};

const getExercise = async (req, res, next) => {
  try {
    const exercise = await getExerciseById(req.params.id);
    res.json(exercise);
  } catch (error) {
    next(error);
  }
};

const addExercise = async (req, res, next) => {
  try {
    const exercise = await createExercise(req.body);
    res.status(201).json(exercise);
  } catch (error) {
    next(error);
  }
};

const editExercise = async (req, res, next) => {
  try {
    const exercise = await updateExercise(req.params.id, req.body);
    res.json(exercise);
  } catch (error) {
    next(error);
  }
};

const deleteExercise = async (req, res, next) => {
  try {
    const result = await removeExercise(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExercises,
  getExercise,
  addExercise,
  editExercise,
  deleteExercise
};
