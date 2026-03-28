const express = require('express');
const router = express.Router();
const {
  getActive,
  getById,
  list,
  create,
  activate,
  remove,
  addDay,
  importWorkoutPlan
} = require('../controllers/workoutPlansController');

router.get('/active', getActive);
router.post('/import', importWorkoutPlan);
router.get('/', list);
router.post('/', create);
router.get('/:id', getById);
router.put('/:id/activate', activate);
router.delete('/:id', remove);
router.post('/:id/days', addDay);

module.exports = router;
