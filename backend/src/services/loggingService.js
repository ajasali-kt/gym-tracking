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
  let targetDate;

  if (!completedDate) {
    targetDate = new Date();
  } else if (typeof completedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(completedDate)) {
    const [year, month, day] = completedDate.split('-').map((value) => Number.parseInt(value, 10));
    targetDate = new Date(Date.UTC(year, month - 1, day));
  } else {
    const parsed = new Date(completedDate);
    if (Number.isNaN(parsed.getTime())) {
      targetDate = new Date();
    } else {
      targetDate = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
    }
  }

  return targetDate;
};

const isRunningExercise = (exercise) => exercise?.metricType === 'RUNNING';

const parsePositiveFloat = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const calculatePace = (durationMinutes, distanceKm) => {
  if (!durationMinutes || !distanceKm) return null;
  return Math.round((durationMinutes / distanceKm) * 100) / 100;
};

const logWorkout = async (userId, payload) => {
  const { workoutLogId, workoutName, completedDate, notes, sets } = payload;

  if (!workoutName || !workoutName.trim()) {
    throw createHttpError(400, 'Missing required field: workoutName');
  }

  if (!completedDate) {
    throw createHttpError(400, 'Missing required field: completedDate');
  }

  if (!Array.isArray(sets)) {
    throw createHttpError(400, 'Missing required field: sets');
  }

  const baseSets = sets.map((set, index) => {
    const parsedExerciseId = Number.parseInt(set.exerciseId, 10);
    const parsedSetNumber = Number.parseInt(set.setNumber, 10);
    const parsedId = set.id !== undefined && set.id !== null
      ? Number.parseInt(set.id, 10)
      : null;

    if (!parsedExerciseId || !parsedSetNumber) {
      throw createHttpError(400, `Invalid set at index ${index}: exerciseId and setNumber are required`);
    }

    if (parsedId !== null && Number.isNaN(parsedId)) {
      throw createHttpError(400, `Invalid set id at index ${index}`);
    }

    return {
      id: parsedId,
      exerciseId: parsedExerciseId,
      setNumber: parsedSetNumber,
      repsCompleted: set.repsCompleted,
      weightKg: set.weightKg,
      distanceKm: set.distanceKm,
      durationMinutes: set.durationMinutes,
      notes: set.notes || null,
      index
    };
  });

  const exerciseIds = [...new Set(baseSets.map((set) => set.exerciseId))];
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
    select: { id: true, metricType: true }
  });
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

  const parsedSets = baseSets.map((set) => {
    const exercise = exerciseById.get(set.exerciseId);
    if (!exercise) {
      throw createHttpError(400, `Invalid set at index ${set.index}: exercise not found`);
    }

    if (isRunningExercise(exercise)) {
      const distanceKm = parsePositiveFloat(set.distanceKm);
      const durationMinutes = parsePositiveFloat(set.durationMinutes);

      if (distanceKm === null || durationMinutes === null) {
        throw createHttpError(400, `Invalid run at index ${set.index}: distanceKm and durationMinutes > 0 are required`);
      }

      return {
        id: set.id,
        exerciseId: set.exerciseId,
        setNumber: set.setNumber,
        repsCompleted: null,
        weightKg: null,
        distanceKm,
        durationMinutes,
        paceMinutesPerKm: calculatePace(durationMinutes, distanceKm),
        notes: set.notes
      };
    }

    const parsedReps = Number.parseInt(set.repsCompleted, 10);
    const parsedWeight = Number.parseFloat(set.weightKg);
    if (!parsedReps || Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      throw createHttpError(
        400,
        `Invalid set at index ${set.index}: repsCompleted and weightKg > 0 are required`
      );
    }

    return {
      id: set.id,
      exerciseId: set.exerciseId,
      setNumber: set.setNumber,
      repsCompleted: parsedReps,
      weightKg: parsedWeight,
      distanceKm: null,
      durationMinutes: null,
      paceMinutesPerKm: null,
      notes: set.notes
    };
  });

  const normalizedDate = normalizeDate(completedDate);
  const trimmedWorkoutName = workoutName.trim();

  const result = await prisma.$transaction(async (tx) => {
    let targetWorkoutLogId = null;

    if (workoutLogId !== undefined && workoutLogId !== null) {
      const parsedWorkoutLogId = Number.parseInt(workoutLogId, 10);
      if (Number.isNaN(parsedWorkoutLogId)) {
        throw createHttpError(400, 'Invalid workoutLogId');
      }

      const existingLog = await tx.workoutLog.findFirst({
        where: {
          id: parsedWorkoutLogId,
          userId
        }
      });

      if (!existingLog) {
        throw createHttpError(404, 'Workout log not found');
      }

      targetWorkoutLogId = parsedWorkoutLogId;
    } else {
      const created = await tx.workoutLog.create({
        data: {
          userId,
          workoutDayId: null,
          workoutName: trimmedWorkoutName,
          completedDate: normalizedDate,
          notes: notes || null,
          isManual: true
        }
      });
      targetWorkoutLogId = created.id;
    }

    const workoutUpdateData = {
      workoutName: trimmedWorkoutName,
      completedDate: normalizedDate,
      notes: notes || null
    };

    await tx.workoutLog.update({
      where: { id: targetWorkoutLogId },
      data: workoutUpdateData
    });

    const existingSets = await tx.exerciseLog.findMany({
      where: { workoutLogId: targetWorkoutLogId },
      select: { id: true }
    });
    const existingSetIdSet = new Set(existingSets.map((set) => set.id));

    const incomingSetIds = [];
    for (const set of parsedSets) {
      if (set.id !== null) {
        if (!existingSetIdSet.has(set.id)) {
          throw createHttpError(400, `Exercise set ${set.id} does not belong to this workout`);
        }

        await tx.exerciseLog.update({
          where: { id: set.id },
          data: {
            exerciseId: set.exerciseId,
            setNumber: set.setNumber,
            repsCompleted: set.repsCompleted,
            weightKg: set.weightKg,
            distanceKm: set.distanceKm,
            durationMinutes: set.durationMinutes,
            paceMinutesPerKm: set.paceMinutesPerKm,
            notes: set.notes
          }
        });
        incomingSetIds.push(set.id);
      } else {
        const matchingExistingSet = await tx.exerciseLog.findFirst({
          where: {
            workoutLogId: targetWorkoutLogId,
            exerciseId: set.exerciseId,
            setNumber: set.setNumber
          },
          orderBy: { id: 'asc' },
          select: { id: true }
        });

        if (matchingExistingSet) {
          await tx.exerciseLog.update({
            where: { id: matchingExistingSet.id },
            data: {
              repsCompleted: set.repsCompleted,
              weightKg: set.weightKg,
              distanceKm: set.distanceKm,
              durationMinutes: set.durationMinutes,
              paceMinutesPerKm: set.paceMinutesPerKm,
              notes: set.notes
            }
          });

          incomingSetIds.push(matchingExistingSet.id);
        } else {
          const createdSet = await tx.exerciseLog.create({
            data: {
              workoutLogId: targetWorkoutLogId,
              exerciseId: set.exerciseId,
              setNumber: set.setNumber,
              repsCompleted: set.repsCompleted,
              weightKg: set.weightKg,
              distanceKm: set.distanceKm,
              durationMinutes: set.durationMinutes,
              paceMinutesPerKm: set.paceMinutesPerKm,
              notes: set.notes
            }
          });
          incomingSetIds.push(createdSet.id);
        }
      }
    }

    if (incomingSetIds.length > 0) {
      await tx.exerciseLog.deleteMany({
        where: {
          workoutLogId: targetWorkoutLogId,
          id: {
            notIn: incomingSetIds
          }
        }
      });
    } else {
      await tx.exerciseLog.deleteMany({
        where: {
          workoutLogId: targetWorkoutLogId
        }
      });
    }

    const canonicalSets = await tx.exerciseLog.findMany({
      where: { workoutLogId: targetWorkoutLogId },
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
    });

    return {
      workoutLogId: targetWorkoutLogId,
      savedAt: new Date(),
      exerciseLogs: canonicalSets
    };
  });

  return result;
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
  const { exerciseId, setNumber, repsCompleted, weightKg, distanceKm, durationMinutes, notes } = payload;
  if (!exerciseId || !setNumber) {
    throw createHttpError(400, 'Missing required fields: exerciseId, setNumber');
  }

  const parsedId = Number.parseInt(id, 10);
  const parsedExerciseId = Number.parseInt(exerciseId, 10);
  const parsedSetNumber = Number.parseInt(setNumber, 10);

  if (!Number.isInteger(parsedExerciseId) || parsedExerciseId <= 0) {
    throw createHttpError(400, 'Invalid exerciseId');
  }
  if (!Number.isInteger(parsedSetNumber) || parsedSetNumber <= 0) {
    throw createHttpError(400, 'Invalid setNumber');
  }
  const workoutLog = await prisma.workoutLog.findFirst({
    where: {
      id: parsedId,
      userId
    }
  });

  if (!workoutLog) {
    throw createHttpError(404, 'Workout log not found');
  }

  const exercise = await prisma.exercise.findUnique({
    where: { id: parsedExerciseId }
  });

  if (!exercise) {
    throw createHttpError(404, 'Exercise not found');
  }

  let logData;
  if (isRunningExercise(exercise)) {
    const parsedDistanceKm = parsePositiveFloat(distanceKm);
    const parsedDurationMinutes = parsePositiveFloat(durationMinutes);
    if (parsedDistanceKm === null || parsedDurationMinutes === null) {
      throw createHttpError(400, 'Invalid running log: distanceKm and durationMinutes > 0 are required');
    }
    logData = {
      repsCompleted: null,
      weightKg: null,
      distanceKm: parsedDistanceKm,
      durationMinutes: parsedDurationMinutes,
      paceMinutesPerKm: calculatePace(parsedDurationMinutes, parsedDistanceKm),
      notes: notes || null
    };
  } else {
    const parsedRepsCompleted = Number.parseInt(repsCompleted, 10);
    const parsedWeightKg = Number.parseFloat(weightKg);
    if (!Number.isInteger(parsedRepsCompleted) || parsedRepsCompleted <= 0) {
      throw createHttpError(400, 'Invalid repsCompleted');
    }
    if (!Number.isFinite(parsedWeightKg) || parsedWeightKg <= 0) {
      throw createHttpError(400, 'Invalid weightKg');
    }
    logData = {
      repsCompleted: parsedRepsCompleted,
      weightKg: parsedWeightKg,
      distanceKm: null,
      durationMinutes: null,
      paceMinutesPerKm: null,
      notes: notes || null
    };
  }

  return prisma.$transaction(async (tx) => {
    const existingSets = await tx.exerciseLog.findMany({
      where: {
        workoutLogId: parsedId,
        exerciseId: parsedExerciseId,
        setNumber: parsedSetNumber
      },
      orderBy: { id: 'asc' },
      select: { id: true }
    });

    let targetSetId;
    if (existingSets.length > 0) {
      targetSetId = existingSets[0].id;
      await tx.exerciseLog.update({
        where: { id: targetSetId },
        data: {
          ...logData
        }
      });

      if (existingSets.length > 1) {
        await tx.exerciseLog.deleteMany({
          where: {
            id: {
              in: existingSets.slice(1).map((set) => set.id)
            }
          }
        });
      }
    } else {
      const created = await tx.exerciseLog.create({
        data: {
          workoutLogId: parsedId,
          exerciseId: parsedExerciseId,
          setNumber: parsedSetNumber,
          ...logData
        },
        select: { id: true }
      });
      targetSetId = created.id;
    }

    return tx.exerciseLog.findUnique({
      where: { id: targetSetId },
      include: {
        exercise: {
          include: {
            muscleGroup: true
          }
        }
      }
    });
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
  const { repsCompleted, weightKg, distanceKm, durationMinutes, notes } = payload;

  const existingSet = await prisma.exerciseLog.findFirst({
    where: {
      id: parsedSetId,
      workoutLog: {
        userId
      }
    },
    include: {
      exercise: true
    }
  });

  if (!existingSet) {
    throw createHttpError(404, 'Exercise log not found');
  }

  const updateData = {};
  if (isRunningExercise(existingSet.exercise)) {
    const nextDistanceKm = distanceKm !== undefined ? parsePositiveFloat(distanceKm) : existingSet.distanceKm;
    const nextDurationMinutes = durationMinutes !== undefined ? parsePositiveFloat(durationMinutes) : existingSet.durationMinutes;
    if (nextDistanceKm === null || nextDurationMinutes === null) {
      throw createHttpError(400, 'Invalid running log: distanceKm and durationMinutes > 0 are required');
    }
    updateData.repsCompleted = null;
    updateData.weightKg = null;
    updateData.distanceKm = nextDistanceKm;
    updateData.durationMinutes = nextDurationMinutes;
    updateData.paceMinutesPerKm = calculatePace(nextDurationMinutes, nextDistanceKm);
  } else {
    if (repsCompleted !== undefined) updateData.repsCompleted = Number.parseInt(repsCompleted, 10);
    if (weightKg !== undefined) updateData.weightKg = Number.parseFloat(weightKg);
    updateData.distanceKm = null;
    updateData.durationMinutes = null;
    updateData.paceMinutesPerKm = null;
  }
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
  logWorkout,
  startWorkoutLog,
  getWorkoutLogById,
  addWorkoutSet,
  completeWorkoutLog,
  deleteWorkoutLog,
  updateExerciseSet,
  deleteExerciseSet
};
