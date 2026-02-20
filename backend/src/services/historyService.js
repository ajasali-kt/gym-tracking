const prisma = require('../prismaClient');

/**
 * Get workout history for a user within a date range
 * @param {number} userId - User ID
 * @param {Date} fromDate - Start date
 * @param {Date} toDate - End date
 * @returns {Promise<Object>} Workout history with timeline and statistics
 */
const getWorkoutHistory = async (userId, fromDate, toDate) => {
  // Fetch all workout logs in the date range
  const workoutLogs = await prisma.workoutLog.findMany({
    where: {
      userId,
      completedDate: {
        gte: new Date(fromDate),
        lte: new Date(toDate)
      }
    },
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
        orderBy: {
          setNumber: 'asc'
        }
      }
    },
    orderBy: {
      completedDate: 'desc'
    }
  });

  // Transform data into timeline format
  const timeline = workoutLogs.map(log => {
    // Group exercise logs by exercise
    const exerciseGroups = {};

    log.exerciseLogs.forEach(exerciseLog => {
      const exerciseId = exerciseLog.exerciseId;

      if (!exerciseGroups[exerciseId]) {
        exerciseGroups[exerciseId] = {
          exerciseId,
          exerciseName: exerciseLog.exercise.name,
          muscleGroup: exerciseLog.exercise.muscleGroup?.name || 'Unknown',
          sets: []
        };
      }

      exerciseGroups[exerciseId].sets.push({
        setNumber: exerciseLog.setNumber,
        reps: exerciseLog.repsCompleted,
        weight: exerciseLog.weightKg,
        notes: exerciseLog.notes
      });
    });

    return {
      date: log.completedDate,
      workoutName: log.workoutName || log.workoutDay?.dayName || 'Workout',
      muscleGroup: log.workoutDay?.muscleGroup?.name || 'General',
      notes: log.notes,
      exercises: Object.values(exerciseGroups)
    };
  });

  // Calculate statistics
  const totalWorkouts = workoutLogs.length;
  const totalSets = workoutLogs.reduce(
    (sum, log) => sum + log.exerciseLogs.length,
    0
  );
  const totalVolume = workoutLogs.reduce(
    (sum, log) => sum + log.exerciseLogs.reduce(
      (exerciseSum, exerciseLog) => exerciseSum + (exerciseLog.repsCompleted * exerciseLog.weightKg),
      0
    ),
    0
  );

  // Volume by muscle group
  const volumeByMuscleGroup = {};
  workoutLogs.forEach(log => {
    log.exerciseLogs.forEach(exerciseLog => {
      const muscleGroupName = exerciseLog.exercise.muscleGroup?.name || 'Unknown';
      const volume = exerciseLog.repsCompleted * exerciseLog.weightKg;

      if (!volumeByMuscleGroup[muscleGroupName]) {
        volumeByMuscleGroup[muscleGroupName] = 0;
      }
      volumeByMuscleGroup[muscleGroupName] += volume;
    });
  });

  return {
    fromDate,
    toDate,
    totalWorkouts,
    totalSets,
    totalVolume: Math.round(totalVolume * 100) / 100,
    volumeByMuscleGroup,
    workouts: timeline
  };
};

module.exports = {
  getWorkoutHistory
};
