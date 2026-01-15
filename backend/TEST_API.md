# API Testing Guide

## Prerequisites
Before testing, ensure:
1. PostgreSQL is installed and running
2. Database `gym-tracker-db01` is created
3. Prisma migrations have been run
4. Database has been seeded

## Database Setup Commands

```bash
# 1. Create database (run in PostgreSQL)
createdb -U postgres gym-tracker-db01

# OR using psql
psql -U postgres
CREATE DATABASE "gym-tracker-db01";
\q

# 2. Run migrations
cd backend
npx prisma migrate dev --name init

# 3. Seed database
npx prisma db seed

# 4. Start server
npm run dev
```

## API Endpoint Tests

### 1. Health Check
```bash
curl http://localhost:5000/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "message": "Gym Tracker API is running"
}
```

---

### 2. Muscle Groups

#### Get All Muscle Groups
```bash
curl http://localhost:5000/api/muscle-groups
```

#### Get Single Muscle Group
```bash
curl http://localhost:5000/api/muscle-groups/1
```

#### Get Exercises by Muscle Group
```bash
curl http://localhost:5000/api/muscle-groups/1/exercises
```

---

### 3. Exercises

#### Get All Exercises
```bash
curl http://localhost:5000/api/exercises
```

#### Get Exercises by Muscle Group (Query Parameter)
```bash
curl "http://localhost:5000/api/exercises?muscleGroupId=1"
```

#### Get Single Exercise
```bash
curl http://localhost:5000/api/exercises/1
```

#### Create New Exercise
```bash
curl -X POST http://localhost:5000/api/exercises \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Exercise",
    "muscleGroupId": 1,
    "description": "Test description",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "youtubeUrl": "https://www.youtube.com/watch?v=test"
  }'
```

#### Update Exercise
```bash
curl -X PUT http://localhost:5000/api/exercises/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Exercise Name"
  }'
```

#### Delete Exercise
```bash
curl -X DELETE http://localhost:5000/api/exercises/31
```

---

### 4. Workout Plans

#### Get All Plans
```bash
curl http://localhost:5000/api/plans
```

#### Get Active Plan
```bash
curl http://localhost:5000/api/plans/active
```

#### Get Specific Plan
```bash
curl http://localhost:5000/api/plans/1
```

#### Create New Plan
```bash
curl -X POST http://localhost:5000/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Workout Plan",
    "startDate": "2025-01-15",
    "endDate": null
  }'
```

#### Add Day to Plan
```bash
curl -X POST http://localhost:5000/api/plans/1/days \
  -H "Content-Type: application/json" \
  -d '{
    "dayNumber": 1,
    "dayName": "Chest Day",
    "muscleGroupId": 1
  }'
```

#### Add Exercise to Day
```bash
curl -X POST http://localhost:5000/api/plans/days/1/exercises \
  -H "Content-Type: application/json" \
  -d '{
    "exerciseId": 1,
    "sets": 4,
    "reps": "8-12",
    "restSeconds": 90,
    "orderIndex": 1
  }'
```

#### Activate a Plan
```bash
curl -X PUT http://localhost:5000/api/plans/1/activate
```

#### Delete Plan
```bash
curl -X DELETE http://localhost:5000/api/plans/1
```

---

### 5. Dashboard

#### Get Today's Workout
```bash
curl http://localhost:5000/api/dashboard/today
```

#### Get Dashboard Summary
```bash
curl http://localhost:5000/api/dashboard/summary
```

#### Get Week Schedule
```bash
curl http://localhost:5000/api/dashboard/week
```

---

### 6. Workout Logging

#### Start Workout
```bash
curl -X POST http://localhost:5000/api/logs/start \
  -H "Content-Type: application/json" \
  -d '{
    "workoutDayId": 1,
    "completedDate": "2025-01-15"
  }'
```

#### Get Workout Log
```bash
curl http://localhost:5000/api/logs/1
```

#### Log a Set
```bash
curl -X POST http://localhost:5000/api/logs/1/sets \
  -H "Content-Type: application/json" \
  -d '{
    "exerciseId": 1,
    "setNumber": 1,
    "repsCompleted": 10,
    "weightKg": 60.5,
    "notes": "Felt strong today"
  }'
```

#### Complete Workout
```bash
curl -X PUT http://localhost:5000/api/logs/1/complete \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Great workout!"
  }'
```

#### Update a Set
```bash
curl -X PUT http://localhost:5000/api/logs/sets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "repsCompleted": 12,
    "weightKg": 62.5
  }'
```

#### Delete a Set
```bash
curl -X DELETE http://localhost:5000/api/logs/sets/1
```

#### Delete Workout Log
```bash
curl -X DELETE http://localhost:5000/api/logs/1
```

---

### 7. Progress Tracking

#### Get Workout History
```bash
# All history
curl http://localhost:5000/api/progress/history

# With date range
curl "http://localhost:5000/api/progress/history?startDate=2025-01-01&endDate=2025-01-31"

# With limit
curl "http://localhost:5000/api/progress/history?limit=10"
```

#### Get Recent Workouts
```bash
curl http://localhost:5000/api/progress/recent

# With custom limit
curl "http://localhost:5000/api/progress/recent?limit=5"
```

#### Get Exercise Progress
```bash
curl http://localhost:5000/api/progress/exercise/1

# With limit
curl "http://localhost:5000/api/progress/exercise/1?limit=20"
```

#### Get Personal Records
```bash
curl http://localhost:5000/api/progress/exercise/1/personal-record
```

#### Get Overall Stats
```bash
curl http://localhost:5000/api/progress/stats
```

---

## Complete Workflow Test

Here's a complete workflow to test the entire system:

```bash
# 1. Create a workout plan
PLAN=$(curl -s -X POST http://localhost:5000/api/plans \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Plan", "startDate": "2025-01-15"}')
PLAN_ID=$(echo $PLAN | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

# 2. Add a day to the plan
DAY=$(curl -s -X POST http://localhost:5000/api/plans/$PLAN_ID/days \
  -H "Content-Type: application/json" \
  -d '{"dayNumber": 1, "dayName": "Chest Day", "muscleGroupId": 1}')
DAY_ID=$(echo $DAY | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

# 3. Add exercises to the day
curl -X POST http://localhost:5000/api/plans/days/$DAY_ID/exercises \
  -H "Content-Type: application/json" \
  -d '{"exerciseId": 1, "sets": 4, "reps": "8-12", "restSeconds": 90, "orderIndex": 1}'

# 4. View today's workout
curl http://localhost:5000/api/dashboard/today

# 5. Start a workout
LOG=$(curl -s -X POST http://localhost:5000/api/logs/start \
  -H "Content-Type: application/json" \
  -d "{\"workoutDayId\": $DAY_ID}")
LOG_ID=$(echo $LOG | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

# 6. Log some sets
curl -X POST http://localhost:5000/api/logs/$LOG_ID/sets \
  -H "Content-Type: application/json" \
  -d '{"exerciseId": 1, "setNumber": 1, "repsCompleted": 10, "weightKg": 60}'

curl -X POST http://localhost:5000/api/logs/$LOG_ID/sets \
  -H "Content-Type: application/json" \
  -d '{"exerciseId": 1, "setNumber": 2, "repsCompleted": 9, "weightKg": 60}'

# 7. Complete the workout
curl -X PUT http://localhost:5000/api/logs/$LOG_ID/complete \
  -H "Content-Type: application/json" \
  -d '{"notes": "Great workout!"}'

# 8. View progress
curl http://localhost:5000/api/progress/stats
curl http://localhost:5000/api/progress/exercise/1
```

---

## Error Testing

### 404 Errors
```bash
# Non-existent route
curl http://localhost:5000/api/nonexistent

# Non-existent resource
curl http://localhost:5000/api/exercises/99999
```

### 400 Errors
```bash
# Missing required fields
curl -X POST http://localhost:5000/api/exercises \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'

# Invalid data
curl -X POST http://localhost:5000/api/plans/1/days \
  -H "Content-Type: application/json" \
  -d '{"dayNumber": 10, "dayName": "Invalid Day"}'
```

---

## Notes

- The server must be running on port 5000
- All POST/PUT requests require `Content-Type: application/json` header
- IDs are auto-incremented integers
- Dates should be in ISO 8601 format (YYYY-MM-DD)
- The API uses RESTful conventions
- Deletes cascade according to the database schema

---

## Status Codes

- **200** - Success (GET, PUT)
- **201** - Created (POST)
- **400** - Bad Request (validation error)
- **404** - Not Found
- **500** - Internal Server Error
