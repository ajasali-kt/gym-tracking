const {
  importMuscleGroups,
  importExercises,
  getAdminStats,
  listUserFeatures,
  updateUserFeature,
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

const getUserFeatures = async (req, res, next) => {
  try {
    const result = await listUserFeatures();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateFeaturesForUser = async (req, res, next) => {
  try {
    const result = await updateUserFeature(req.params.userId, req.body || {});
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
  getUserFeatures,
  updateFeaturesForUser,
  clearAll
};
