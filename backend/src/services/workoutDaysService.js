const prisma = require('../prismaClient');
const { createHttpError } = require('../utils/http');

const getWorkoutDayById = async (dayId, userId) => {
  const workoutDay = await prisma.workoutDay.findFirst({
    where: {
      id: Number.parseInt(dayId, 10),
      plan: {
        userId
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
    throw createHttpError(404, 'Workout day not found');
  }

  return workoutDay;
};

const parseOptionalPositiveFloat = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const addExerciseToWorkoutDay = async (dayId, userId, payload) => {
  const { exerciseId, sets, reps, restSeconds, orderIndex, targetDistanceKm, targetDurationMinutes } = payload;

  if (!exerciseId || orderIndex === undefined) {
    throw createHttpError(400, 'Missing required fields: exerciseId, orderIndex');
  }

  const workoutDay = await prisma.workoutDay.findFirst({
    where: {
      id: Number.parseInt(dayId, 10),
      plan: {
        userId
      }
    }
  });

  if (!workoutDay) {
    throw createHttpError(404, 'Workout day not found');
  }

  const exercise = await prisma.exercise.findUnique({
    where: { id: Number.parseInt(exerciseId, 10) }
  });

  if (!exercise) {
    throw createHttpError(404, 'Exercise not found');
  }

  const isRunning = exercise.metricType === 'RUNNING';
  const parsedTargetDistance = parseOptionalPositiveFloat(targetDistanceKm);
  const parsedTargetDuration = parseOptionalPositiveFloat(targetDurationMinutes);

  if (isRunning && parsedTargetDistance === null && parsedTargetDuration === null) {
    throw createHttpError(400, 'Running exercises require targetDistanceKm or targetDurationMinutes');
  }

  if (!isRunning && (!sets || !reps || restSeconds === undefined)) {
    throw createHttpError(400, 'Missing required fields: sets, reps, restSeconds');
  }

  return prisma.workoutDayExercise.create({
    data: {
      workoutDayId: Number.parseInt(dayId, 10),
      exerciseId: Number.parseInt(exerciseId, 10),
      sets: isRunning ? 1 : Number.parseInt(sets, 10),
      reps: isRunning ? 'Run' : reps.toString(),
      restSeconds: isRunning ? 0 : Number.parseInt(restSeconds, 10),
      targetDistanceKm: parsedTargetDistance,
      targetDurationMinutes: parsedTargetDuration,
      orderIndex: Number.parseInt(orderIndex, 10)
    },
    include: {
      exercise: {
        include: {
          muscleGroup: true
        }
      }
    }
  });
};

const deleteWorkoutDayById = async (dayId, userId) => {
  const parsedDayId = Number.parseInt(dayId, 10);
  const workoutDay = await prisma.workoutDay.findFirst({
    where: {
      id: parsedDayId,
      plan: {
        userId
      }
    }
  });

  if (!workoutDay) {
    throw createHttpError(404, 'Workout day not found');
  }

  await prisma.workoutDay.delete({
    where: { id: parsedDayId }
  });

  return {
    success: true,
    message: 'Workout day deleted successfully'
  };
};

module.exports = {
  getWorkoutDayById,
  addExerciseToWorkoutDay,
  deleteWorkoutDayById
};
