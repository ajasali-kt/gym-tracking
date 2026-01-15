const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

/**
 * Helper function to get current day number based on the plan's start date
 * Calculates which day of the plan we're currently on
 */
const getCurrentDayNumber = (planStartDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(planStartDate);
  startDate.setHours(0, 0, 0, 0);

  // Calculate the difference in days
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Day number is the difference + 1 (so day 1 is the start date)
  return diffDays + 1;
};


/**
 * GET /api/dashboard/today-with-log
 * Get today's workout combined with existing workout log (if any)
 * This consolidated endpoint eliminates the need for 3 separate API calls
 */
router.get('/today-with-log', async (req, res, next) => {
  try {
    // First get the active plan to know the start date
    const activePlan = await prisma.workoutPlan.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true
      }
    });

    if (!activePlan) {
      return res.json({
        message: 'No active workout plan found',
        dayNumber: null,
        workoutDay: null,
        workoutLog: null,
        activePlanName: null
      });
    }

    const currentDayNumber = getCurrentDayNumber(activePlan.startDate);

    // Get active plan's workout for today
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
      return res.json({
        message: 'No workout scheduled for today',
        dayNumber: currentDayNumber,
        workoutDay: null,
        workoutLog: null,
        activePlanName: activePlan.name
      });
    }

    // Check for existing workout log for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const workoutLog = await prisma.workoutLog.findFirst({
      where: {
        workoutDayId: todayWorkout.id,
        completedDate: today
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

    res.json({
      dayNumber: currentDayNumber,
      activePlanName: todayWorkout.plan.name,
      workoutDay: todayWorkout,
      workoutLog: workoutLog || null
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/summary
 * Get workout statistics and summary
 */
router.get('/summary', async (req, res, next) => {
  try {
    // Total workouts logged
    const totalWorkouts = await prisma.workoutLog.count();

    // Workouts this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const workoutsThisWeek = await prisma.workoutLog.count({
      where: {
        completedDate: {
          gte: startOfWeek
        }
      }
    });

    // Workouts this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const workoutsThisMonth = await prisma.workoutLog.count({
      where: {
        completedDate: {
          gte: startOfMonth
        }
      }
    });

    // Recent workouts (last 5)
    const recentWorkouts = await prisma.workoutLog.findMany({
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

    // Active plan info
    const activePlan = await prisma.workoutPlan.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        startDate: true,
        _count: {
          select: { workoutDays: true }
        }
      }
    });

    res.json({
      statistics: {
        totalWorkouts,
        workoutsThisWeek,
        workoutsThisMonth
      },
      recentWorkouts,
      activePlan
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/week
 * Get the full workout schedule for active plan based on date range
 */
router.get('/week', async (req, res, next) => {
  try {
    const activePlan = await prisma.workoutPlan.findFirst({
      where: { isActive: true },
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
      return res.status(404).json({
        error: true,
        message: 'No active workout plan found',
        statusCode: 404
      });
    }

    // Calculate number of days in the plan
    const startDate = new Date(activePlan.startDate);
    startDate.setHours(0, 0, 0, 0);

    let numberOfDays = 7; // Default to 7 days if no end date
    if (activePlan.endDate) {
      const endDate = new Date(activePlan.endDate);
      endDate.setHours(0, 0, 0, 0);
      const diffTime = endDate.getTime() - startDate.getTime();
      numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      numberOfDays = numberOfDays > 0 ? numberOfDays : 7;
    }

    // Create array for all plan days
    const schedule = [];
    for (let i = 1; i <= numberOfDays; i++) {
      const workoutDay = activePlan.workoutDays.find(d => d.dayNumber === i);
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + (i - 1));

      schedule.push({
        dayNumber: i,
        date: dayDate,
        workout: workoutDay || null
      });
    }

    res.json({
      plan: {
        id: activePlan.id,
        name: activePlan.name,
        startDate: activePlan.startDate,
        endDate: activePlan.endDate
      },
      currentDay: getCurrentDayNumber(activePlan.startDate),
      numberOfDays: numberOfDays,
      schedule: schedule
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
