const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

/**
 * GET /api/progress/history
 * Get workout history with optional filtering
 * Query params: startDate, endDate, limit
 */
router.get('/history', async (req, res, next) => {
  try {
    const { startDate, endDate, limit } = req.query;

    // Build where clause (filtered by user)
    const whereClause = {
      userId: req.userId
    };
    if (startDate || endDate) {
      whereClause.completedDate = {};
      if (startDate) whereClause.completedDate.gte = new Date(startDate);
      if (endDate) whereClause.completedDate.lte = new Date(endDate);
    }

    const workoutLogs = await prisma.workoutLog.findMany({
      where: whereClause,
      take: limit ? parseInt(limit) : undefined,
      orderBy: { completedDate: 'desc' },
      include: {
        workoutDay: {
          include: {
            muscleGroup: true,
            plan: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: { exerciseLogs: true }
        }
      }
    });

    res.json(workoutLogs);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/progress/recent
 * Get recent workout logs (default: last 10)
 * Query params: limit
 */
router.get('/recent', async (req, res, next) => {
  try {
    const { limit } = req.query;

    const workoutLogs = await prisma.workoutLog.findMany({
      where: { userId: req.userId },
      take: limit ? parseInt(limit) : 10,
      orderBy: { completedDate: 'desc' },
      include: {
        workoutDay: {
          include: {
            muscleGroup: true
          }
        },
        exerciseLogs: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.json(workoutLogs);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/progress/exercise/:id
 * Get progress for a specific exercise
 * Query params: limit (default: 50)
 */
router.get('/exercise/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit } = req.query;

    // Verify exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id: parseInt(id) },
      include: {
        muscleGroup: true
      }
    });

    if (!exercise) {
      return res.status(404).json({
        error: true,
        message: 'Exercise not found',
        statusCode: 404
      });
    }

    // Get all logs for this exercise (filtered by user through workoutLog)
    const exerciseLogs = await prisma.exerciseLog.findMany({
      where: {
        exerciseId: parseInt(id),
        workoutLog: {
          userId: req.userId
        }
      },
      take: limit ? parseInt(limit) : 50,
      orderBy: { createdAt: 'desc' },
      include: {
        workoutLog: {
          select: {
            id: true,
            completedDate: true,
            workoutDay: {
              select: {
                dayName: true
              }
            }
          }
        }
      }
    });

    // Calculate statistics
    const stats = calculateExerciseStats(exerciseLogs);

    res.json({
      exercise,
      logs: exerciseLogs,
      statistics: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/progress/exercise/:id/personal-record
 * Get personal record for a specific exercise
 */
router.get('/exercise/:id/personal-record', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get max weight for this exercise (filtered by user)
    const maxWeightLog = await prisma.exerciseLog.findFirst({
      where: {
        exerciseId: parseInt(id),
        workoutLog: {
          userId: req.userId
        }
      },
      orderBy: { weightKg: 'desc' },
      include: {
        workoutLog: {
          select: {
            completedDate: true
          }
        }
      }
    });

    // Get max reps at any weight (filtered by user)
    const maxRepsLog = await prisma.exerciseLog.findFirst({
      where: {
        exerciseId: parseInt(id),
        workoutLog: {
          userId: req.userId
        }
      },
      orderBy: { repsCompleted: 'desc' },
      include: {
        workoutLog: {
          select: {
            completedDate: true
          }
        }
      }
    });

    // Calculate max volume (weight × reps) (filtered by user)
    const allLogs = await prisma.exerciseLog.findMany({
      where: {
        exerciseId: parseInt(id),
        workoutLog: {
          userId: req.userId
        }
      },
      select: {
        weightKg: true,
        repsCompleted: true,
        workoutLog: {
          select: {
            completedDate: true
          }
        }
      }
    });

    let maxVolumeLog = null;
    if (allLogs.length > 0) {
      maxVolumeLog = allLogs.reduce((max, log) => {
        const volume = log.weightKg * log.repsCompleted;
        const maxVolume = max.weightKg * max.repsCompleted;
        return volume > maxVolume ? log : max;
      });
    }

    res.json({
      personalRecords: {
        maxWeight: maxWeightLog ? {
          weight: maxWeightLog.weightKg,
          reps: maxWeightLog.repsCompleted,
          date: maxWeightLog.workoutLog.completedDate
        } : null,
        maxReps: maxRepsLog ? {
          reps: maxRepsLog.repsCompleted,
          weight: maxRepsLog.weightKg,
          date: maxRepsLog.workoutLog.completedDate
        } : null,
        maxVolume: maxVolumeLog ? {
          volume: maxVolumeLog.weightKg * maxVolumeLog.repsCompleted,
          weight: maxVolumeLog.weightKg,
          reps: maxVolumeLog.repsCompleted,
          date: maxVolumeLog.workoutLog.completedDate
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/progress/stats
 * Get overall progress statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    // Total workouts (filtered by user)
    const totalWorkouts = await prisma.workoutLog.count({
      where: { userId: req.userId }
    });

    // Total sets logged (filtered by user through workoutLog)
    const totalSets = await prisma.exerciseLog.count({
      where: {
        workoutLog: {
          userId: req.userId
        }
      }
    });

    // Total volume (sum of weight × reps) (filtered by user)
    const allLogs = await prisma.exerciseLog.findMany({
      where: {
        workoutLog: {
          userId: req.userId
        }
      },
      select: {
        weightKg: true,
        repsCompleted: true
      }
    });

    const totalVolume = allLogs.reduce((sum, log) => {
      return sum + (log.weightKg * log.repsCompleted);
    }, 0);

    // Average workout duration (mock - would need actual duration tracking)
    // For now, we'll just count exercises per workout (filtered by user)
    const workoutsWithCounts = await prisma.workoutLog.findMany({
      where: { userId: req.userId },
      include: {
        _count: {
          select: { exerciseLogs: true }
        }
      }
    });

    const avgSetsPerWorkout = totalWorkouts > 0
      ? totalSets / totalWorkouts
      : 0;

    // Most trained muscle group
    const muscleGroupStats = await prisma.exerciseLog.groupBy({
      by: ['exerciseId'],
      _count: {
        exerciseId: true
      }
    });

    // Get muscle group breakdown
    const muscleGroupCounts = {};
    for (const stat of muscleGroupStats) {
      const exercise = await prisma.exercise.findUnique({
        where: { id: stat.exerciseId },
        include: {
          muscleGroup: {
            select: { name: true }
          }
        }
      });

      if (exercise && exercise.muscleGroup) {
        const mgName = exercise.muscleGroup.name;
        muscleGroupCounts[mgName] = (muscleGroupCounts[mgName] || 0) + stat._count.exerciseId;
      }
    }

    // Find most trained muscle group
    let mostTrainedMuscle = null;
    let maxCount = 0;
    for (const [muscle, count] of Object.entries(muscleGroupCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostTrainedMuscle = muscle;
      }
    }

    // Current streak (consecutive days with workouts)
    const streak = await calculateWorkoutStreak(req.userId);

    res.json({
      statistics: {
        totalWorkouts,
        totalSets,
        totalVolume: Math.round(totalVolume * 100) / 100, // Round to 2 decimals
        averageSetsPerWorkout: Math.round(avgSetsPerWorkout * 10) / 10,
        mostTrainedMuscle,
        muscleGroupBreakdown: muscleGroupCounts,
        currentStreak: streak
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Helper function to calculate exercise statistics
 */
const calculateExerciseStats = (logs) => {
  if (logs.length === 0) {
    return {
      totalSets: 0,
      averageWeight: 0,
      averageReps: 0,
      maxWeight: 0,
      maxReps: 0
    };
  }

  const totalSets = logs.length;
  const totalWeight = logs.reduce((sum, log) => sum + parseFloat(log.weightKg), 0);
  const totalReps = logs.reduce((sum, log) => sum + log.repsCompleted, 0);
  const maxWeight = Math.max(...logs.map(log => parseFloat(log.weightKg)));
  const maxReps = Math.max(...logs.map(log => log.repsCompleted));

  return {
    totalSets,
    averageWeight: Math.round((totalWeight / totalSets) * 100) / 100,
    averageReps: Math.round((totalReps / totalSets) * 10) / 10,
    maxWeight,
    maxReps
  };
};

/**
 * Helper function to calculate workout streak
 */
const calculateWorkoutStreak = async (userId) => {
  const workouts = await prisma.workoutLog.findMany({
    where: { userId: userId },
    select: {
      completedDate: true
    },
    orderBy: {
      completedDate: 'desc'
    }
  });

  if (workouts.length === 0) return 0;

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if most recent workout was today or yesterday
  const mostRecent = new Date(workouts[0].completedDate);
  mostRecent.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));

  if (daysDiff > 1) return 0; // Streak broken

  // Count consecutive days
  for (let i = 1; i < workouts.length; i++) {
    const current = new Date(workouts[i - 1].completedDate);
    const next = new Date(workouts[i].completedDate);
    current.setHours(0, 0, 0, 0);
    next.setHours(0, 0, 0, 0);

    const diff = Math.floor((current - next) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
  }

  return streak;
};

module.exports = router;
