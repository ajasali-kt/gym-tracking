const prisma = require('../prismaClient');
const { createHttpError } = require('../utils/http');

const assertAssignmentOwnership = async (assignmentId, userId) => {
  const parsedAssignmentId = Number.parseInt(assignmentId, 10);
  const existingAssignment = await prisma.workoutDayExercise.findFirst({
    where: {
      id: parsedAssignmentId,
      workoutDay: {
        plan: {
          userId
        }
      }
    }
  });

  if (!existingAssignment) {
    throw createHttpError(404, 'Exercise assignment not found');
  }

  return parsedAssignmentId;
};

const deleteDayExerciseAssignment = async (assignmentId, userId) => {
  const parsedAssignmentId = await assertAssignmentOwnership(assignmentId, userId);
  await prisma.workoutDayExercise.delete({
    where: {
      id: parsedAssignmentId
    }
  });

  return {
    success: true,
    message: 'Exercise removed from workout day'
  };
};

const updateDayExerciseAssignment = async (assignmentId, userId, payload) => {
  const parsedAssignmentId = await assertAssignmentOwnership(assignmentId, userId);
  const { sets, reps, restSeconds, orderIndex } = payload;
  const updateData = {};

  if (sets !== undefined) updateData.sets = Number.parseInt(sets, 10);
  if (reps !== undefined) updateData.reps = reps.toString();
  if (restSeconds !== undefined) updateData.restSeconds = Number.parseInt(restSeconds, 10);
  if (orderIndex !== undefined) updateData.orderIndex = Number.parseInt(orderIndex, 10);

  return prisma.workoutDayExercise.update({
    where: { id: parsedAssignmentId },
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

module.exports = {
  deleteDayExerciseAssignment,
  updateDayExerciseAssignment
};
