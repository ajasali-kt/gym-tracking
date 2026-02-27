const prisma = require('../prismaClient');
const { createHttpError } = require('../utils/http');

const INDIA_TIME_ZONE = 'Asia/Kolkata';
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const getDatePartsInTimeZone = (date, timeZone = INDIA_TIME_ZONE) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = formatter.formatToParts(date);
  const year = Number.parseInt(parts.find((part) => part.type === 'year')?.value, 10);
  const month = Number.parseInt(parts.find((part) => part.type === 'month')?.value, 10);
  const day = Number.parseInt(parts.find((part) => part.type === 'day')?.value, 10);

  return { year, month, day };
};

const toUtcMidnightTimestamp = ({ year, month, day }) => Date.UTC(year, month - 1, day);

const getCurrentDayNumber = (planStartDate) => {
  const todayParts = getDatePartsInTimeZone(new Date());
  const startParts = getDatePartsInTimeZone(new Date(planStartDate));

  const diffTime = toUtcMidnightTimestamp(todayParts) - toUtcMidnightTimestamp(startParts);
  const diffDays = Math.floor(diffTime / ONE_DAY_IN_MS);

  return diffDays + 1;
};

const getTodayWorkoutWithLog = async (userId) => {
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

  const currentDayNumber = getCurrentDayNumber(activePlan.startDate);

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

const getWeekSchedule = async (userId) => {
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
    currentDay: getCurrentDayNumber(activePlan.startDate),
    numberOfDays,
    schedule
  };
};

module.exports = {
  getTodayWorkoutWithLog,
  getDashboardSummary,
  getWeekSchedule
};
