const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

/**
 * GET /api/muscle-groups
 * Get all muscle groups
 */
router.get('/', async (req, res, next) => {
  try {
    const muscleGroups = await prisma.muscleGroup.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { exercises: true }
        }
      }
    });

    res.json(muscleGroups);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/muscle-groups/:id
 * Get single muscle group
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const muscleGroup = await prisma.muscleGroup.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { exercises: true }
        }
      }
    });

    if (!muscleGroup) {
      return res.status(404).json({
        error: true,
        message: 'Muscle group not found',
        statusCode: 404
      });
    }

    res.json(muscleGroup);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/muscle-groups/:id/exercises
 * Get all exercises for a specific muscle group
 */
router.get('/:id/exercises', async (req, res, next) => {
  try {
    const { id } = req.params;

    // First check if muscle group exists
    const muscleGroup = await prisma.muscleGroup.findUnique({
      where: { id: parseInt(id) }
    });

    if (!muscleGroup) {
      return res.status(404).json({
        error: true,
        message: 'Muscle group not found',
        statusCode: 404
      });
    }

    // Get all exercises for this muscle group
    const exercises = await prisma.exercise.findMany({
      where: { muscleGroupId: parseInt(id) },
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

module.exports = router;
