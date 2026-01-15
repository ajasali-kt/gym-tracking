/**
 * Prisma Seed Script
 * Populates the database with initial data:
 * - 6 Muscle Groups
 * - 30 Popular Exercises with instructions and YouTube links
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================
  // 1. Seed Muscle Groups
  // ============================================
  console.log('📦 Creating/updating muscle groups...');

  const muscleGroups = await Promise.all([
    prisma.muscleGroup.upsert({
      where: { name: 'Chest' },
      update: {},
      create: {
        name: 'Chest',
        description: 'Pectoral muscles - responsible for pushing movements'
      }
    }),
    prisma.muscleGroup.upsert({
      where: { name: 'Back' },
      update: {},
      create: {
        name: 'Back',
        description: 'Latissimus dorsi, rhomboids, traps - responsible for pulling movements'
      }
    }),
    prisma.muscleGroup.upsert({
      where: { name: 'Legs' },
      update: {},
      create: {
        name: 'Legs',
        description: 'Quadriceps, hamstrings, glutes, calves - lower body muscles'
      }
    }),
    prisma.muscleGroup.upsert({
      where: { name: 'Shoulders' },
      update: {},
      create: {
        name: 'Shoulders',
        description: 'Deltoids - responsible for shoulder movement and stability'
      }
    }),
    prisma.muscleGroup.upsert({
      where: { name: 'Arms' },
      update: {},
      create: {
        name: 'Arms',
        description: 'Biceps, triceps, forearms - upper arm muscles'
      }
    }),
    prisma.muscleGroup.upsert({
      where: { name: 'Core' },
      update: {},
      create: {
        name: 'Core',
        description: 'Abdominals, obliques - trunk stability and rotation'
      }
    })
  ]);

  console.log(`✅ Created ${muscleGroups.length} muscle groups`);

  // ============================================
  // 2. Seed Exercises
  // ============================================
  console.log('💪 Creating exercises...');

  const exercises = [
    // CHEST EXERCISES
    {
      name: 'Barbell Bench Press',
      muscleGroupId: muscleGroups[0].id, // Chest
      description: 'The king of chest exercises. Builds overall chest mass and strength.',
      steps: [
        'Lie flat on bench with feet on floor',
        'Grip bar slightly wider than shoulder width',
        'Unrack the bar and position it over your chest',
        'Lower bar to mid-chest with controlled movement',
        'Press bar up powerfully, extending arms fully',
        'Keep shoulder blades retracted throughout'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg'
    },
    {
      name: 'Incline Dumbbell Press',
      muscleGroupId: muscleGroups[0].id,
      description: 'Targets upper chest. Great for developing a full, balanced chest.',
      steps: [
        'Set bench to 30-45 degree incline',
        'Sit with dumbbells on thighs',
        'Kick dumbbells up to shoulder height',
        'Press dumbbells up until arms are extended',
        'Lower with control to starting position',
        'Keep core tight and feet planted'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8'
    },
    {
      name: 'Push-ups',
      muscleGroupId: muscleGroups[0].id,
      description: 'Bodyweight classic. Can be done anywhere, excellent for endurance.',
      steps: [
        'Start in plank position, hands shoulder-width apart',
        'Keep body in straight line from head to heels',
        'Lower chest to ground, elbows at 45 degrees',
        'Push back up to starting position',
        'Engage core throughout movement',
        'Breathe in going down, out going up'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4'
    },
    {
      name: 'Cable Chest Fly',
      muscleGroupId: muscleGroups[0].id,
      description: 'Isolation exercise for chest. Great pump and stretch.',
      steps: [
        'Set cables to chest height',
        'Grab handles and step forward',
        'Slight bend in elbows, chest up',
        'Bring handles together in front of chest',
        'Squeeze chest at peak contraction',
        'Return to starting position with control'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=Iwe6AmxVf7o'
    },
    {
      name: 'Machine Chest Press',
      muscleGroupId: muscleGroups[0].id,
      description: 'Machine-based chest builder. Safer alternative to free weights.',
      steps: [
        'Adjust seat height so handles are at mid-chest',
        'Sit with back flat against pad',
        'Grip handles at chest level',
        'Press handles forward until arms extended',
        'Squeeze chest at peak contraction',
        'Return with control to starting position'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=xUm0BiZCWlQ'
    },

    // BACK EXERCISES
    {
      name: 'Deadlift',
      muscleGroupId: muscleGroups[1].id, // Back
      description: 'The ultimate compound exercise. Builds total body strength.',
      steps: [
        'Stand with feet hip-width, bar over midfoot',
        'Bend down and grip bar just outside legs',
        'Lower hips, chest up, shoulders back',
        'Drive through heels, extend hips and knees',
        'Stand fully erect, shoulders back',
        'Lower bar with control back to ground'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q'
    },
    {
      name: 'Pull-ups',
      muscleGroupId: muscleGroups[1].id,
      description: 'Best bodyweight back exercise. Builds width and strength.',
      steps: [
        'Hang from bar with overhand grip, hands shoulder-width',
        'Engage lats and pull shoulder blades down',
        'Pull yourself up until chin clears bar',
        'Lead with chest, not with chin',
        'Lower yourself with control',
        'Full extension at bottom before next rep'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g'
    },
    {
      name: 'Lat Pulldown',
      muscleGroupId: muscleGroups[1].id,
      description: 'Great alternative to pull-ups. Builds lat width.',
      steps: [
        'Sit at lat pulldown machine, thighs secured',
        'Grip bar wider than shoulder width',
        'Pull bar down to upper chest',
        'Lead with elbows, chest up',
        'Squeeze lats at bottom position',
        'Return to starting position with control'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc'
    },
    {
      name: 'Seated Cable Row',
      muscleGroupId: muscleGroups[1].id,
      description: 'Excellent for mid-back thickness. Constant tension.',
      steps: [
        'Sit at cable row machine, feet on platform',
        'Grab handle with both hands',
        'Pull handle to abdomen, elbows back',
        'Squeeze shoulder blades together',
        'Return with control, feeling the stretch',
        'Keep torso upright throughout'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74'
    },
    {
      name: 'Barbell Row',
      muscleGroupId: muscleGroups[1].id,
      description: 'Builds thick, strong back. Targets mid-back and lats.',
      steps: [
        'Hinge at hips, slight knee bend, back flat',
        'Grip bar slightly wider than shoulder width',
        'Pull bar to lower chest/upper abdomen',
        'Lead with elbows, squeeze shoulder blades',
        'Lower bar with control',
        'Keep core braced throughout'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ'
    },

    // LEG EXERCISES
    {
      name: 'Barbell Squats',
      muscleGroupId: muscleGroups[2].id,
      description: 'The king of leg exercises. Builds overall leg mass.',
      steps: [
        'Position bar on upper back, feet shoulder-width',
        'Brace core, chest up, look forward',
        'Break at knees and hips simultaneously',
        'Descend until thighs parallel or below',
        'Drive through heels to stand',
        'Keep knees tracking over toes'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8'
    },
    {
      name: 'Leg Press',
      muscleGroupId: muscleGroups[2].id,
      description: 'Machine-based leg builder. Safer for heavy loading.',
      steps: [
        'Sit in leg press, feet shoulder-width on platform',
        'Lower safety handles, brace core',
        'Lower platform until knees at 90 degrees',
        'Press through heels to extend legs',
        'Dont lock out knees completely',
        'Control the descent'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ'
    },
    {
      name: 'Walking Lunges',
      muscleGroupId: muscleGroups[2].id,
      description: 'Unilateral leg exercise. Improves balance and coordination.',
      steps: [
        'Stand with feet hip-width apart',
        'Step forward with one leg',
        'Lower hips until both knees at 90 degrees',
        'Push through front heel to step forward',
        'Repeat with opposite leg',
        'Keep torso upright throughout'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=L8fvypPrzzs'
    },
    {
      name: 'Romanian Deadlift',
      muscleGroupId: muscleGroups[2].id,
      description: 'Targets hamstrings and glutes. Excellent posterior chain builder.',
      steps: [
        'Hold bar at hip level with overhand grip',
        'Slight knee bend, push hips back',
        'Lower bar along legs, feeling hamstring stretch',
        'Go until you feel full stretch',
        'Drive hips forward to return to standing',
        'Keep back flat throughout'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=SHsUIZiNdeY'
    },
    {
      name: 'Lying Leg Curl',
      muscleGroupId: muscleGroups[2].id,
      description: 'Isolation exercise for hamstrings.',
      steps: [
        'Lie face down on leg curl machine',
        'Position ankles under pad',
        'Curl legs up towards glutes',
        'Squeeze hamstrings at top',
        'Lower with control',
        'Keep hips pressed to bench'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=ELOCsoDSmrg'
    },
    {
      name: 'Leg Extension',
      muscleGroupId: muscleGroups[2].id,
      description: 'Isolation exercise for quadriceps.',
      steps: [
        'Sit on leg extension machine',
        'Position ankles under pad',
        'Extend legs until fully straightened',
        'Squeeze quadriceps at top',
        'Lower with control',
        'Keep back against pad'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0'
    },
    {
      name: 'Standing Calf Raises',
      muscleGroupId: muscleGroups[2].id,
      description: 'Builds calf size and strength. Standing variation for greater range.',
      steps: [
        'Stand on calf raise machine or edge of step',
        'Position shoulders under pads if using machine',
        'Rise up on toes as high as possible',
        'Hold peak contraction briefly',
        'Lower heels below platform level',
        'Repeat for high reps'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI'
    },

    // SHOULDER EXERCISES
    {
      name: 'Barbell Overhead Press',
      muscleGroupId: muscleGroups[3].id,
      description: 'Best overall shoulder builder. Develops strength and mass.',
      steps: [
        'Stand with feet shoulder-width, bar at shoulders',
        'Brace core, grip slightly wider than shoulders',
        'Press bar overhead until arms extended',
        'Keep bar path vertical',
        'Lower with control to shoulders',
        'Dont lean back excessively'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI'
    },
    {
      name: 'Dumbbell Lateral Raise',
      muscleGroupId: muscleGroups[3].id,
      description: 'Isolation for side delts. Creates width.',
      steps: [
        'Stand with dumbbells at sides',
        'Slight bend in elbows',
        'Raise arms to sides until parallel to floor',
        'Lead with elbows, not hands',
        'Lower with control',
        'Avoid swinging or using momentum'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo'
    },
    {
      name: 'Rear Delt Fly Machine',
      muscleGroupId: muscleGroups[3].id,
      description: 'Isolation for rear deltoids. Machine-based for consistent tension.',
      steps: [
        'Adjust seat so handles are at shoulder height',
        'Sit facing the machine with chest against pad',
        'Grab handles with palms facing each other',
        'Pull handles back in a wide arc',
        'Squeeze shoulder blades together',
        'Return with control'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=T7GXTkOSXLs'
    },
    {
      name: 'Upright Row (Cable)',
      muscleGroupId: muscleGroups[3].id,
      description: 'Targets shoulders and traps. Cable variation for constant tension.',
      steps: [
        'Attach rope or bar to low cable pulley',
        'Stand close to cable machine',
        'Pull cable up along body to chin level',
        'Keep elbows high and wide',
        'Lower with control',
        'Keep bar/rope close to body'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=ZJAPAPj4DkI'
    },
    {
      name: 'Front Raises',
      muscleGroupId: muscleGroups[3].id,
      description: 'Targets front deltoids. Good for shoulder definition.',
      steps: [
        'Stand with dumbbells in front of thighs',
        'Raise one or both dumbbells forward',
        'Lift to shoulder height',
        'Keep slight bend in elbows',
        'Lower with control',
        'Alternate arms or do both together'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=qp9b-nwJs-o'
    },
    {
      name: 'Face Pulls',
      muscleGroupId: muscleGroups[3].id,
      description: 'Targets rear delts and upper back. Great for posture.',
      steps: [
        'Set cable to upper chest height',
        'Grab rope attachment with overhand grip',
        'Pull rope towards face, elbows high',
        'Separate rope ends beside head',
        'Squeeze shoulder blades together',
        'Return with control'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk'
    },

    // ARM EXERCISES
    {
      name: 'Barbell Curl',
      muscleGroupId: muscleGroups[4].id, // Arms
      description: 'Classic bicep builder. Foundation of arm training.',
      steps: [
        'Stand with feet shoulder-width, bar at arms length',
        'Curl bar up, keeping elbows stationary',
        'Squeeze biceps at top',
        'Lower with control',
        'Dont swing or use momentum',
        'Keep back straight'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo'
    },
    {
      name: 'Dumbbell Hammer Curl',
      muscleGroupId: muscleGroups[4].id,
      description: 'Targets brachialis and forearms. Builds arm thickness.',
      steps: [
        'Hold dumbbells with neutral grip (palms facing)',
        'Curl dumbbells up keeping palms facing',
        'Squeeze at top',
        'Lower with control',
        'Keep elbows stationary',
        'Can do alternating or both together'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4'
    },
    {
      name: 'EZ Bar Curl',
      muscleGroupId: muscleGroups[4].id,
      description: 'Bicep exercise using EZ bar. More comfortable on wrists than straight bar.',
      steps: [
        'Stand with feet shoulder-width, hold EZ bar at arms length',
        'Use the angled grips for comfort',
        'Curl bar up, keeping elbows stationary',
        'Squeeze biceps at top',
        'Lower with control',
        'Dont swing or use momentum'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo'
    },
    {
      name: 'Preacher Curl Machine',
      muscleGroupId: muscleGroups[4].id,
      description: 'Isolation for biceps. Machine version of preacher curls.',
      steps: [
        'Sit at preacher curl machine',
        'Position arms on pad with full extension',
        'Grab handles with underhand grip',
        'Curl handles up towards shoulders',
        'Squeeze biceps at top',
        'Lower with control without locking out'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0'
    },
    {
      name: 'Triceps Dips (Assisted if needed)',
      muscleGroupId: muscleGroups[4].id,
      description: 'Compound tricep exercise. Assisted machine option for beginners.',
      steps: [
        'Position hands on parallel bars',
        'Use assisted dip machine if needed for support',
        'Lower body by bending elbows',
        'Go until upper arms parallel to ground',
        'Press back up to starting position',
        'Keep elbows close to body'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=6kALZikXxLc'
    },
    {
      name: 'Triceps Rope Pushdown',
      muscleGroupId: muscleGroups[4].id,
      description: 'Isolation for triceps. Cable exercise for constant tension.',
      steps: [
        'Attach rope to high cable pulley',
        'Grip rope with both hands, elbows at sides',
        'Push rope down by extending elbows',
        'Split rope at bottom and squeeze triceps',
        'Return with control to starting position',
        'Keep elbows stationary throughout'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=vB5OHsJ3EME'
    },
    {
      name: 'Skull Crushers',
      muscleGroupId: muscleGroups[4].id,
      description: 'Isolation for triceps. Also known as lying tricep extensions.',
      steps: [
        'Lie on bench holding bar or dumbbells above chest',
        'Keep upper arms vertical and stationary',
        'Lower weight to forehead by bending elbows',
        'Keep elbows pointing forward, not flaring',
        'Extend arms back to starting position',
        'Control the movement throughout'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=d_KZxkY_0cM'
    },
    {
      name: 'Cable Kickbacks',
      muscleGroupId: muscleGroups[4].id,
      description: 'Isolation for triceps. Great for peak contraction.',
      steps: [
        'Attach handle to low cable pulley',
        'Hinge forward at hips, keep back flat',
        'Start with elbow bent at 90 degrees',
        'Extend arm back fully',
        'Squeeze tricep at full extension',
        'Return with control'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo'
    },
    {
      name: 'Overhead Tricep Extension',
      muscleGroupId: muscleGroups[4].id,
      description: 'Isolation for triceps. Great stretch and contraction.',
      steps: [
        'Hold dumbbell overhead with both hands',
        'Lower dumbbell behind head',
        'Keep elbows pointing forward',
        'Extend arms to raise dumbbell',
        'Squeeze triceps at top',
        'Control the descent'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=YbX7Wd8jQ-Q'
    },
    {
      name: 'Close Grip Bench Press',
      muscleGroupId: muscleGroups[4].id,
      description: 'Compound tricep builder. Also works chest.',
      steps: [
        'Lie on bench, grip bar with hands closer than shoulder width',
        'Lower bar to lower chest',
        'Keep elbows tucked close to body',
        'Press bar up powerfully',
        'Full arm extension at top',
        'Control the descent'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=nEF0bv2FW94'
    },

    // CORE EXERCISES
    {
      name: 'Plank',
      muscleGroupId: muscleGroups[5].id, // Core
      description: 'Isometric core exercise. Builds endurance and stability.',
      steps: [
        'Start in push-up position on forearms',
        'Keep body in straight line',
        'Engage core, squeeze glutes',
        'Hold position for time',
        'Breathe steadily',
        'Dont let hips sag or pike up'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c'
    },
    {
      name: 'Crunches',
      muscleGroupId: muscleGroups[5].id,
      description: 'Classic ab exercise. Targets upper abs.',
      steps: [
        'Lie on back, knees bent, feet flat',
        'Hands behind head or crossed on chest',
        'Lift shoulders off ground',
        'Squeeze abs at top',
        'Lower with control',
        'Dont pull on neck'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU'
    },
    {
      name: 'Hanging Leg Raises',
      muscleGroupId: muscleGroups[5].id,
      description: 'Advanced ab exercise. Targets lower abs and hip flexors.',
      steps: [
        'Hang from pull-up bar',
        'Keep legs straight or slightly bent',
        'Raise legs to parallel or higher',
        'Control the movement',
        'Lower legs with control',
        'Avoid swinging'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=Pr1ieGZ5atk'
    },
    {
      name: 'Russian Twists',
      muscleGroupId: muscleGroups[5].id,
      description: 'Targets obliques. Improves rotational strength.',
      steps: [
        'Sit with knees bent, feet off ground',
        'Lean back slightly, keep back straight',
        'Hold weight at chest',
        'Rotate torso side to side',
        'Touch weight to ground beside hips',
        'Control the movement, dont rush'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI'
    },
    {
      name: 'Dead Bug',
      muscleGroupId: muscleGroups[5].id,
      description: 'Core stability exercise. Trains anti-extension.',
      steps: [
        'Lie on back, arms extended toward ceiling',
        'Knees bent at 90 degrees',
        'Lower opposite arm and leg simultaneously',
        'Keep lower back pressed to floor',
        'Return to starting position',
        'Repeat on other side'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=g_BYB0R-4Ws'
    },
    {
      name: 'Cable Crunch',
      muscleGroupId: muscleGroups[5].id,
      description: 'Cable variation of crunches. Allows for progressive overload.',
      steps: [
        'Kneel in front of cable machine with rope attachment',
        'Hold rope behind head at neck level',
        'Crunch down, bringing elbows to knees',
        'Focus on contracting abs, not pulling with arms',
        'Squeeze at bottom position',
        'Return with control to starting position'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=Qodds6ex7Io'
    },

    // CARDIO / MISCELLANEOUS
    {
      name: 'Treadmill / Stairmaster',
      muscleGroupId: muscleGroups[5].id, // Assigning to Core as a general category
      description: 'Cardio equipment for cardiovascular endurance and calorie burn.',
      steps: [
        'Choose your preferred cardio machine',
        'Start with 5 minute warm-up at easy pace',
        'Gradually increase intensity',
        'Maintain steady state or do intervals',
        'Cool down for last 5 minutes',
        'Stay hydrated throughout'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=FPd3R5gJCHk'
    },
    {
      name: 'Incline Walk',
      muscleGroupId: muscleGroups[2].id, // Legs
      description: 'Low-impact cardio. Great for active recovery and fat burning.',
      steps: [
        'Set treadmill to incline (10-15 degrees)',
        'Walk at moderate pace (3-4 mph)',
        'Maintain upright posture',
        'Swing arms naturally',
        'Continue for 20-30 minutes',
        'Stay hydrated'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=FPd3R5gJCHk'
    },
    {
      name: 'Full Body Stretching',
      muscleGroupId: muscleGroups[5].id,
      description: 'Complete stretching routine for flexibility and recovery.',
      steps: [
        'Start with neck and shoulder rolls',
        'Stretch arms, chest, and back',
        'Hip flexor and hamstring stretches',
        'Quad and calf stretches',
        'Hold each stretch 20-30 seconds',
        'Focus on breathing and relaxation'
      ],
      youtubeUrl: 'https://www.youtube.com/watch?v=g_tea8ZNk5A'
    }
  ];

  // Create all exercises (use upsert to avoid duplicates)
  let createdCount = 0;
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: {
        name: exercise.name
      },
      update: {},
      create: exercise
    });
    createdCount++;
  }

  console.log(`✅ Created/updated ${createdCount} exercises`);

  console.log('🎉 Database seed completed successfully!');
  console.log(`   - ${muscleGroups.length} muscle groups`);
  console.log(`   - ${exercises.length} exercises`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
