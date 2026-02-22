const prisma = require('../prismaClient');
const { createHttpError } = require('../utils/http');

const listExercises = async (muscleGroupId) => {
  const where = muscleGroupId
    ? { muscleGroupId: Number.parseInt(muscleGroupId, 10) }
    : {};

  return prisma.exercise.findMany({
    where,
    include: {
      muscleGroup: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
};

const getExerciseById = async (id) => {
  const exercise = await prisma.exercise.findUnique({
    where: { id: Number.parseInt(id, 10) },
    include: {
      muscleGroup: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    }
  });

  if (!exercise) {
    throw createHttpError(404, 'Exercise not found');
  }

  return exercise;
};

const createExercise = async (payload) => {
  const { name, muscleGroupId, description, steps, youtubeUrl } = payload;

  if (!name || !muscleGroupId || !description || !steps) {
    throw createHttpError(400, 'Missing required fields: name, muscleGroupId, description, steps');
  }

  if (!Array.isArray(steps) || steps.length === 0) {
    throw createHttpError(400, 'Steps must be a non-empty array');
  }

  return prisma.exercise.create({
    data: {
      name,
      muscleGroupId: Number.parseInt(muscleGroupId, 10),
      description,
      steps,
      youtubeUrl: youtubeUrl || null
    },
    include: {
      muscleGroup: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

const updateExercise = async (id, payload) => {
  const { name, muscleGroupId, description, steps, youtubeUrl } = payload;
  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (muscleGroupId !== undefined) updateData.muscleGroupId = Number.parseInt(muscleGroupId, 10);
  if (description !== undefined) updateData.description = description;
  if (steps !== undefined) {
    if (!Array.isArray(steps) || steps.length === 0) {
      throw createHttpError(400, 'Steps must be a non-empty array');
    }
    updateData.steps = steps;
  }
  if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;

  return prisma.exercise.update({
    where: { id: Number.parseInt(id, 10) },
    data: updateData,
    include: {
      muscleGroup: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

const removeExercise = async (id) => {
  await prisma.exercise.delete({
    where: { id: Number.parseInt(id, 10) }
  });

  return {
    success: true,
    message: 'Exercise deleted successfully'
  };
};

module.exports = {
  listExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  removeExercise
};
