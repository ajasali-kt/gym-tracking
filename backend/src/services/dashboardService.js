const prisma = require('../prismaClient');
const { createHttpError } = require('../utils/http');

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const toDateOnlyString = (dateValue) => {
  if (!dateValue) return null;

  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dateOnlyToUtcTimestamp = (dateString) => {
  const [year, month, day] = dateString.split('-').map((value) => Number.parseInt(value, 10));
  return Date.UTC(year, month - 1, day);
};

const dateOnlyStringToLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map((value) => Number.parseInt(value, 10));
  return new Date(year, month - 1, day);
};

const getCurrentDayNumber = (planStartDate, todayDate) => {
  const startDate = toDateOnlyString(planStartDate);
  const today = toDateOnlyString(todayDate);

  if (!startDate || !today) {
    return 0;
  }

  if (startDate > today) {
    return 0;
  }

  const diffTime = dateOnlyToUtcTimestamp(today) - dateOnlyToUtcTimestamp(startDate);
  const diffDays = Math.floor(diffTime / ONE_DAY_IN_MS);

  return diffDays + 1;
};

const getTodayWorkoutWithLog = async (userId, todayDate) => {
  const activePlan = await prisma.workoutPlan.findFirst({
    where: {
      isActive: true,
      userId
    },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true
    }
  });

  if (!activePlan) {
    return {
      message: 'No active workout plan found',
      dayNumber: null,
      workoutDay: null,
      workoutLog: null,
      activePlanName: null
    };
  }

  const today = dateOnlyStringToLocalDate(todayDate);
  const currentDayNumber = getCurrentDayNumber(activePlan.startDate, today);

  const todayWorkout = await prisma.workoutDay.findFirst({
    where: {
      planId: activePlan.id,
      dayNumber: currentDayNumber
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
      plan: {
        select: {
          id: true,
          name: true,
          startDate: true
        }
      }
    }
  });

  if (!todayWorkout) {
    return {
      message: 'No workout scheduled for today',
      dayNumber: currentDayNumber,
      workoutDay: null,
      workoutLog: null,
      activePlanName: activePlan.name
    };
  }

  const workoutLog = await prisma.workoutLog.findFirst({
    where: {
      workoutDayId: todayWorkout.id,
      completedDate: today,
      userId
    },
    include: {
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
    }
  });

  return {
    dayNumber: currentDayNumber,
    activePlanName: todayWorkout.plan.name,
    workoutDay: todayWorkout,
    workoutLog: workoutLog || null
  };
};

const getDashboardSummary = async (userId) => {
  const totalWorkouts = await prisma.workoutLog.count({
    where: { userId }
  });

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const workoutsThisWeek = await prisma.workoutLog.count({
    where: {
      userId,
      completedDate: {
        gte: startOfWeek
      }
    }
  });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const workoutsThisMonth = await prisma.workoutLog.count({
    where: {
      userId,
      completedDate: {
        gte: startOfMonth
      }
    }
  });

  const recentWorkouts = await prisma.workoutLog.findMany({
    where: { userId },
    take: 5,
    orderBy: { completedDate: 'desc' },
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

  const activePlan = await prisma.workoutPlan.findFirst({
    where: {
      isActive: true,
      userId
    },
    select: {
      id: true,
      name: true,
      startDate: true,
      _count: {
        select: { workoutDays: true }
      }
    }
  });

  return {
    statistics: {
      totalWorkouts,
      workoutsThisWeek,
      workoutsThisMonth
    },
    recentWorkouts,
    activePlan
  };
};

const getWeekSchedule = async (userId, todayDate) => {
  const activePlan = await prisma.workoutPlan.findFirst({
    where: {
      isActive: true,
      userId
    },
    include: {
      workoutDays: {
        include: {
          muscleGroup: true,
          _count: {
            select: { workoutDayExercises: true }
          }
        },
        orderBy: { dayNumber: 'asc' }
      }
    }
  });

  if (!activePlan) {
    throw createHttpError(404, 'No active workout plan found');
  }

  const startDate = new Date(activePlan.startDate);
  startDate.setHours(0, 0, 0, 0);

  let numberOfDays = 7;
  if (activePlan.endDate) {
    const endDate = new Date(activePlan.endDate);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - startDate.getTime();
    numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    numberOfDays = numberOfDays > 0 ? numberOfDays : 7;
  }

  const schedule = [];
  for (let i = 1; i <= numberOfDays; i++) {
    const workoutDay = activePlan.workoutDays.find((day) => day.dayNumber === i);
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + (i - 1));

    schedule.push({
      dayNumber: i,
      date: dayDate,
      workout: workoutDay || null
    });
  }

  return {
    plan: {
      id: activePlan.id,
      name: activePlan.name,
      startDate: activePlan.startDate,
      endDate: activePlan.endDate
    },
    currentDay: getCurrentDayNumber(activePlan.startDate, todayDate),
    numberOfDays,
    schedule
  };
};

module.exports = {
  getTodayWorkoutWithLog,
  getDashboardSummary,
  getWeekSchedule
};
