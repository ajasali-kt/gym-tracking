const prisma = require('../prismaClient');
const { createHttpError } = require('../utils/http');

const workoutLogInclude = {
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
};

const normalizeDate = (completedDate) => {
  const targetDate = completedDate ? new Date(completedDate) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  return targetDate;
};

const createManualWorkoutLog = async (userId, payload) => {
  const { completedDate, workoutName, notes } = payload;
  if (!workoutName) {
    throw createHttpError(400, 'Missing required field: workoutName');
  }

  return prisma.workoutLog.create({
    data: {
      userId,
      workoutDayId: null,
      workoutName,
      completedDate: normalizeDate(completedDate),
      notes: notes || null,
      isManual: true
    },
    include: {
      exerciseLogs: workoutLogInclude.exerciseLogs
    }
  });
};

const startWorkoutLog = async (userId, payload) => {
  const { workoutDayId, completedDate } = payload;
  if (!workoutDayId) {
    throw createHttpError(400, 'Missing required field: workoutDayId');
  }

  const parsedWorkoutDayId = Number.parseInt(workoutDayId, 10);
  const workoutDay = await prisma.workoutDay.findFirst({
    where: {
      id: parsedWorkoutDayId,
      plan: {
        userId
      }
    }
  });

  if (!workoutDay) {
    throw createHttpError(404, 'Workout day not found');
  }

  const targetDate = normalizeDate(completedDate);

  const existingLog = await prisma.workoutLog.findFirst({
    where: {
      workoutDayId: parsedWorkoutDayId,
      completedDate: targetDate,
      userId
    },
    include: workoutLogInclude
  });

  if (existingLog) {
    return { statusCode: 200, data: existingLog };
  }

  const created = await prisma.workoutLog.create({
    data: {
      userId,
      workoutDayId: parsedWorkoutDayId,
      completedDate: targetDate,
      notes: null
    },
    include: workoutLogInclude
  });

  return { statusCode: 201, data: created };
};

const getWorkoutLogById = async (userId, id) => {
  const workoutLog = await prisma.workoutLog.findFirst({
    where: {
      id: Number.parseInt(id, 10),
      userId
    },
    include: workoutLogInclude
  });

  if (!workoutLog) {
    throw createHttpError(404, 'Workout log not found');
  }

  return workoutLog;
};

const addWorkoutSet = async (userId, id, payload) => {
  const { exerciseId, setNumber, repsCompleted, weightKg, notes } = payload;
  if (!exerciseId || !setNumber || !repsCompleted || weightKg === undefined) {
    throw createHttpError(400, 'Missing required fields: exerciseId, setNumber, repsCompleted, weightKg');
  }

  const parsedId = Number.parseInt(id, 10);
  const workoutLog = await prisma.workoutLog.findFirst({
    where: {
      id: parsedId,
      userId
    }
  });

  if (!workoutLog) {
    throw createHttpError(404, 'Workout log not found');
  }

  return prisma.exerciseLog.create({
    data: {
      workoutLogId: parsedId,
      exerciseId: Number.parseInt(exerciseId, 10),
      setNumber: Number.parseInt(setNumber, 10),
      repsCompleted: Number.parseInt(repsCompleted, 10),
      weightKg: Number.parseFloat(weightKg),
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
};

const updateWorkoutLog = async (userId, id, payload) => {
  const { workoutName, completedDate, notes } = payload;
  const parsedId = Number.parseInt(id, 10);
  const existingLog = await prisma.workoutLog.findFirst({
    where: {
      id: parsedId,
      userId
    }
  });

  if (!existingLog) {
    throw createHttpError(404, 'Workout log not found');
  }

  const updateData = {};
  if (workoutName !== undefined) updateData.workoutName = workoutName;
  if (notes !== undefined) updateData.notes = notes || null;
  if (completedDate !== undefined) updateData.completedDate = normalizeDate(completedDate);

  return prisma.workoutLog.update({
    where: { id: parsedId },
    data: updateData,
    include: workoutLogInclude
  });
};

const completeWorkoutLog = async (userId, id, payload) => {
  const { notes } = payload;
  const parsedId = Number.parseInt(id, 10);
  const existingLog = await prisma.workoutLog.findFirst({
    where: {
      id: parsedId,
      userId
    }
  });

  if (!existingLog) {
    throw createHttpError(404, 'Workout log not found');
  }

  const workoutLog = await prisma.workoutLog.update({
    where: { id: parsedId },
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

  return {
    success: true,
    message: 'Workout completed successfully',
    workoutLog
  };
};

const deleteWorkoutLog = async (userId, id) => {
  const parsedId = Number.parseInt(id, 10);
  const existingLog = await prisma.workoutLog.findFirst({
    where: {
      id: parsedId,
      userId
    }
  });

  if (!existingLog) {
    throw createHttpError(404, 'Workout log not found');
  }

  await prisma.workoutLog.delete({
    where: { id: parsedId }
  });

  return {
    success: true,
    message: 'Workout log deleted successfully'
  };
};

const updateExerciseSet = async (userId, setId, payload) => {
  const parsedSetId = Number.parseInt(setId, 10);
  const { repsCompleted, weightKg, notes } = payload;

  const existingSet = await prisma.exerciseLog.findFirst({
    where: {
      id: parsedSetId,
      workoutLog: {
        userId
      }
    }
  });

  if (!existingSet) {
    throw createHttpError(404, 'Exercise log not found');
  }

  const updateData = {};
  if (repsCompleted !== undefined) updateData.repsCompleted = Number.parseInt(repsCompleted, 10);
  if (weightKg !== undefined) updateData.weightKg = Number.parseFloat(weightKg);
  if (notes !== undefined) updateData.notes = notes;

  return prisma.exerciseLog.update({
    where: { id: parsedSetId },
    data: updateData,
    include: {
      exercise: {
        include: {
          muscleGroup: true
        }
      }
    }
  });
};

const deleteExerciseSet = async (userId, setId) => {
  const parsedSetId = Number.parseInt(setId, 10);
  const existingSet = await prisma.exerciseLog.findFirst({
    where: {
      id: parsedSetId,
      workoutLog: {
        userId
      }
    }
  });

  if (!existingSet) {
    throw createHttpError(404, 'Exercise log not found');
  }

  await prisma.exerciseLog.delete({
    where: { id: parsedSetId }
  });

  return {
    success: true,
    message: 'Exercise log deleted successfully'
  };
};

module.exports = {
  createManualWorkoutLog,
  startWorkoutLog,
  getWorkoutLogById,
  addWorkoutSet,
  updateWorkoutLog,
  completeWorkoutLog,
  deleteWorkoutLog,
  updateExerciseSet,
  deleteExerciseSet
};
