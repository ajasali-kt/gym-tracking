const prisma = require('../prismaClient');
const { createHttpError } = require('../utils/http');

const parseDate = (value, fieldName) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `Invalid ${fieldName}`);
  }
  return date;
};

const parsePositiveNumber = (value, fieldName) => {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw createHttpError(400, `${fieldName} must be a positive number`);
  }
  return parsed;
};

const getBodyMeasurements = async (userId, query = {}) => {
  const where = { userId };
  const measuredDate = {};

  if (query.startDate) {
    measuredDate.gte = parseDate(query.startDate, 'startDate');
  }

  if (query.endDate) {
    measuredDate.lte = parseDate(query.endDate, 'endDate');
  }

  if (Object.keys(measuredDate).length > 0) {
    where.measuredDate = measuredDate;
  }

  const limit = Math.min(Number.parseInt(query.limit, 10) || 100, 500);

  return prisma.bodyMeasurement.findMany({
    where,
    orderBy: { measuredDate: 'desc' },
    take: limit
  });
};

const saveBodyMeasurement = async (userId, payload) => {
  const measuredDate = parseDate(payload.measuredDate, 'measuredDate');
  if (!measuredDate) {
    throw createHttpError(400, 'measuredDate is required');
  }

  const weightKg = parsePositiveNumber(payload.weightKg, 'weightKg');
  const heightCm = parsePositiveNumber(payload.heightCm, 'heightCm');
  const notes = payload.notes?.trim() || null;

  return prisma.bodyMeasurement.upsert({
    where: {
      userId_measuredDate: {
        userId,
        measuredDate
      }
    },
    update: {
      weightKg,
      heightCm,
      notes
    },
    create: {
      userId,
      measuredDate,
      weightKg,
      heightCm,
      notes
    }
  });
};

const updateBodyMeasurement = async (userId, id, payload) => {
  const measurementId = Number.parseInt(id, 10);
  if (!Number.isFinite(measurementId)) {
    throw createHttpError(400, 'Invalid measurement id');
  }

  const existing = await prisma.bodyMeasurement.findFirst({
    where: { id: measurementId, userId }
  });

  if (!existing) {
    throw createHttpError(404, 'Body measurement not found');
  }

  const data = {};

  if (payload.measuredDate !== undefined) {
    data.measuredDate = parseDate(payload.measuredDate, 'measuredDate');
  }

  if (payload.weightKg !== undefined) {
    data.weightKg = parsePositiveNumber(payload.weightKg, 'weightKg');
  }

  if (payload.heightCm !== undefined) {
    data.heightCm = parsePositiveNumber(payload.heightCm, 'heightCm');
  }

  if (payload.notes !== undefined) {
    data.notes = payload.notes?.trim() || null;
  }

  try {
    return await prisma.bodyMeasurement.update({
      where: { id: measurementId },
      data
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw createHttpError(400, 'A body measurement already exists for this date');
    }
    throw error;
  }
};

const deleteBodyMeasurement = async (userId, id) => {
  const measurementId = Number.parseInt(id, 10);
  if (!Number.isFinite(measurementId)) {
    throw createHttpError(400, 'Invalid measurement id');
  }

  const existing = await prisma.bodyMeasurement.findFirst({
    where: { id: measurementId, userId }
  });

  if (!existing) {
    throw createHttpError(404, 'Body measurement not found');
  }

  await prisma.bodyMeasurement.delete({
    where: { id: measurementId }
  });

  return {
    success: true,
    message: 'Body measurement deleted successfully'
  };
};

module.exports = {
  getBodyMeasurements,
  saveBodyMeasurement,
  updateBodyMeasurement,
  deleteBodyMeasurement
};
