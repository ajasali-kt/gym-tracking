const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

/**
 * GET /api/exercises
 * Get all exercises with optional filtering
 */
router.get('/', async (req, res, next) => {
  try {
    const { muscleGroupId } = req.query;

    const whereClause = muscleGroupId
      ? { muscleGroupId: parseInt(muscleGroupId) }
      : {};

    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      include: {
        muscleGroup: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(exercises);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/exercises/:id
 * Get single exercise with full details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id: parseInt(id) },
      include: {
        muscleGroup: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    if (!exercise) {
      return res.status(404).json({
        error: true,
        message: 'Exercise not found',
        statusCode: 404
      });
    }

    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/exercises
 * Create new exercise
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, muscleGroupId, description, steps, youtubeUrl } = req.body;

    // Validation
    if (!name || !muscleGroupId || !description || !steps) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields: name, muscleGroupId, description, steps',
        statusCode: 400
      });
    }

    if (!Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Steps must be a non-empty array',
        statusCode: 400
      });
    }

    // Create exercise
    const exercise = await prisma.exercise.create({
      data: {
        name,
        muscleGroupId: parseInt(muscleGroupId),
        description,
        steps: steps,
        youtubeUrl: youtubeUrl || null
      },
      include: {
        muscleGroup: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(exercise);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/exercises/:id
 * Update existing exercise
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, muscleGroupId, description, steps, youtubeUrl } = req.body;

    // Build update data object (only include provided fields)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (muscleGroupId !== undefined) updateData.muscleGroupId = parseInt(muscleGroupId);
    if (description !== undefined) updateData.description = description;
    if (steps !== undefined) {
      if (!Array.isArray(steps) || steps.length === 0) {
        return res.status(400).json({
          error: true,
          message: 'Steps must be a non-empty array',
          statusCode: 400
        });
      }
      updateData.steps = steps;
    }
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;

    // Update exercise
    const exercise = await prisma.exercise.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        muscleGroup: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/exercises/:id
 * Delete exercise
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.exercise.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Exercise deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
