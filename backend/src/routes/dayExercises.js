const express = require('express');
const router = express.Router();
const {
  removeDayExercise,
  editDayExercise
} = require('../controllers/dayExercisesController');

/**
 * This router handles /api/day-exercises/* routes
 * It's separate from workoutPlans.js to avoid mounting conflicts
 */

/**
 * DELETE /api/day-exercises/:assignmentId
 * Remove exercise assignment by ID
 */
router.delete('/:assignmentId', removeDayExercise);

/**
 * PUT /api/day-exercises/:assignmentId
 * Update exercise assignment
 */
router.put('/:assignmentId', editDayExercise);

module.exports = router;
