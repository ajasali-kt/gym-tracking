const express = require('express');
const router = express.Router();
const {
  getExercises,
  getExercise,
  addExercise,
  editExercise,
  deleteExercise
} = require('../controllers/exercisesController');

/**
 * GET /api/exercises
 * Get all exercises with optional filtering
 */
router.get('/', getExercises);

/**
 * GET /api/exercises/:id
 * Get single exercise with full details
 */
router.get('/:id', getExercise);

/**
 * POST /api/exercises
 * Create new exercise
 */
router.post('/', addExercise);

/**
 * PUT /api/exercises/:id
 * Update existing exercise
 */
router.put('/:id', editExercise);

/**
 * DELETE /api/exercises/:id
 * Delete exercise
 */
router.delete('/:id', deleteExercise);

module.exports = router;
