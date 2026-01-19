const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

/**
 * This router handles /api/day-exercises/* routes
 * It's separate from workoutPlans.js to avoid mounting conflicts
 */

/**
 * DELETE /api/day-exercises/:assignmentId
 * Remove exercise assignment by ID
 */
router.delete('/:assignmentId', async (req, res, next) => {
  try {
    const { assignmentId } = req.params;

    // Verify ownership through workoutDay.plan before deleting
    const existingAssignment = await prisma.workoutDayExercise.findFirst({
      where: {
        id: parseInt(assignmentId),
        workoutDay: {
          plan: {
            userId: req.userId
          }
        }
      }
    });

    if (!existingAssignment) {
      return res.status(404).json({
        error: true,
        message: 'Exercise assignment not found',
        statusCode: 404
      });
    }

    await prisma.workoutDayExercise.delete({
      where: {
        id: parseInt(assignmentId)
      }
    });

    res.json({
      success: true,
      message: 'Exercise removed from workout day'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/day-exercises/:assignmentId
 * Update exercise assignment
 */
router.put('/:assignmentId', async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { sets, reps, restSeconds, orderIndex } = req.body;

    // Verify ownership through workoutDay.plan before updating
    const existingAssignment = await prisma.workoutDayExercise.findFirst({
      where: {
        id: parseInt(assignmentId),
        workoutDay: {
          plan: {
            userId: req.userId
          }
        }
      }
    });

    if (!existingAssignment) {
      return res.status(404).json({
        error: true,
        message: 'Exercise assignment not found',
        statusCode: 404
      });
    }

    const updateData = {};
    if (sets !== undefined) updateData.sets = parseInt(sets);
    if (reps !== undefined) updateData.reps = reps.toString();
    if (restSeconds !== undefined) updateData.restSeconds = parseInt(restSeconds);
    if (orderIndex !== undefined) updateData.orderIndex = parseInt(orderIndex);

    const workoutDayExercise = await prisma.workoutDayExercise.update({
      where: { id: parseInt(assignmentId) },
      data: updateData,
      include: {
        exercise: {
          include: {
            muscleGroup: true
          }
        }
      }
    });

    res.json(workoutDayExercise);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
