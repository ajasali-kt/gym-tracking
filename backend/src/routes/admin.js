const express = require('express');
const { authenticate, isAdmin } = require('../middleware/auth');
const {
  listShares,
  revokeShareLink,
  activateShareLink,
  deleteShareLink
} = require('../controllers/shareController');
const {
  importMuscleGroupsData,
  importExercisesData,
  getStats,
  clearAll
} = require('../controllers/adminController');

const router = express.Router();

router.post('/import/muscle-groups', authenticate, isAdmin, importMuscleGroupsData);
router.post('/import/exercises', authenticate, isAdmin, importExercisesData);
router.get('/stats', authenticate, isAdmin, getStats);
router.delete('/clear/all', authenticate, isAdmin, clearAll);

router.get('/shares', authenticate, isAdmin, listShares);
router.put('/share/:token/revoke', authenticate, isAdmin, revokeShareLink);
router.put('/share/:token/activate', authenticate, isAdmin, activateShareLink);
router.delete('/share/:token', authenticate, isAdmin, deleteShareLink);

module.exports = router;
