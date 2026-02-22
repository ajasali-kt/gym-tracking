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

const addExerciseToWorkoutDay = async (dayId, userId, payload) => {
  const { exerciseId, sets, reps, restSeconds, orderIndex } = payload;

  if (!exerciseId || !sets || !reps || restSeconds === undefined || orderIndex === undefined) {
    throw createHttpError(400, 'Missing required fields: exerciseId, sets, reps, restSeconds, orderIndex');
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

  return prisma.workoutDayExercise.create({
    data: {
      workoutDayId: Number.parseInt(dayId, 10),
      exerciseId: Number.parseInt(exerciseId, 10),
      sets: Number.parseInt(sets, 10),
      reps: reps.toString(),
      restSeconds: Number.parseInt(restSeconds, 10),
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
