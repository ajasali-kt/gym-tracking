const prisma = require('../prismaClient');
const { createHttpError } = require('../utils/http');

const planInclude = {
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
};

const getActivePlan = async (userId) => {
  const activePlan = await prisma.workoutPlan.findFirst({
    where: {
      isActive: true,
      userId
    },
    include: planInclude
  });

  if (!activePlan) {
    throw createHttpError(404, 'No active workout plan found');
  }

  return activePlan;
};

const getPlanById = async (id, userId) => {
  const plan = await prisma.workoutPlan.findFirst({
    where: {
      id: Number.parseInt(id, 10),
      userId
    },
    include: planInclude
  });

  if (!plan) {
    throw createHttpError(404, 'Workout plan not found');
  }

  return plan;
};

const listPlans = async (userId) => prisma.workoutPlan.findMany({
  where: { userId },
  include: {
    _count: {
      select: { workoutDays: true }
    }
  },
  orderBy: { createdAt: 'desc' }
});

const createPlan = async (userId, payload) => {
  const { name, startDate, endDate, duration, trainingType, split, notes } = payload;

  if (!name || !startDate) {
    throw createHttpError(400, 'Missing required fields: name, startDate');
  }

  return prisma.$transaction(async (tx) => {
    await tx.workoutPlan.updateMany({
      where: {
        isActive: true,
        userId
      },
      data: { isActive: false }
    });

    return tx.workoutPlan.create({
      data: {
        userId,
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
};

const activatePlan = async (id, userId) => prisma.$transaction(async (tx) => {
  const parsedId = Number.parseInt(id, 10);
  const existingPlan = await tx.workoutPlan.findFirst({
    where: {
      id: parsedId,
      userId
    }
  });

  if (!existingPlan) {
    throw createHttpError(404, 'Workout plan not found or access denied');
  }

  await tx.workoutPlan.updateMany({
    where: {
      isActive: true,
      userId
    },
    data: { isActive: false }
  });

  return tx.workoutPlan.update({
    where: { id: parsedId },
    data: { isActive: true }
  });
});

const deletePlan = async (id, userId) => {
  const parsedId = Number.parseInt(id, 10);
  const plan = await prisma.workoutPlan.findFirst({
    where: {
      id: parsedId,
      userId
    }
  });

  if (!plan) {
    throw createHttpError(404, 'Workout plan not found or access denied');
  }

  await prisma.workoutPlan.delete({
    where: { id: parsedId }
  });

  return {
    success: true,
    message: 'Workout plan deleted successfully'
  };
};

const addPlanDay = async (id, userId, payload) => {
  const parsedId = Number.parseInt(id, 10);
  const { dayNumber, dayName, muscleGroupId } = payload;

  const plan = await prisma.workoutPlan.findFirst({
    where: {
      id: parsedId,
      userId
    }
  });

  if (!plan) {
    throw createHttpError(404, 'Workout plan not found or access denied');
  }

  if (!dayNumber) {
    throw createHttpError(400, 'Missing required field: dayNumber');
  }

  if (dayNumber < 1) {
    throw createHttpError(400, 'dayNumber must be at least 1');
  }

  return prisma.workoutDay.create({
    data: {
      planId: parsedId,
      dayNumber: Number.parseInt(dayNumber, 10),
      dayName: dayName || `Day ${dayNumber}`,
      muscleGroupId: muscleGroupId ? Number.parseInt(muscleGroupId, 10) : null
    },
    include: {
      muscleGroup: true
    }
  });
};

const getPlanDay = async (dayId, userId) => {
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
    throw createHttpError(404, 'Workout day not found or access denied');
  }

  return workoutDay;
};

const addExerciseToPlanDay = async (dayId, userId, payload) => {
  const parsedDayId = Number.parseInt(dayId, 10);
  const { exerciseId, sets, reps, restSeconds, orderIndex } = payload;

  const workoutDay = await prisma.workoutDay.findFirst({
    where: {
      id: parsedDayId,
      plan: {
        userId
      }
    }
  });

  if (!workoutDay) {
    throw createHttpError(404, 'Workout day not found or access denied');
  }

  if (!exerciseId || !sets || !reps || restSeconds === undefined || orderIndex === undefined) {
    throw createHttpError(400, 'Missing required fields: exerciseId, sets, reps, restSeconds, orderIndex');
  }

  return prisma.workoutDayExercise.create({
    data: {
      workoutDayId: parsedDayId,
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

const removeExerciseFromPlanDay = async (dayId, exerciseAssignmentId, userId) => {
  const parsedDayId = Number.parseInt(dayId, 10);
  const parsedAssignmentId = Number.parseInt(exerciseAssignmentId, 10);

  const workoutDay = await prisma.workoutDay.findFirst({
    where: {
      id: parsedDayId,
      plan: {
        userId
      }
    }
  });

  if (!workoutDay) {
    throw createHttpError(404, 'Workout day not found or access denied');
  }

  await prisma.workoutDayExercise.deleteMany({
    where: {
      workoutDayId: parsedDayId,
      id: parsedAssignmentId
    }
  });

  return {
    success: true,
    message: 'Exercise removed from workout day'
  };
};

const removePlanDay = async (dayId, userId) => {
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
    throw createHttpError(404, 'Workout day not found or access denied');
  }

  await prisma.workoutDay.delete({
    where: { id: parsedDayId }
  });

  return {
    success: true,
    message: 'Workout day deleted successfully'
  };
};

const importPlan = async (userId, payload) => {
  const {
    duration,
    trainingType,
    split,
    weeklySchedule,
    progressionPlan,
    planName,
    startDate
  } = payload;

  if (!weeklySchedule || typeof weeklySchedule !== 'object') {
    throw createHttpError(400, 'Missing or invalid weeklySchedule');
  }

  let notes = null;
  if (progressionPlan && typeof progressionPlan === 'object') {
    notes = Object.entries(progressionPlan)
      .map(([week, plan]) => `${week}: ${plan}`)
      .join('\n');
  }

  const name = planName || `${split || 'Workout Plan'} - ${duration || 'Custom'}`;

  let endDate = null;
  if (startDate && weeklySchedule) {
    const dayKeys = Object.keys(weeklySchedule).filter((key) => key.startsWith('Day'));
    const numberOfDays = dayKeys.length;
    if (numberOfDays > 0) {
      const start = new Date(startDate);
      endDate = new Date(start);
      endDate.setDate(endDate.getDate() + (numberOfDays - 1));
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.workoutPlan.updateMany({
      where: {
        isActive: true,
        userId
      },
      data: { isActive: false }
    });

    const newPlan = await tx.workoutPlan.create({
      data: {
        userId,
        name,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        duration: duration || null,
        trainingType: trainingType || null,
        split: split || null,
        notes,
        isActive: true
      }
    });

    for (const [dayKey, dayData] of Object.entries(weeklySchedule)) {
      const dayNumber = Number.parseInt(dayKey.replace('Day', ''), 10);
      if (Number.isNaN(dayNumber) || dayNumber < 1) continue;
      if (!dayData.exercises || dayData.exercises.length === 0) continue;

      let muscleGroupId = null;
      if (dayData.bodyPart && dayData.bodyPart !== 'Rest' && dayData.bodyPart !== 'Active Recovery') {
        const primaryMuscle = dayData.bodyPart.split('+')[0].trim();
        const muscleGroup = await tx.muscleGroup.findFirst({
          where: {
            name: {
              contains: primaryMuscle,
              mode: 'insensitive'
            }
          }
        });
        muscleGroupId = muscleGroup ? muscleGroup.id : null;
      }

      const workoutDay = await tx.workoutDay.create({
        data: {
          planId: newPlan.id,
          dayNumber,
          dayName: dayData.bodyPart || `Day ${dayNumber}`,
          muscleGroupId
        }
      });

      for (let i = 0; i < dayData.exercises.length; i++) {
        const exerciseData = dayData.exercises[i];
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
              reps: exerciseData.reps ? exerciseData.reps.toString() : (exerciseData.duration || '10'),
              restSeconds: 90,
              orderIndex: i + 1
            }
          });
        }
      }
    }

    return tx.workoutPlan.findUnique({
      where: { id: newPlan.id },
      include: planInclude
    });
  });
};

module.exports = {
  getActivePlan,
  getPlanById,
  listPlans,
  createPlan,
  activatePlan,
  deletePlan,
  addPlanDay,
  getPlanDay,
  addExerciseToPlanDay,
  removeExerciseFromPlanDay,
  removePlanDay,
  importPlan
};
