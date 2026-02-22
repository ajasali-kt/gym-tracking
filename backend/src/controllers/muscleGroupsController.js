const {
  listMuscleGroups,
  getMuscleGroupById,
  listExercisesByMuscleGroupId
} = require('../services/muscleGroupsService');

const getMuscleGroups = async (req, res, next) => {
  try {
    const muscleGroups = await listMuscleGroups();
    res.json(muscleGroups);
  } catch (error) {
    next(error);
  }
};

const getMuscleGroup = async (req, res, next) => {
  try {
    const muscleGroup = await getMuscleGroupById(req.params.id);
    res.json(muscleGroup);
  } catch (error) {
    next(error);
  }
};

const getMuscleGroupExercises = async (req, res, next) => {
  try {
    const exercises = await listExercisesByMuscleGroupId(req.params.id);
    res.json(exercises);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMuscleGroups,
  getMuscleGroup,
  getMuscleGroupExercises
};
