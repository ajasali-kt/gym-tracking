const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

/**
 * POST /api/logs/manual
 * Create a manual workout log (not tied to a workout plan)
 */
router.post('/manual', async (req, res, next) => {
  try {
    const { completedDate, workoutName, notes, isManual } = req.body;

    // Validation
    if (!workoutName) {
      return res.status(400).json({
        error: true,
        message: 'Missing required field: workoutName',
        statusCode: 400
      });
    }

    // Normalize the date to start of day
    const targetDate = completedDate ? new Date(completedDate) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Create manual workout log
    const workoutLog = await prisma.workoutLog.create({
      data: {
        workoutDayId: null,
        workoutName: workoutName,
        completedDate: targetDate,
        notes: notes || null,
        isManual: true
      },
      include: {
        exerciseLogs: {
          include: {
            exercise: {
              include: {
                muscleGroup: true
              }
            }
          },
          orderBy: [
            { exerciseId: 'asc' },
            { setNumber: 'asc' }
          ]
        }
      }
    });

    res.status(201).json(workoutLog);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/logs/start
 * Start a new workout log or return existing one for today
 */
router.post('/start', async (req, res, next) => {
  try {
    const { workoutDayId, completedDate } = req.body;

    // Validation
    if (!workoutDayId) {
      return res.status(400).json({
        error: true,
        message: 'Missing required field: workoutDayId',
        statusCode: 400
      });
    }

    // Verify workout day exists
    const workoutDay = await prisma.workoutDay.findUnique({
      where: { id: parseInt(workoutDayId) }
    });

    if (!workoutDay) {
      return res.status(404).json({
        error: true,
        message: 'Workout day not found',
        statusCode: 404
      });
    }

    // Normalize the date to start of day
    const targetDate = completedDate ? new Date(completedDate) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Check if a workout log already exists for this day and workout
    const existingLog = await prisma.workoutLog.findFirst({
      where: {
        workoutDayId: parseInt(workoutDayId),
        completedDate: targetDate
      },
      include: {
        workoutDay: {
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
            }
          }
        },
        exerciseLogs: {
          include: {
            exercise: {
              include: {
                muscleGroup: true
              }
            }
          },
          orderBy: [
            { exerciseId: 'asc' },
            { setNumber: 'asc' }
          ]
        }
      }
    });

    // If log exists, return it
    if (existingLog) {
      return res.status(200).json(existingLog);
    }

    // Create new workout log
    const workoutLog = await prisma.workoutLog.create({
      data: {
        workoutDayId: parseInt(workoutDayId),
        completedDate: targetDate,
        notes: null
      },
      include: {
        workoutDay: {
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
            }
          }
        },
        exerciseLogs: {
          include: {
            exercise: {
              include: {
                muscleGroup: true
              }
            }
          },
          orderBy: [
            { exerciseId: 'asc' },
            { setNumber: 'asc' }
          ]
        }
      }
    });

    res.status(201).json(workoutLog);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/logs/:id
 * Get workout log details with all exercise logs
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id: parseInt(id) },
      include: {
        workoutDay: {
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
            }
          }
        },
        exerciseLogs: {
          include: {
            exercise: {
              include: {
                muscleGroup: true
              }
            }
          },
          orderBy: [
            { exerciseId: 'asc' },
            { setNumber: 'asc' }
          ]
        }
      }
    });

    if (!workoutLog) {
      return res.status(404).json({
        error: true,
        message: 'Workout log not found',
        statusCode: 404
      });
    }

    res.json(workoutLog);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/logs/:id/sets
 * Log a single set for an exercise
 */
router.post('/:id/sets', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { exerciseId, setNumber, repsCompleted, weightKg, notes } = req.body;

    // Validation
    if (!exerciseId || !setNumber || !repsCompleted || weightKg === undefined) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields: exerciseId, setNumber, repsCompleted, weightKg',
        statusCode: 400
      });
    }

    // Verify workout log exists
    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id: parseInt(id) }
    });

    if (!workoutLog) {
      return res.status(404).json({
        error: true,
        message: 'Workout log not found',
        statusCode: 404
      });
    }

    // Create exercise log
    const exerciseLog = await prisma.exerciseLog.create({
      data: {
        workoutLogId: parseInt(id),
        exerciseId: parseInt(exerciseId),
        setNumber: parseInt(setNumber),
        repsCompleted: parseInt(repsCompleted),
        weightKg: parseFloat(weightKg),
        notes: notes || null
      },
      include: {
        exercise: {
          include: {
            muscleGroup: true
          }
        }
      }
    });

    res.status(201).json(exerciseLog);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/logs/:id
 * Update workout log details (for manual workouts)
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { workoutName, completedDate, notes } = req.body;

    const updateData = {};
    if (workoutName !== undefined) updateData.workoutName = workoutName;
    if (notes !== undefined) updateData.notes = notes || null;
    if (completedDate !== undefined) {
      const targetDate = new Date(completedDate);
      targetDate.setHours(0, 0, 0, 0);
      updateData.completedDate = targetDate;
    }

    const workoutLog = await prisma.workoutLog.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        workoutDay: {
          include: {
            muscleGroup: true
          }
        },
        exerciseLogs: {
          include: {
            exercise: {
              include: {
                muscleGroup: true
              }
            }
          },
          orderBy: [
            { exerciseId: 'asc' },
            { setNumber: 'asc' }
          ]
        }
      }
    });

    res.json(workoutLog);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/logs/:id/complete
 * Mark workout as complete and add optional notes
 */
router.put('/:id/complete', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const workoutLog = await prisma.workoutLog.update({
      where: { id: parseInt(id) },
      data: {
        notes: notes || null
      },
      include: {
        workoutDay: {
          include: {
            muscleGroup: true
          }
        },
        _count: {
          select: { exerciseLogs: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Workout completed successfully',
      workoutLog
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/logs/:id
 * Delete a workout log (cascades to exercise logs)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.workoutLog.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Workout log deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/logs/sets/:setId
 * Update an exercise log (set)
 */
router.put('/sets/:setId', async (req, res, next) => {
  try {
    const { setId } = req.params;
    const { repsCompleted, weightKg, notes } = req.body;

    const updateData = {};
    if (repsCompleted !== undefined) updateData.repsCompleted = parseInt(repsCompleted);
    if (weightKg !== undefined) updateData.weightKg = parseFloat(weightKg);
    if (notes !== undefined) updateData.notes = notes;

    const exerciseLog = await prisma.exerciseLog.update({
      where: { id: parseInt(setId) },
      data: updateData,
      include: {
        exercise: {
          include: {
            muscleGroup: true
          }
        }
      }
    });

    res.json(exerciseLog);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/logs/sets/:setId
 * Delete a single set log
 */
router.delete('/sets/:setId', async (req, res, next) => {
  try {
    const { setId } = req.params;

    await prisma.exerciseLog.delete({
      where: { id: parseInt(setId) }
    });

    res.json({
      success: true,
      message: 'Exercise log deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
