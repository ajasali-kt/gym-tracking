const prisma = require('../prismaClient');
const { createHttpError } = require('../utils/http');

const importMuscleGroups = async (payload) => {
  const { muscleGroups } = payload;
  if (!Array.isArray(muscleGroups)) {
    throw createHttpError(400, 'muscleGroups must be an array');
  }

  const results = [];
  const errors = [];

  for (const group of muscleGroups) {
    try {
      const existing = await prisma.muscleGroup.findUnique({
        where: { name: group.name }
      });

      if (existing) {
        const updated = await prisma.muscleGroup.update({
          where: { id: existing.id },
          data: {
            description: group.description || existing.description
          }
        });
        results.push({ action: 'updated', muscleGroup: updated });
      } else {
        const created = await prisma.muscleGroup.create({
          data: {
            name: group.name,
            description: group.description || null
          }
        });
        results.push({ action: 'created', muscleGroup: created });
      }
    } catch (error) {
      errors.push({
        muscleGroup: group.name,
        error: error.message
      });
    }
  }

  return {
    success: true,
    message: `Imported ${results.length} muscle groups`,
    results,
    errors: errors.length > 0 ? errors : undefined
  };
};

const importExercises = async (payload) => {
  const { exercises } = payload;
  if (!Array.isArray(exercises)) {
    throw createHttpError(400, 'exercises must be an array');
  }

  const results = [];
  const errors = [];

  for (const exercise of exercises) {
    try {
      const muscleGroup = await prisma.muscleGroup.findUnique({
        where: { name: exercise.muscleGroupName }
      });

      if (!muscleGroup) {
        errors.push({
          exercise: exercise.name,
          error: `Muscle group "${exercise.muscleGroupName}" not found. Please import muscle groups first.`
        });
        continue;
      }

      const existing = await prisma.exercise.findUnique({
        where: { name: exercise.name }
      });

      if (existing) {
        const updated = await prisma.exercise.update({
          where: { id: existing.id },
          data: {
            muscleGroupId: muscleGroup.id,
            description: exercise.description || existing.description,
            steps: exercise.steps || existing.steps,
            youtubeUrl: exercise.youtubeUrl || existing.youtubeUrl
          }
        });
        results.push({ action: 'updated', exercise: updated });
      } else {
        const created = await prisma.exercise.create({
          data: {
            name: exercise.name,
            muscleGroupId: muscleGroup.id,
            description: exercise.description || 'No description provided',
            steps: exercise.steps || [],
            youtubeUrl: exercise.youtubeUrl || null
          }
        });
        results.push({ action: 'created', exercise: created });
      }
    } catch (error) {
      errors.push({
        exercise: exercise.name,
        error: error.message
      });
    }
  }

  return {
    success: true,
    message: `Imported ${results.length} exercises`,
    results,
    errors: errors.length > 0 ? errors : undefined
  };
};

const getAdminStats = async () => {
  const stats = {
    muscleGroups: await prisma.muscleGroup.count(),
    exercises: await prisma.exercise.count(),
    workoutPlans: await prisma.workoutPlan.count(),
    workoutDays: await prisma.workoutDay.count(),
    workoutLogs: await prisma.workoutLog.count(),
    exerciseLogs: await prisma.exerciseLog.count()
  };

  return {
    success: true,
    stats,
    timestamp: new Date().toISOString()
  };
};

const listUserFeatures = async () => {
  const users = await prisma.user.findMany({
    orderBy: { username: 'asc' },
    select: {
      id: true,
      username: true,
      userType: true,
      createdAt: true,
      userFeature: {
        select: {
          bodyMeasurementsEnabled: true,
          updatedAt: true
        }
      }
    }
  });

  const missingFeatureUsers = users.filter((user) => !user.userFeature);
  if (missingFeatureUsers.length > 0) {
    await prisma.userFeature.createMany({
      data: missingFeatureUsers.map((user) => ({ userId: user.id })),
      skipDuplicates: true
    });
  }

  return {
    success: true,
    users: users.map((user) => ({
      id: user.id,
      username: user.username,
      userType: user.userType,
      createdAt: user.createdAt,
      features: {
        bodyMeasurementsEnabled: !!user.userFeature?.bodyMeasurementsEnabled
      }
    }))
  };
};

const updateUserFeature = async (userId, payload) => {
  const parsedUserId = Number.parseInt(userId, 10);
  if (!Number.isFinite(parsedUserId)) {
    throw createHttpError(400, 'Invalid user id');
  }

  if (typeof payload.bodyMeasurementsEnabled !== 'boolean') {
    throw createHttpError(400, 'bodyMeasurementsEnabled must be a boolean');
  }

  const user = await prisma.user.findUnique({
    where: { id: parsedUserId },
    select: { id: true, username: true }
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const userFeature = await prisma.userFeature.upsert({
    where: { userId: parsedUserId },
    update: {
      bodyMeasurementsEnabled: payload.bodyMeasurementsEnabled
    },
    create: {
      userId: parsedUserId,
      bodyMeasurementsEnabled: payload.bodyMeasurementsEnabled
    }
  });

  return {
    success: true,
    user: {
      ...user,
      features: {
        bodyMeasurementsEnabled: userFeature.bodyMeasurementsEnabled
      }
    }
  };
};

const clearAllData = async () => {
  await prisma.exerciseLog.deleteMany({});
  await prisma.workoutLog.deleteMany({});
  await prisma.bodyMeasurement.deleteMany({});
  await prisma.workoutDayExercise.deleteMany({});
  await prisma.workoutDay.deleteMany({});
  await prisma.workoutPlan.deleteMany({});
  await prisma.exercise.deleteMany({});
  await prisma.muscleGroup.deleteMany({});

  return {
    success: true,
    message: 'All data cleared successfully'
  };
};

module.exports = {
  importMuscleGroups,
  importExercises,
  getAdminStats,
  listUserFeatures,
  updateUserFeature,
  clearAllData
};
