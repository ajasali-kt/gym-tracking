const express = require('express');
const { requireBodyMeasurementsFeature } = require('../middleware/auth');
const {
  listMeasurements,
  saveMeasurement,
  updateMeasurement,
  removeMeasurement
} = require('../controllers/bodyMeasurementsController');

const router = express.Router();

router.use(requireBodyMeasurementsFeature);

router.get('/', listMeasurements);
router.post('/', saveMeasurement);
router.put('/:id', updateMeasurement);
router.delete('/:id', removeMeasurement);

module.exports = router;
