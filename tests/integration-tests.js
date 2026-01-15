const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let passedTests = 0;
let failedTests = 0;
let createdPlanId = null;
let createdDayId = null;
let createdWorkoutLogId = null;

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
  passedTests++;
}

function logError(message, error) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
  if (error) {
    console.log(`${colors.red}   Error: ${error}${colors.reset}`);
  }
  failedTests++;
}

function logInfo(message) {
  console.log(`${colors.cyan}ℹ ${message}${colors.reset}`);
}

function logHeader(message) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${message}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

async function runTests() {
  console.log(`\n${colors.cyan}╔${'═'.repeat(58)}╗${colors.reset}`);
  console.log(`${colors.cyan}║${' '.repeat(10)}GYM TRACKER - Integration Tests${' '.repeat(16)}║${colors.reset}`);
  console.log(`${colors.cyan}╚${'═'.repeat(58)}╝${colors.reset}\n`);

  try {
    // Test 1: Health Check
    logHeader('Test 1: Health Check');
    try {
      const health = await axios.get('http://localhost:5001/health');
      if (health.data.status === 'ok') {
        logSuccess(`Server is healthy: ${health.data.message}`);
      } else {
        logError('Health check returned unexpected status');
      }
    } catch (error) {
      logError('Health check failed', error.message);
    }

    // Test 2: Muscle Groups
    logHeader('Test 2: Muscle Groups API');
    try {
      const muscleGroups = await axios.get(`${API_URL}/muscle-groups`);
      if (muscleGroups.data && muscleGroups.data.length > 0) {
        logSuccess(`Found ${muscleGroups.data.length} muscle groups`);
        logInfo(`Muscle groups: ${muscleGroups.data.map(mg => mg.name).join(', ')}`);
      } else {
        logError('No muscle groups found');
      }
    } catch (error) {
      logError('Muscle groups API failed', error.message);
    }

    // Test 3: Exercises
    logHeader('Test 3: Exercises API');
    try {
      const exercises = await axios.get(`${API_URL}/exercises`);
      if (exercises.data && exercises.data.length > 0) {
        logSuccess(`Found ${exercises.data.length} exercises`);
        const byMuscle = exercises.data.reduce((acc, ex) => {
          const muscle = ex.muscleGroup?.name || 'Unknown';
          acc[muscle] = (acc[muscle] || 0) + 1;
          return acc;
        }, {});
        logInfo(`Distribution: ${JSON.stringify(byMuscle, null, 2)}`);
      } else {
        logError('No exercises found');
      }
    } catch (error) {
      logError('Exercises API failed', error.message);
    }

    // Test 4: Get Single Exercise
    logHeader('Test 4: Get Single Exercise');
    try {
      const exercise = await axios.get(`${API_URL}/exercises/1`);
      if (exercise.data && exercise.data.name) {
        logSuccess(`Retrieved exercise: ${exercise.data.name}`);
        logInfo(`Muscle: ${exercise.data.muscleGroup?.name}`);
        logInfo(`Steps: ${exercise.data.steps?.length || 0} instructions`);
      } else {
        logError('Exercise data incomplete');
      }
    } catch (error) {
      logError('Get single exercise failed', error.message);
    }

    // Test 5: Create Workout Plan
    logHeader('Test 5: Create Workout Plan');
    try {
      const today = new Date().toISOString().split('T')[0];
      const plan = await axios.post(`${API_URL}/plans`, {
        name: `Integration Test Plan - ${new Date().toLocaleString()}`,
        startDate: today,
        endDate: null
      });

      if (plan.data && plan.data.id) {
        createdPlanId = plan.data.id;
        logSuccess(`Plan created with ID: ${createdPlanId}`);
        logInfo(`Plan name: ${plan.data.name}`);
        logInfo(`Is active: ${plan.data.isActive}`);
      } else {
        logError('Plan creation returned incomplete data');
      }
    } catch (error) {
      logError('Create workout plan failed', error.message);
      if (error.response?.data) {
        logInfo(`Response: ${JSON.stringify(error.response.data)}`);
      }
    }

    // Test 6: Add Day to Plan
    if (createdPlanId) {
      logHeader('Test 6: Add Day to Plan');
      try {
        const day = await axios.post(`${API_URL}/plans/${createdPlanId}/days`, {
          dayNumber: 1,
          dayName: 'Chest Day - Test',
          muscleGroupId: 1
        });

        if (day.data && day.data.id) {
          createdDayId = day.data.id;
          logSuccess(`Day created with ID: ${createdDayId}`);
          logInfo(`Day: ${day.data.dayName} (Day ${day.data.dayNumber})`);
        } else {
          logError('Day creation returned incomplete data');
        }
      } catch (error) {
        logError('Add day to plan failed', error.message);
        if (error.response?.data) {
          logInfo(`Response: ${JSON.stringify(error.response.data)}`);
        }
      }
    } else {
      logError('Skipping day creation - no plan ID available');
    }

    // Test 7: Add Exercise to Day
    if (createdDayId) {
      logHeader('Test 7: Add Exercise to Day');
      try {
        const assignment = await axios.post(`${API_URL}/plans/days/${createdDayId}/exercises`, {
          exerciseId: 1,
          sets: 4,
          reps: '8-10',
          restSeconds: 90,
          orderIndex: 1
        });

        if (assignment.data && assignment.data.id) {
          logSuccess(`Exercise assigned with ID: ${assignment.data.id}`);
          logInfo(`Exercise: ${assignment.data.exercise?.name || 'Unknown'}`);
          logInfo(`Sets: ${assignment.data.sets}, Reps: ${assignment.data.reps}`);
        } else {
          logError('Exercise assignment returned incomplete data');
        }
      } catch (error) {
        logError('Add exercise to day failed', error.message);
        if (error.response?.data) {
          logInfo(`Response: ${JSON.stringify(error.response.data)}`);
        }
      }
    } else {
      logError('Skipping exercise assignment - no day ID available');
    }

    // Test 8: Get Active Plan
    logHeader('Test 8: Get Active Workout Plan');
    try {
      const activePlan = await axios.get(`${API_URL}/plans/active`);
      if (activePlan.data) {
        logSuccess(`Active plan retrieved: ${activePlan.data.name}`);
        logInfo(`Days in plan: ${activePlan.data.workoutDays?.length || 0}`);
      } else {
        logError('No active plan found');
      }
    } catch (error) {
      logError('Get active plan failed', error.message);
    }

    // Test 9: Get Today's Workout
    logHeader('Test 9: Get Today\'s Workout');
    try {
      const todayWorkout = await axios.get(`${API_URL}/dashboard/today`);
      if (todayWorkout.data) {
        logSuccess('Today\'s workout retrieved');
        logInfo(`Day: ${todayWorkout.data.dayName || 'Unknown'}`);
        logInfo(`Exercises: ${todayWorkout.data.workoutDayExercises?.length || 0}`);
      } else {
        logInfo('No workout scheduled for today (this is OK if no active plan)');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        logInfo('No workout for today (expected if no active plan)');
      } else {
        logError('Get today\'s workout failed', error.message);
      }
    }

    // Test 10: Start Workout Log
    if (createdDayId) {
      logHeader('Test 10: Start Workout Log');
      try {
        const today = new Date().toISOString().split('T')[0];
        const workoutLog = await axios.post(`${API_URL}/logs/start`, {
          workoutDayId: createdDayId,
          completedDate: today
        });

        if (workoutLog.data && workoutLog.data.id) {
          createdWorkoutLogId = workoutLog.data.id;
          logSuccess(`Workout log started with ID: ${createdWorkoutLogId}`);
          logInfo(`Date: ${workoutLog.data.completedDate}`);
        } else {
          logError('Workout log creation returned incomplete data');
        }
      } catch (error) {
        logError('Start workout log failed', error.message);
        if (error.response?.data) {
          logInfo(`Response: ${JSON.stringify(error.response.data)}`);
        }
      }
    } else {
      logError('Skipping workout log - no day ID available');
    }

    // Test 11: Log Exercise Set
    if (createdWorkoutLogId) {
      logHeader('Test 11: Log Exercise Set');
      try {
        const setLog = await axios.post(`${API_URL}/logs/${createdWorkoutLogId}/sets`, {
          exerciseId: 1,
          setNumber: 1,
          repsCompleted: 10,
          weightKg: 60.0,
          notes: 'Test set - felt good'
        });

        if (setLog.data && setLog.data.id) {
          logSuccess(`Exercise set logged with ID: ${setLog.data.id}`);
          logInfo(`Set ${setLog.data.setNumber}: ${setLog.data.repsCompleted} reps @ ${setLog.data.weightKg}kg`);
        } else {
          logError('Set logging returned incomplete data');
        }
      } catch (error) {
        logError('Log exercise set failed', error.message);
        if (error.response?.data) {
          logInfo(`Response: ${JSON.stringify(error.response.data)}`);
        }
      }
    } else {
      logError('Skipping set logging - no workout log ID available');
    }

    // Test 12: Get Workout History
    logHeader('Test 12: Get Workout History');
    try {
      const history = await axios.get(`${API_URL}/progress/history?limit=10`);
      if (history.data) {
        logSuccess(`Retrieved workout history: ${history.data.length} workouts`);
      } else {
        logInfo('No workout history found (expected for new database)');
      }
    } catch (error) {
      logError('Get workout history failed', error.message);
    }

    // Test 13: Get Exercise Progress
    logHeader('Test 13: Get Exercise Progress');
    try {
      const progress = await axios.get(`${API_URL}/progress/exercise/1?limit=10`);
      if (progress.data) {
        logSuccess(`Retrieved exercise progress: ${progress.data.length} entries`);
      } else {
        logInfo('No exercise progress found (expected for new database)');
      }
    } catch (error) {
      logError('Get exercise progress failed', error.message);
    }

    // Print Summary
    logHeader('TEST SUMMARY');
    const total = passedTests + failedTests;
    const passRate = total > 0 ? ((passedTests / total) * 100).toFixed(1) : 0;

    console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
    console.log(`Total: ${total}`);
    console.log(`Pass Rate: ${passRate}%\n`);

    if (failedTests === 0) {
      console.log(`${colors.green}🎉 All tests passed! Integration successful!${colors.reset}\n`);
    } else {
      console.log(`${colors.yellow}⚠️  Some tests failed. Please review the errors above.${colors.reset}\n`);
    }

    // Cleanup info
    if (createdPlanId) {
      console.log(`${colors.yellow}Note: Test plan created with ID ${createdPlanId}${colors.reset}`);
      console.log(`${colors.yellow}You may want to delete this test plan from the database.${colors.reset}\n`);
    }

  } catch (error) {
    console.error(`${colors.red}Critical error during test execution:${colors.reset}`, error.message);
  }
}

// Run tests
runTests().catch(console.error);
