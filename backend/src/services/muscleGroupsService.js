const prisma = require('../prismaClient');
const { createHttpError } = require('../utils/http');

const listMuscleGroups = async () => {
  return prisma.muscleGroup.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { exercises: true }
      }
    }
  });
};

const getMuscleGroupById = async (id) => {
  const muscleGroup = await prisma.muscleGroup.findUnique({
    where: { id: Number.parseInt(id, 10) },
    include: {
      _count: {
        select: { exercises: true }
      }
    }
  });

  if (!muscleGroup) {
    throw createHttpError(404, 'Muscle group not found');
  }

  return muscleGroup;
};

const listExercisesByMuscleGroupId = async (id) => {
  const parsedId = Number.parseInt(id, 10);
  const muscleGroup = await prisma.muscleGroup.findUnique({
    where: { id: parsedId }
  });

  if (!muscleGroup) {
    throw createHttpError(404, 'Muscle group not found');
  }

  return prisma.exercise.findMany({
    where: { muscleGroupId: parsedId },
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

module.exports = {
  listMuscleGroups,
  getMuscleGroupById,
  listExercisesByMuscleGroupId
};
