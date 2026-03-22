const {
  getActivePlan,
  getPlanById,
  listPlans,
  createPlan,
  activatePlan,
  deletePlan,
  addPlanDay,
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
  importWorkoutPlan
};
