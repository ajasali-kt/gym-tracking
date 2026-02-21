const express = require('express');
const router = express.Router();
const {
  getMuscleGroups,
  getMuscleGroup,
  getMuscleGroupExercises
} = require('../controllers/muscleGroupsController');

/**
 * GET /api/muscle-groups
 * Get all muscle groups
 */
router.get('/', getMuscleGroups);

/**
 * GET /api/muscle-groups/:id
 * Get single muscle group
 */
router.get('/:id', getMuscleGroup);

/**
 * GET /api/muscle-groups/:id/exercises
 * Get all exercises for a specific muscle group
 */
router.get('/:id/exercises', getMuscleGroupExercises);

module.exports = router;
