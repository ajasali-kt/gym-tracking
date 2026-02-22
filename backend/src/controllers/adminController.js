const {
  importMuscleGroups,
  importExercises,
  getAdminStats,
  clearAllData
} = require('../services/adminService');

const importMuscleGroupsData = async (req, res, next) => {
  try {
    const result = await importMuscleGroups(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const importExercisesData = async (req, res, next) => {
  try {
    const result = await importExercises(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const result = await getAdminStats();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const clearAll = async (req, res, next) => {
  try {
    const result = await clearAllData();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  importMuscleGroupsData,
  importExercisesData,
  getStats,
  clearAll
};
