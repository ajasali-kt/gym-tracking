# Phase 6: Integration & Testing

## Status: In Progress

## Overview
This phase connects the frontend React application with the backend Express API and performs comprehensive end-to-end testing.

---

## Current Configuration

### Backend
- **Port:** 5001
- **Base URL:** http://localhost:5001
- **API URL:** http://localhost:5001/api
- **Status:** Running ✅

### Frontend
- **Port:** 5174
- **Base URL:** http://localhost:5174
- **API Connection:** http://localhost:5001/api
- **Status:** Running ✅

### Database
- **Database Name:** gym-tracker-db01
- **Host:** localhost
- **Port:** 5432
- **User:** postgres
- **Status:** Connected ✅

---

## Integration Testing Checklist

### 1. API Connection Tests

#### Test Backend Health
```bash
curl http://localhost:5001/health
# Expected: {"status":"ok","message":"Gym Tracker API is running"}
```

#### Test Muscle Groups Endpoint
```bash
curl http://localhost:5001/api/muscle-groups
# Expected: Array of 6 muscle groups with exercise counts
```

#### Test Exercises Endpoint
```bash
curl http://localhost:5001/api/exercises
# Expected: Array of 29+ exercises with muscle group details
```

---

### 2. Frontend Component Tests

#### Dashboard Page (/)
- [ ] Page loads without errors
- [ ] Shows "Today's Workout" section
- [ ] Displays muscle group for the day
- [ ] Shows list of exercises
- [ ] Each exercise shows: name, sets, reps, rest time
- [ ] "Start Workout" button is visible and clickable
- [ ] If no active plan exists, shows appropriate message

#### Exercise Library Page (/exercises)
- [ ] Page loads all exercises from API
- [ ] Exercises are grouped by muscle group
- [ ] Each exercise card shows:
  - Exercise name
  - Muscle group
  - Description
  - Number of instruction steps
- [ ] Click on exercise opens detail modal
- [ ] Detail modal shows:
  - Full description
  - Step-by-step instructions
  - YouTube video embed (if URL exists)
  - Close button works
- [ ] Filter by muscle group works
- [ ] Search functionality works (if implemented)

#### Workout Plans Page (/plans)
- [ ] Page loads without errors
- [ ] Shows "Create New Plan" button
- [ ] Lists all existing plans
- [ ] Active plan is clearly marked
- [ ] Can view plan details
- [ ] Plan details show all 7 days
- [ ] Each day shows assigned exercises
- [ ] Can edit exercises for each day
- [ ] Can delete a plan
- [ ] Can activate/deactivate plans

#### Workout Logging Page (/log/:dayId)
- [ ] Page loads with today's workout
- [ ] Shows all exercises for the day
- [ ] Each exercise has input fields for:
  - Set number
  - Reps completed
  - Weight (kg)
  - Notes
- [ ] Can add multiple sets per exercise
- [ ] "Complete Workout" button works
- [ ] Data is saved to database
- [ ] Redirects to progress/summary after completion

#### Progress Page (/progress)
- [ ] Page loads workout history
- [ ] Shows calendar or list of past workouts
- [ ] Can filter by date range
- [ ] Can select specific exercise to view progression
- [ ] Chart displays weight/rep progression over time
- [ ] Can view details of past workout logs

---

### 3. End-to-End User Workflows

#### Workflow 1: Create and Activate Workout Plan
```
1. Navigate to /plans
2. Click "Create New Plan"
3. Enter plan name: "Strength Training Week 1"
4. Set start date: Today's date
5. Submit form
6. Verify plan is created and active
7. Add exercises to Day 1 (Monday - Chest):
   - Barbell Bench Press: 4 sets, 8-10 reps, 90s rest
   - Incline Dumbbell Press: 3 sets, 10-12 reps, 60s rest
   - Cable Flyes: 3 sets, 12-15 reps, 45s rest
8. Add exercises to Day 2 (Tuesday - Back):
   - Barbell Rows: 4 sets, 8-10 reps, 90s rest
   - Pull-ups: 3 sets, 8-12 reps, 60s rest
   - Face Pulls: 3 sets, 15-20 reps, 45s rest
9. Continue for all 7 days
10. Verify plan is complete
```

**Expected Result:**
- Plan created successfully
- Shows as active plan
- Dashboard displays Day 1 workout
- All exercises saved correctly

---

#### Workflow 2: Log a Workout Session
```
1. Navigate to Dashboard (/)
2. View today's workout
3. Click "Start Workout"
4. Navigate to /log/:dayId
5. Log first exercise (Barbell Bench Press):
   Set 1: 10 reps, 60kg
   Set 2: 9 reps, 60kg
   Set 3: 8 reps, 60kg
   Set 4: 8 reps, 60kg
6. Log second exercise (Incline Dumbbell Press):
   Set 1: 12 reps, 20kg
   Set 2: 11 reps, 20kg
   Set 3: 10 reps, 20kg
7. Continue for all exercises
8. Add workout notes: "Felt strong today!"
9. Click "Complete Workout"
10. Verify redirect to progress page
```

**Expected Result:**
- All sets logged to database
- Workout marked as complete
- Data visible in progress tracking
- Can view workout details later

---

#### Workflow 3: Track Exercise Progress
```
1. Navigate to /progress
2. Select "Exercise Progress" tab
3. Choose exercise: "Barbell Bench Press"
4. View progression chart
5. Verify chart shows:
   - X-axis: Date
   - Y-axis: Weight (kg)
   - Data points for each workout session
   - Trend line showing progression
6. View table of all logged sets
7. Check personal record (PR) is highlighted
```

**Expected Result:**
- Chart renders correctly
- Data is accurate
- Shows progression over time
- PRs are identifiable

---

### 4. API Integration Tests

#### Test: Create Workout Plan via API
```bash
curl -X POST http://localhost:5001/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Plan",
    "startDate": "2026-01-15",
    "endDate": null
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "Test Plan",
  "startDate": "2026-01-15T00:00:00.000Z",
  "endDate": null,
  "isActive": true,
  "createdAt": "2026-01-15T..."
}
```

---

#### Test: Add Day to Plan
```bash
curl -X POST http://localhost:5001/api/plans/1/days \
  -H "Content-Type: application/json" \
  -d '{
    "dayNumber": 1,
    "dayName": "Chest Day",
    "muscleGroupId": 1
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "planId": 1,
  "dayNumber": 1,
  "dayName": "Chest Day",
  "muscleGroupId": 1,
  "createdAt": "2026-01-15T..."
}
```

---

#### Test: Add Exercise to Day
```bash
curl -X POST http://localhost:5001/api/days/1/exercises \
  -H "Content-Type: application/json" \
  -d '{
    "exerciseId": 1,
    "sets": 4,
    "reps": "8-10",
    "restSeconds": 90,
    "orderIndex": 1
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "workoutDayId": 1,
  "exerciseId": 1,
  "sets": 4,
  "reps": "8-10",
  "restSeconds": 90,
  "orderIndex": 1,
  "exercise": {
    "name": "Barbell Bench Press",
    "muscleGroup": { "name": "Chest" }
  }
}
```

---

#### Test: Get Today's Workout
```bash
curl http://localhost:5001/api/dashboard/today
```

**Expected Response:**
```json
{
  "id": 1,
  "dayNumber": 1,
  "dayName": "Chest Day",
  "muscleGroup": { "id": 1, "name": "Chest" },
  "exercises": [
    {
      "exercise": {
        "id": 1,
        "name": "Barbell Bench Press",
        "description": "...",
        "muscleGroup": { "name": "Chest" }
      },
      "sets": 4,
      "reps": "8-10",
      "restSeconds": 90
    }
  ]
}
```

---

#### Test: Start Workout Log
```bash
curl -X POST http://localhost:5001/api/logs/start \
  -H "Content-Type: application/json" \
  -d '{
    "workoutDayId": 1,
    "completedDate": "2026-01-15"
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "workoutDayId": 1,
  "completedDate": "2026-01-15T00:00:00.000Z",
  "notes": null,
  "createdAt": "2026-01-15T..."
}
```

---

#### Test: Log Exercise Set
```bash
curl -X POST http://localhost:5001/api/logs/1/sets \
  -H "Content-Type: application/json" \
  -d '{
    "exerciseId": 1,
    "setNumber": 1,
    "repsCompleted": 10,
    "weightKg": 60,
    "notes": "Felt strong"
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "workoutLogId": 1,
  "exerciseId": 1,
  "setNumber": 1,
  "repsCompleted": 10,
  "weightKg": 60,
  "notes": "Felt strong",
  "createdAt": "2026-01-15T..."
}
```

---

### 5. Browser Console Checks

Open browser console (F12) and verify:

#### No Console Errors
- [ ] No 404 errors for API calls
- [ ] No CORS errors
- [ ] No JavaScript runtime errors
- [ ] No React warnings

#### Network Tab
- [ ] API calls return 200 OK status
- [ ] Response times are reasonable (< 500ms)
- [ ] Data format matches expected structure
- [ ] No failed requests

#### React DevTools
- [ ] Component hierarchy is correct
- [ ] State updates properly
- [ ] No unnecessary re-renders
- [ ] Props are passed correctly

---

### 6. Database Verification

#### Check Data in Prisma Studio
```bash
cd backend
npx prisma studio
```

**Verify Tables:**
- [ ] muscle_groups: 6 records
- [ ] exercises: 29+ records
- [ ] workout_plans: 1+ active plan
- [ ] workout_days: 7 records per plan
- [ ] workout_day_exercises: Multiple records
- [ ] workout_logs: Records after logging workouts
- [ ] exercise_logs: Set records per workout

---

### 7. Mobile Responsiveness Tests

#### Test on Different Screen Sizes
- [ ] Desktop (1920x1080): Layout is clean and spacious
- [ ] Laptop (1366x768): All elements fit properly
- [ ] Tablet (768x1024): Touch-friendly buttons
- [ ] Mobile (375x667): Single column layout, readable text

#### Test Interactions
- [ ] Navigation menu works on mobile
- [ ] Forms are easy to fill on touch screens
- [ ] Buttons are large enough to tap
- [ ] No horizontal scrolling
- [ ] Text is readable without zooming

---

### 8. Performance Tests

#### Page Load Times
- [ ] Dashboard loads in < 2 seconds
- [ ] Exercise library loads in < 3 seconds
- [ ] Workout logging page loads in < 2 seconds
- [ ] Progress charts render in < 3 seconds

#### API Response Times
- [ ] GET requests: < 200ms
- [ ] POST requests: < 500ms
- [ ] Complex queries: < 1 second

---

## Known Issues and Fixes

### Issue 1: Port Conflicts
**Problem:** Backend running on port 5001 instead of 5000
**Solution:** Updated frontend .env to use correct port
**Status:** ✅ Fixed

### Issue 2: Frontend port conflict
**Problem:** Frontend running on 5174 instead of 5173
**Solution:** Vite automatically selected next available port
**Status:** ✅ No action needed

---

## Next Steps

1. ✅ Connect frontend to backend (COMPLETED)
2. 🔄 Perform end-to-end testing (IN PROGRESS)
3. ⏳ Create sample workout plan with exercises (PENDING)
4. ⏳ Test logging workflow (PENDING)
5. ⏳ Verify progress tracking and charts (PENDING)

---

## Test Results Summary

### Test Session: [DATE TO BE FILLED]

| Feature | Status | Notes |
|---------|--------|-------|
| API Connection | ✅ | Backend responding correctly |
| Muscle Groups API | ✅ | 6 groups loaded |
| Exercises API | ✅ | 29 exercises loaded |
| Dashboard Page | ⏳ | To be tested |
| Exercise Library | ⏳ | To be tested |
| Workout Plans | ⏳ | To be tested |
| Workout Logging | ⏳ | To be tested |
| Progress Tracking | ⏳ | To be tested |
| Mobile Responsive | ⏳ | To be tested |
| Performance | ⏳ | To be tested |

---

## Screenshots Location

Save screenshots of successful tests in: `/tests/screenshots/`

- `dashboard-view.png`
- `exercise-library.png`
- `workout-plan-creation.png`
- `workout-logging.png`
- `progress-chart.png`
- `mobile-view.png`

---

## Automated Test Script

Create a test script to automate API testing:

```javascript
// tests/integration-tests.js
const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('Starting Integration Tests...\n');

  try {
    // Test 1: Health Check
    console.log('Test 1: Health Check');
    const health = await axios.get('http://localhost:5001/health');
    console.log('✅ Health:', health.data);

    // Test 2: Muscle Groups
    console.log('\nTest 2: Muscle Groups');
    const muscleGroups = await axios.get(`${API_URL}/muscle-groups`);
    console.log(`✅ Found ${muscleGroups.data.length} muscle groups`);

    // Test 3: Exercises
    console.log('\nTest 3: Exercises');
    const exercises = await axios.get(`${API_URL}/exercises`);
    console.log(`✅ Found ${exercises.data.length} exercises`);

    // Test 4: Create Plan
    console.log('\nTest 4: Create Workout Plan');
    const plan = await axios.post(`${API_URL}/plans`, {
      name: 'Test Integration Plan',
      startDate: new Date().toISOString().split('T')[0],
      endDate: null
    });
    console.log('✅ Plan created:', plan.data.id);

    // Test 5: Add Day to Plan
    console.log('\nTest 5: Add Day to Plan');
    const day = await axios.post(`${API_URL}/plans/${plan.data.id}/days`, {
      dayNumber: 1,
      dayName: 'Test Day',
      muscleGroupId: 1
    });
    console.log('✅ Day added:', day.data.id);

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

runTests();
```

**Run with:**
```bash
node tests/integration-tests.js
```

---

## Completion Criteria

Phase 6 is complete when:
- [x] Frontend successfully connects to backend
- [ ] All pages load without errors
- [ ] Can create and manage workout plans
- [ ] Can log workouts and sets
- [ ] Progress tracking displays data correctly
- [ ] Mobile responsive design works
- [ ] No console errors or warnings
- [ ] Database contains sample data
- [ ] All API endpoints tested
- [ ] Documentation is complete

---

**Last Updated:** 2026-01-15
**Phase Status:** In Progress
**Next Phase:** Phase 7 - Documentation
