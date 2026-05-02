const {
  getBodyMeasurements,
  saveBodyMeasurement,
  updateBodyMeasurement,
  deleteBodyMeasurement
} = require('../services/bodyMeasurementsService');

const listMeasurements = async (req, res, next) => {
  try {
    const result = await getBodyMeasurements(req.userId, req.query || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const saveMeasurement = async (req, res, next) => {
  try {
    const result = await saveBodyMeasurement(req.userId, req.body || {});
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateMeasurement = async (req, res, next) => {
  try {
    const result = await updateBodyMeasurement(req.userId, req.params.id, req.body || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const removeMeasurement = async (req, res, next) => {
  try {
    const result = await deleteBodyMeasurement(req.userId, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMeasurements,
  saveMeasurement,
  updateMeasurement,
  removeMeasurement
};
