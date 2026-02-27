const express = require('express');
const router = express.Router();
const {
  logManualWorkout,
  start,
  getById,
  addSet,
  complete,
  remove,
  updateSet,
  removeSet
} = require('../controllers/loggingController');

router.put('/logworkout', logManualWorkout);
router.post('/start', start);
router.get('/:id', getById);
router.post('/:id/sets', addSet);
router.put('/:id/complete', complete);
router.delete('/:id', remove);
router.put('/sets/:setId', updateSet);
router.delete('/sets/:setId', removeSet);

module.exports = router;
