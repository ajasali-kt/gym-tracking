const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m'
};

function log(message, color = 'cyan') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function createSamplePlan() {
  console.log(`\n${colors.cyan}╔${'═'.repeat(58)}╗${colors.reset}`);
  console.log(`${colors.cyan}║${' '.repeat(8)}Creating Sample 7-Day Workout Plan${' '.repeat(15)}║${colors.reset}`);
  console.log(`${colors.cyan}╚${'═'.repeat(58)}╝${colors.reset}\n`);

  try {
    // Step 1: Create the workout plan
    log('\n📋 Step 1: Creating Workout Plan...', 'blue');
    const plan = await axios.post(`${API_URL}/plans`, {
      name: 'Beginner Strength Training',
      startDate: new Date().toISOString().split('T')[0],
      endDate: null
    });
    log(`✅ Plan created: "${plan.data.name}" (ID: ${plan.data.id})`, 'green');

    const planId = plan.data.id;

    // Step 2: Define the 7-day workout split
    const workoutDays = [
      { dayNumber: 1, dayName: 'Chest & Triceps', muscleGroupId: 1 }, // Chest
      { dayNumber: 2, dayName: 'Back & Biceps', muscleGroupId: 2 },   // Back
      { dayNumber: 3, dayName: 'Legs', muscleGroupId: 4 },             // Legs
      { dayNumber: 4, dayName: 'Shoulders', muscleGroupId: 6 },        // Shoulders
      { dayNumber: 5, dayName: 'Core & Cardio', muscleGroupId: 3 },    // Core
      { dayNumber: 6, dayName: 'Full Body', muscleGroupId: 1 },        // Mixed
      { dayNumber: 7, dayName: 'Rest Day', muscleGroupId: null }        // Rest
    ];

    // Step 3: Create each day
    log('\n📅 Step 2: Creating 7 Days...', 'blue');
    const createdDays = [];
    for (const day of workoutDays) {
      const workoutDay = await axios.post(`${API_URL}/plans/${planId}/days`, day);
      createdDays.push(workoutDay.data);
      log(`  ✅ Day ${day.dayNumber}: ${day.dayName}`, 'green');
    }

    // Step 4: Add exercises to each day
    log('\n💪 Step 3: Adding Exercises to Each Day...', 'blue');

    // Day 1: Chest & Triceps
    log('\n  Day 1: Chest & Triceps', 'yellow');
    const day1Exercises = [
      { exerciseId: 1, sets: 4, reps: '8-10', restSeconds: 90, orderIndex: 1 },   // Bench Press
      { exerciseId: 2, sets: 3, reps: '10-12', restSeconds: 60, orderIndex: 2 },  // Incline Dumbbell Press
      { exerciseId: 3, sets: 3, reps: '12-15', restSeconds: 45, orderIndex: 3 },  // Cable Flyes
      { exerciseId: 13, sets: 3, reps: '10-12', restSeconds: 60, orderIndex: 4 }, // Tricep Dips
      { exerciseId: 14, sets: 3, reps: '12-15', restSeconds: 45, orderIndex: 5 }  // Tricep Pushdown
    ];
    for (const ex of day1Exercises) {
      await axios.post(`${API_URL}/plans/days/${createdDays[0].id}/exercises`, ex);
    }
    log(`    ✅ Added ${day1Exercises.length} exercises`, 'green');

    // Day 2: Back & Biceps
    log('  Day 2: Back & Biceps', 'yellow');
    const day2Exercises = [
      { exerciseId: 5, sets: 4, reps: '8-10', restSeconds: 90, orderIndex: 1 },   // Deadlift
      { exerciseId: 6, sets: 4, reps: '8-10', restSeconds: 90, orderIndex: 2 },   // Barbell Rows
      { exerciseId: 7, sets: 3, reps: '8-12', restSeconds: 60, orderIndex: 3 },   // Pull-ups
      { exerciseId: 10, sets: 3, reps: '10-12', restSeconds: 60, orderIndex: 4 }, // Barbell Curl
      { exerciseId: 11, sets: 3, reps: '12-15', restSeconds: 45, orderIndex: 5 }  // Hammer Curl
    ];
    for (const ex of day2Exercises) {
      await axios.post(`${API_URL}/plans/days/${createdDays[1].id}/exercises`, ex);
    }
    log(`    ✅ Added ${day2Exercises.length} exercises`, 'green');

    // Day 3: Legs
    log('  Day 3: Legs', 'yellow');
    const day3Exercises = [
      { exerciseId: 15, sets: 4, reps: '8-10', restSeconds: 120, orderIndex: 1 }, // Barbell Squat
      { exerciseId: 16, sets: 3, reps: '10-12', restSeconds: 90, orderIndex: 2 }, // Leg Press
      { exerciseId: 17, sets: 3, reps: '10-12', restSeconds: 60, orderIndex: 3 }, // Romanian Deadlift
      { exerciseId: 18, sets: 3, reps: '12-15', restSeconds: 45, orderIndex: 4 }, // Leg Curl
      { exerciseId: 20, sets: 4, reps: '15-20', restSeconds: 45, orderIndex: 5 }  // Calf Raises
    ];
    for (const ex of day3Exercises) {
      await axios.post(`${API_URL}/plans/days/${createdDays[2].id}/exercises`, ex);
    }
    log(`    ✅ Added ${day3Exercises.length} exercises`, 'green');

    // Day 4: Shoulders
    log('  Day 4: Shoulders', 'yellow');
    const day4Exercises = [
      { exerciseId: 26, sets: 4, reps: '8-10', restSeconds: 90, orderIndex: 1 },  // Overhead Press
      { exerciseId: 27, sets: 3, reps: '10-12', restSeconds: 60, orderIndex: 2 }, // Lateral Raises
      { exerciseId: 28, sets: 3, reps: '12-15', restSeconds: 45, orderIndex: 3 }, // Front Raises
      { exerciseId: 29, sets: 3, reps: '12-15', restSeconds: 45, orderIndex: 4 }  // Face Pulls
    ];
    for (const ex of day4Exercises) {
      await axios.post(`${API_URL}/plans/days/${createdDays[3].id}/exercises`, ex);
    }
    log(`    ✅ Added ${day4Exercises.length} exercises`, 'green');

    // Day 5: Core & Cardio
    log('  Day 5: Core & Cardio', 'yellow');
    const day5Exercises = [
      { exerciseId: 21, sets: 3, reps: '60s', restSeconds: 60, orderIndex: 1 },   // Plank
      { exerciseId: 22, sets: 3, reps: '20', restSeconds: 45, orderIndex: 2 },    // Crunches
      { exerciseId: 23, sets: 3, reps: '15 each', restSeconds: 45, orderIndex: 3 }, // Russian Twists
      { exerciseId: 24, sets: 3, reps: '12-15', restSeconds: 45, orderIndex: 4 }, // Hanging Leg Raises
      { exerciseId: 25, sets: 3, reps: '20 each', restSeconds: 30, orderIndex: 5 } // Mountain Climbers
    ];
    for (const ex of day5Exercises) {
      await axios.post(`${API_URL}/plans/days/${createdDays[4].id}/exercises`, ex);
    }
    log(`    ✅ Added ${day5Exercises.length} exercises`, 'green');

    // Day 6: Full Body
    log('  Day 6: Full Body', 'yellow');
    const day6Exercises = [
      { exerciseId: 1, sets: 3, reps: '10-12', restSeconds: 90, orderIndex: 1 },  // Bench Press
      { exerciseId: 15, sets: 3, reps: '10-12', restSeconds: 90, orderIndex: 2 }, // Squat
      { exerciseId: 6, sets: 3, reps: '10-12', restSeconds: 90, orderIndex: 3 },  // Barbell Rows
      { exerciseId: 26, sets: 3, reps: '10-12', restSeconds: 60, orderIndex: 4 }, // Overhead Press
      { exerciseId: 21, sets: 3, reps: '60s', restSeconds: 60, orderIndex: 5 }    // Plank
    ];
    for (const ex of day6Exercises) {
      await axios.post(`${API_URL}/plans/days/${createdDays[5].id}/exercises`, ex);
    }
    log(`    ✅ Added ${day6Exercises.length} exercises`, 'green');

    // Day 7: Rest Day (no exercises)
    log('  Day 7: Rest Day', 'yellow');
    log('    ✅ No exercises (rest day)', 'green');

    // Summary
    console.log(`\n${colors.green}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.green}🎉 Sample Workout Plan Created Successfully!${colors.reset}`);
    console.log(`${colors.green}${'='.repeat(60)}${colors.reset}\n`);

    log('Plan Details:', 'cyan');
    log(`  Name: ${plan.data.name}`, 'cyan');
    log(`  ID: ${plan.data.id}`, 'cyan');
    log(`  Status: Active`, 'cyan');
    log(`  Start Date: ${plan.data.startDate}`, 'cyan');
    log(`  Total Days: 7`, 'cyan');
    log(`  Total Exercises: 29`, 'cyan');

    log('\nYou can now:', 'yellow');
    log('  1. Open http://localhost:5174 in your browser', 'yellow');
    log('  2. View the Dashboard to see today\'s workout', 'yellow');
    log('  3. Navigate to Workout Plans to see the full 7-day plan', 'yellow');
    log('  4. Start logging workouts and tracking progress', 'yellow');

    console.log('');

  } catch (error) {
    console.error(`\n${colors.red}❌ Error creating sample plan:${colors.reset}`, error.message);
    if (error.response?.data) {
      console.error(`${colors.red}Response:${colors.reset}`, JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the script
createSamplePlan().catch(console.error);
