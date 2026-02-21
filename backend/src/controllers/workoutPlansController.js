const {
  getActivePlan,
  getPlanById,
  listPlans,
  createPlan,
  activatePlan,
  deletePlan,
  addPlanDay,
  getPlanDay,
  addExerciseToPlanDay,
  removeExerciseFromPlanDay,
  removePlanDay,
  importPlan
} = require('../services/workoutPlansService');

const getActive = async (req, res, next) => {
  try {
    const plan = await getActivePlan(req.userId);
    res.json(plan);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const plan = await getPlanById(req.params.id, req.userId);
    res.json(plan);
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const plans = await listPlans(req.userId);
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const plan = await createPlan(req.userId, req.body);
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
};

const activate = async (req, res, next) => {
  try {
    const plan = await activatePlan(req.params.id, req.userId);
    res.json(plan);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deletePlan(req.params.id, req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const addDay = async (req, res, next) => {
  try {
    const workoutDay = await addPlanDay(req.params.id, req.userId, req.body);
    res.status(201).json(workoutDay);
  } catch (error) {
    next(error);
  }
};

const getDay = async (req, res, next) => {
  try {
    const workoutDay = await getPlanDay(req.params.dayId, req.userId);
    res.json(workoutDay);
  } catch (error) {
    next(error);
  }
};

const addDayExercise = async (req, res, next) => {
  try {
    const assignment = await addExerciseToPlanDay(req.params.dayId, req.userId, req.body);
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};

const removeDayExercise = async (req, res, next) => {
  try {
    const result = await removeExerciseFromPlanDay(req.params.dayId, req.params.exerciseId, req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteDay = async (req, res, next) => {
  try {
    const result = await removePlanDay(req.params.dayId, req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const importWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await importPlan(req.userId, req.body);
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActive,
  getById,
  list,
  create,
  activate,
  remove,
  addDay,
  getDay,
  addDayExercise,
  removeDayExercise,
  deleteDay,
  importWorkoutPlan
};
