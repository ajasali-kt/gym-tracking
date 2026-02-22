const prisma = require('../prismaClient');
const { createHttpError } = require('../utils/http');

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
  const totalWeight = logs.reduce((sum, log) => sum + Number.parseFloat(log.weightKg), 0);
  const totalReps = logs.reduce((sum, log) => sum + log.repsCompleted, 0);
  const maxWeight = Math.max(...logs.map((log) => Number.parseFloat(log.weightKg)));
  const maxReps = Math.max(...logs.map((log) => log.repsCompleted));

  return {
    totalSets,
    averageWeight: Math.round((totalWeight / totalSets) * 100) / 100,
    averageReps: Math.round((totalReps / totalSets) * 10) / 10,
    maxWeight,
    maxReps
  };
};

const calculateWorkoutStreak = async (userId) => {
  const workouts = await prisma.workoutLog.findMany({
    where: { userId },
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

  const mostRecent = new Date(workouts[0].completedDate);
  mostRecent.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) return 0;

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

const getProgressHistory = async (userId, query) => {
  const { startDate, endDate, limit } = query;
  const whereClause = { userId };

  if (startDate || endDate) {
    whereClause.completedDate = {};
    if (startDate) whereClause.completedDate.gte = new Date(startDate);
    if (endDate) whereClause.completedDate.lte = new Date(endDate);
  }

  return prisma.workoutLog.findMany({
    where: whereClause,
    take: limit ? Number.parseInt(limit, 10) : undefined,
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
};

const getRecentProgress = async (userId, query) => {
  const { limit } = query;

  return prisma.workoutLog.findMany({
    where: { userId },
    take: limit ? Number.parseInt(limit, 10) : 10,
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
};

const getExerciseProgress = async (userId, exerciseId, query) => {
  const parsedExerciseId = Number.parseInt(exerciseId, 10);
  const { limit } = query;

  const exercise = await prisma.exercise.findUnique({
    where: { id: parsedExerciseId },
    include: {
      muscleGroup: true
    }
  });

  if (!exercise) {
    throw createHttpError(404, 'Exercise not found');
  }

  const logs = await prisma.exerciseLog.findMany({
    where: {
      exerciseId: parsedExerciseId,
      workoutLog: {
        userId
      }
    },
    take: limit ? Number.parseInt(limit, 10) : 50,
    orderBy: [
      { workoutLog: { completedDate: 'desc' } },
      { createdAt: 'desc' }
    ],
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

  return {
    exercise,
    logs,
    statistics: calculateExerciseStats(logs)
  };
};

const getExercisePersonalRecord = async (userId, exerciseId) => {
  const parsedExerciseId = Number.parseInt(exerciseId, 10);

  const maxWeightLog = await prisma.exerciseLog.findFirst({
    where: {
      exerciseId: parsedExerciseId,
      workoutLog: {
        userId
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

  const maxRepsLog = await prisma.exerciseLog.findFirst({
    where: {
      exerciseId: parsedExerciseId,
      workoutLog: {
        userId
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

  const allLogs = await prisma.exerciseLog.findMany({
    where: {
      exerciseId: parsedExerciseId,
      workoutLog: {
        userId
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

  return {
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
  };
};

const getProgressStats = async (userId) => {
  const totalWorkouts = await prisma.workoutLog.count({
    where: { userId }
  });

  const totalSets = await prisma.exerciseLog.count({
    where: {
      workoutLog: {
        userId
      }
    }
  });

  const allLogs = await prisma.exerciseLog.findMany({
    where: {
      workoutLog: {
        userId
      }
    },
    select: {
      weightKg: true,
      repsCompleted: true
    }
  });

  const totalVolume = allLogs.reduce((sum, log) => sum + (log.weightKg * log.repsCompleted), 0);
  const avgSetsPerWorkout = totalWorkouts > 0 ? totalSets / totalWorkouts : 0;

  const muscleGroupStats = await prisma.exerciseLog.groupBy({
    by: ['exerciseId'],
    _count: {
      exerciseId: true
    },
    where: {
      workoutLog: {
        userId
      }
    }
  });

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
      const name = exercise.muscleGroup.name;
      muscleGroupCounts[name] = (muscleGroupCounts[name] || 0) + stat._count.exerciseId;
    }
  }

  let mostTrainedMuscle = null;
  let maxCount = 0;
  for (const [muscle, count] of Object.entries(muscleGroupCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostTrainedMuscle = muscle;
    }
  }

  const streak = await calculateWorkoutStreak(userId);

  return {
    statistics: {
      totalWorkouts,
      totalSets,
      totalVolume: Math.round(totalVolume * 100) / 100,
      averageSetsPerWorkout: Math.round(avgSetsPerWorkout * 10) / 10,
      mostTrainedMuscle,
      muscleGroupBreakdown: muscleGroupCounts,
      currentStreak: streak
    }
  };
};

module.exports = {
  getProgressHistory,
  getRecentProgress,
  getExerciseProgress,
  getExercisePersonalRecord,
  getProgressStats
};
