const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

/**
 * GET /api/plans/active
 * Get the currently active workout plan with all days and exercises
 * Filtered by authenticated user
 */
router.get('/active', async (req, res, next) => {
  try {
    const activePlan = await prisma.workoutPlan.findFirst({
      where: {
        isActive: true,
        userId: req.userId
      },
      include: {
        workoutDays: {
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
          },
          orderBy: { dayNumber: 'asc' }
        }
      }
    });

    if (!activePlan) {
      return res.status(404).json({
        error: true,
        message: 'No active workout plan found',
        statusCode: 404
      });
    }

    res.json(activePlan);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/plans/:id
 * Get specific workout plan with all details
 * Filtered by authenticated user
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const plan = await prisma.workoutPlan.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      },
      include: {
        workoutDays: {
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
          },
          orderBy: { dayNumber: 'asc' }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({
        error: true,
        message: 'Workout plan not found',
        statusCode: 404
      });
    }

    res.json(plan);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/plans
 * Get all workout plans (summary)
 * Filtered by authenticated user
 */
router.get('/', async (req, res, next) => {
  try {
    const plans = await prisma.workoutPlan.findMany({
      where: {
        userId: req.userId
      },
      include: {
        _count: {
          select: { workoutDays: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(plans);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/plans
 * Create new workout plan
 * Automatically sets it as active and deactivates others
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, startDate, endDate, duration, trainingType, split, notes } = req.body;

    // Validation
    if (!name || !startDate) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields: name, startDate',
        statusCode: 400
      });
    }

    // Use transaction to ensure only one active plan per user
    const plan = await prisma.$transaction(async (tx) => {
      // Deactivate all existing plans for this user
      await tx.workoutPlan.updateMany({
        where: {
          isActive: true,
          userId: req.userId
        },
        data: { isActive: false }
      });

      // Create new plan as active
      return await tx.workoutPlan.create({
        data: {
          userId: req.userId,
          name,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          duration: duration || null,
          trainingType: trainingType || null,
          split: split || null,
          notes: notes || null,
          isActive: true
        }
      });
    });

    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/plans/:id/activate
 * Set a plan as active (deactivates others for this user)
 */
router.put('/:id/activate', async (req, res, next) => {
  try {
    const { id } = req.params;

    const plan = await prisma.$transaction(async (tx) => {
      // Verify ownership first
      const existingPlan = await tx.workoutPlan.findFirst({
        where: {
          id: parseInt(id),
          userId: req.userId
        }
      });

      if (!existingPlan) {
        throw new Error('Workout plan not found or access denied');
      }

      // Deactivate all plans for this user
      await tx.workoutPlan.updateMany({
        where: {
          isActive: true,
          userId: req.userId
        },
        data: { isActive: false }
      });

      // Activate this plan
      return await tx.workoutPlan.update({
        where: { id: parseInt(id) },
        data: { isActive: true }
      });
    });

    res.json(plan);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/plans/:id
 * Delete workout plan (cascades to days and exercises)
 * User can only delete their own plans
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership before deleting
    const plan = await prisma.workoutPlan.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    });

    if (!plan) {
      return res.status(404).json({
        error: true,
        message: 'Workout plan not found or access denied',
        statusCode: 404
      });
    }

    await prisma.workoutPlan.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Workout plan deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/plans/:id/days
 * Add a new day to a workout plan
 * dayName is automatically determined from dayNumber if not provided
 * User can only add days to their own plans
 */
router.post('/:id/days', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dayNumber, dayName, muscleGroupId } = req.body;

    // Verify plan ownership first
    const plan = await prisma.workoutPlan.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    });

    if (!plan) {
      return res.status(404).json({
        error: true,
        message: 'Workout plan not found or access denied',
        statusCode: 404
      });
    }

    // Validation
    if (!dayNumber) {
      return res.status(400).json({
        error: true,
        message: 'Missing required field: dayNumber',
        statusCode: 400
      });
    }

    if (dayNumber < 1) {
      return res.status(400).json({
        error: true,
        message: 'dayNumber must be at least 1',
        statusCode: 400
      });
    }

    // Auto-determine dayName from dayNumber if not provided
    // Generate a default name like "Day 1", "Day 2", etc.
    const finalDayName = dayName || `Day ${dayNumber}`;

    const workoutDay = await prisma.workoutDay.create({
      data: {
        planId: parseInt(id),
        dayNumber: parseInt(dayNumber),
        dayName: finalDayName,
        muscleGroupId: muscleGroupId ? parseInt(muscleGroupId) : null
      },
      include: {
        muscleGroup: true
      }
    });

    res.status(201).json(workoutDay);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/plans/days/:dayId
 * Get specific workout day with exercises
 * Verify ownership through plan
 */
router.get('/days/:dayId', async (req, res, next) => {
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
        message: 'Workout day not found or access denied',
        statusCode: 404
      });
    }

    res.json(workoutDay);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/plans/days/:dayId/exercises
 * Add exercise to a workout day
 * Verify ownership through plan
 */
router.post('/days/:dayId/exercises', async (req, res, next) => {
  try {
    const { dayId } = req.params;
    const { exerciseId, sets, reps, restSeconds, orderIndex } = req.body;

    // Verify day ownership through plan
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
        message: 'Workout day not found or access denied',
        statusCode: 404
      });
    }

    // Validation
    if (!exerciseId || !sets || !reps || restSeconds === undefined || orderIndex === undefined) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields: exerciseId, sets, reps, restSeconds, orderIndex',
        statusCode: 400
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
 * DELETE /api/plans/days/:dayId/exercises/:exerciseId
 * Remove exercise from a workout day
 * Verify ownership through plan
 */
router.delete('/days/:dayId/exercises/:exerciseId', async (req, res, next) => {
  try {
    const { dayId, exerciseId } = req.params;

    // Verify day ownership through plan
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
        message: 'Workout day not found or access denied',
        statusCode: 404
      });
    }

    await prisma.workoutDayExercise.deleteMany({
      where: {
        workoutDayId: parseInt(dayId),
        id: parseInt(exerciseId)
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
 * DELETE /api/plans/days/:dayId
 * Delete a workout day
 * Verify ownership through plan
 */
router.delete('/days/:dayId', async (req, res, next) => {
  try {
    const { dayId } = req.params;

    // Verify day ownership through plan
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
        message: 'Workout day not found or access denied',
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

/**
 * POST /api/plans/import
 * Import complete workout plan from JSON structure
 */
router.post('/import', async (req, res, next) => {
  try {
    const {
      duration,
      trainingType,
      split,
      weeklySchedule,
      progressionPlan,
      planName,
      startDate
    } = req.body;

    // Validation
    if (!weeklySchedule || typeof weeklySchedule !== 'object') {
      return res.status(400).json({
        error: true,
        message: 'Missing or invalid weeklySchedule',
        statusCode: 400
      });
    }

    // Format progression plan notes
    let notes = null;
    if (progressionPlan && typeof progressionPlan === 'object') {
      notes = Object.entries(progressionPlan)
        .map(([week, plan]) => `${week}: ${plan}`)
        .join('\n');
    }

    // Generate plan name if not provided
    const name = planName || `${split || 'Workout Plan'} - ${duration || 'Custom'}`;

    // Calculate end date based on the number of days in weeklySchedule
    let endDate = null;
    if (startDate && weeklySchedule) {
      // Count the number of days in the weeklySchedule
      const dayKeys = Object.keys(weeklySchedule).filter(key => key.startsWith('Day'));
      const numberOfDays = dayKeys.length;

      if (numberOfDays > 0) {
        const start = new Date(startDate);
        endDate = new Date(start);
        // Add (numberOfDays - 1) because start date is day 1
        endDate.setDate(endDate.getDate() + (numberOfDays - 1));
      }
    }

    // Use transaction to create plan with all days and exercises
    const plan = await prisma.$transaction(async (tx) => {
      // Deactivate all existing plans for this user
      await tx.workoutPlan.updateMany({
        where: {
          isActive: true,
          userId: req.userId
        },
        data: { isActive: false }
      });

      // Create new plan as active
      const newPlan = await tx.workoutPlan.create({
        data: {
          userId: req.userId,
          name,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : null,
          duration: duration || null,
          trainingType: trainingType || null,
          split: split || null,
          notes: notes,
          isActive: true
        }
      });

      // Process each day in weekly schedule
      for (const [dayKey, dayData] of Object.entries(weeklySchedule)) {
        const dayNumber = parseInt(dayKey.replace('Day', ''));

        if (isNaN(dayNumber) || dayNumber < 1) continue;

        // Skip rest days with no exercises
        if (!dayData.exercises || dayData.exercises.length === 0) continue;

        // Find or get muscle group
        let muscleGroupId = null;
        if (dayData.bodyPart && dayData.bodyPart !== 'Rest' && dayData.bodyPart !== 'Active Recovery') {
          // Extract primary muscle group from bodyPart (e.g., "Chest + Triceps" -> "Chest")
          const primaryMuscle = dayData.bodyPart.split('+')[0].trim();
          const muscleGroup = await tx.muscleGroup.findFirst({
            where: {
              name: {
                contains: primaryMuscle,
                mode: 'insensitive'
              }
            }
          });
          muscleGroupId = muscleGroup?.id || null;
        }

        // Create workout day
        const workoutDay = await tx.workoutDay.create({
          data: {
            planId: newPlan.id,
            dayNumber: dayNumber,
            dayName: dayData.bodyPart || `Day ${dayNumber}`,
            muscleGroupId: muscleGroupId
          }
        });

        // Add exercises to the day
        for (let i = 0; i < dayData.exercises.length; i++) {
          const exerciseData = dayData.exercises[i];

          // Find matching exercise by name
          const exercise = await tx.exercise.findFirst({
            where: {
              name: {
                contains: exerciseData.name,
                mode: 'insensitive'
              }
            }
          });

          if (exercise) {
            await tx.workoutDayExercise.create({
              data: {
                workoutDayId: workoutDay.id,
                exerciseId: exercise.id,
                sets: exerciseData.sets || 3,
                reps: exerciseData.reps?.toString() || exerciseData.duration || '10',
                restSeconds: 90, // Default rest time
                orderIndex: i + 1
              }
            });
          }
        }
      }

      // Return complete plan with all data
      return await tx.workoutPlan.findUnique({
        where: { id: newPlan.id },
        include: {
          workoutDays: {
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
            },
            orderBy: { dayNumber: 'asc' }
          }
        }
      });
    });

    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
