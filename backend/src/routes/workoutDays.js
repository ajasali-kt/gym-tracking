const express = require('express');
const router = express.Router();
const {
  getWorkoutDay,
  createWorkoutDayExercise,
  deleteWorkoutDay
} = require('../controllers/workoutDaysController');

/**
 * This router handles /api/days/* routes
 * It's separate from workoutPlans.js to avoid mounting conflicts
 */

/**
 * GET /api/days/:dayId
 * Get specific workout day with exercises
 */
router.get('/:dayId', getWorkoutDay);

/**
 * POST /api/days/:dayId/exercises
 * Add exercise to a workout day
 */
router.post('/:dayId/exercises', createWorkoutDayExercise);

/**
 * DELETE /api/days/:dayId
 * Delete a workout day
 */
router.delete('/:dayId', deleteWorkoutDay);

module.exports = router;
