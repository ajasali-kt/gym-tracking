const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

/**
 * This router handles /api/days/* routes
 * It's separate from workoutPlans.js to avoid mounting conflicts
 */

/**
 * GET /api/days/:dayId
 * Get specific workout day with exercises
 */
router.get('/:dayId', async (req, res, next) => {
  try {
    const { dayId } = req.params;

    const workoutDay = await prisma.workoutDay.findFirst({
      where: {
        id: parseInt(dayId),
        plan: {
          userId: req.userId
        }
      },
      include: {
        muscleGroup: true,
        workoutDayExercises: {
          include: {
            exercise: {
              include: {
                muscleGroup: true
              }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        plan: true
      }
    });

    if (!workoutDay) {
      return res.status(404).json({
        error: true,
        message: 'Workout day not found',
        statusCode: 404
      });
    }

    res.json(workoutDay);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/days/:dayId/exercises
 * Add exercise to a workout day
 */
router.post('/:dayId/exercises', async (req, res, next) => {
  try {
    const { dayId } = req.params;
    const { exerciseId, sets, reps, restSeconds, orderIndex } = req.body;

    // Validation
    if (!exerciseId || !sets || !reps || restSeconds === undefined || orderIndex === undefined) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields: exerciseId, sets, reps, restSeconds, orderIndex',
        statusCode: 400
      });
    }

    // Verify workout day ownership through plan
    const workoutDay = await prisma.workoutDay.findFirst({
      where: {
        id: parseInt(dayId),
        plan: {
          userId: req.userId
        }
      }
    });

    if (!workoutDay) {
      return res.status(404).json({
        error: true,
        message: 'Workout day not found',
        statusCode: 404
      });
    }

    const workoutDayExercise = await prisma.workoutDayExercise.create({
      data: {
        workoutDayId: parseInt(dayId),
        exerciseId: parseInt(exerciseId),
        sets: parseInt(sets),
        reps: reps.toString(),
        restSeconds: parseInt(restSeconds),
        orderIndex: parseInt(orderIndex)
      },
      include: {
        exercise: {
          include: {
            muscleGroup: true
          }
        }
      }
    });

    res.status(201).json(workoutDayExercise);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/days/:dayId
 * Delete a workout day
 */
router.delete('/:dayId', async (req, res, next) => {
  try {
    const { dayId } = req.params;

    // Verify ownership through plan before deleting
    const workoutDay = await prisma.workoutDay.findFirst({
      where: {
        id: parseInt(dayId),
        plan: {
          userId: req.userId
        }
      }
    });

    if (!workoutDay) {
      return res.status(404).json({
        error: true,
        message: 'Workout day not found',
        statusCode: 404
      });
    }

    await prisma.workoutDay.delete({
      where: { id: parseInt(dayId) }
    });

    res.json({
      success: true,
      message: 'Workout day deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
