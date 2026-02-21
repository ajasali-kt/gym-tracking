const express = require('express');
const router = express.Router();
const {
  createManual,
  start,
  getById,
  addSet,
  update,
  complete,
  remove,
  updateSet,
  removeSet
} = require('../controllers/loggingController');

router.post('/manual', createManual);
router.post('/start', start);
router.get('/:id', getById);
router.post('/:id/sets', addSet);
router.put('/:id', update);
router.put('/:id/complete', complete);
router.delete('/:id', remove);
router.put('/sets/:setId', updateSet);
router.delete('/sets/:setId', removeSet);

module.exports = router;
