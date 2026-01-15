# Workout Plan Import Feature - User Guide

## Overview
I've successfully added a complete workout plan import feature to your Gym Tracking application. This allows you to import comprehensive workout plans from JSON format, similar to how you add YouTube links for exercises.

## What Was Added

### 1. Database Changes
- **New fields in WorkoutPlan table:**
  - `duration` - e.g., "4 Weeks"
  - `trainingType` - e.g., "Gym Only"
  - `split` - e.g., "Body Part Split"
  - `notes` - Stores progression plan notes

### 2. Backend API
- **New endpoint:** `POST /api/plans/import`
- Automatically processes JSON and creates:
  - Complete workout plan
  - All 7 days of the week
  - Exercises matched from your exercise library
  - Sets, reps, and rest times for each exercise
  - Progression notes formatted nicely

### 3. Frontend Features
- **Import button** on the Workout Plans page (green "Import from JSON" button)
- **Import modal** with:
  - JSON text area for pasting workout plan data
  - Example JSON template
  - "Use Example" button to quickly test
  - JSON validation (shows errors if invalid)
  - Optional plan name field
  - Start date selector

- **Enhanced plan details view** showing:
  - Duration, training type, and split info
  - Progression plan notes in a highlighted section

## How to Use

### Step 1: Navigate to Workout Plans
1. Open the app at http://localhost:5173
2. Click on "Workout Plans" in the navigation

### Step 2: Click Import from JSON
1. Click the green "Import from JSON" button
2. A modal will open with an example

### Step 3: Paste Your JSON
You can either:
- Click "Use Example" to test with sample data
- Paste your own JSON (like the one you provided)

### Step 4: Configure and Import
1. Optionally enter a custom plan name (or leave empty for auto-generation)
2. Set the start date
3. Click "Import Plan"

### Step 5: View Your Plan
- The plan will be created as the active plan
- All exercises that match your exercise library will be added
- You can view the complete weekly schedule
- Progression notes are displayed in a yellow highlighted box

## JSON Format

```json
{
  "duration": "4 Weeks",
  "trainingType": "Gym Only",
  "split": "Body Part Split",
  "weeklySchedule": {
    "Day1": {
      "bodyPart": "Chest + Triceps",
      "exercises": [
        {"name": "Barbell Bench Press", "sets": 4, "reps": "6-8"},
        {"name": "Incline Dumbbell Press", "sets": 3, "reps": "8-10"}
      ]
    },
    "Day2": {
      "bodyPart": "Back + Biceps",
      "exercises": [
        {"name": "Lat Pulldown", "sets": 4, "reps": "8-10"}
      ]
    }
    // ... Days 3-7
  },
  "progressionPlan": {
    "Week1": "Use current working weights",
    "Week2": "Increase weight by 2.5kg on main lifts",
    "Week3": "Add 1 extra set to Squat, Bench, OHP",
    "Week4": "Push last set to near failure"
  }
}
```

## Features

### Automatic Exercise Matching
- The system searches your exercise library for matching exercises
- Uses fuzzy matching (case-insensitive, partial matches)
- Only adds exercises that exist in your library
- Skips exercises that aren't found (won't break the import)

### Smart Day Processing
- Automatically extracts primary muscle group from "Chest + Triceps" format
- Maps to existing muscle groups in your database
- Handles rest days and active recovery days
- Sets appropriate day names

### Progression Plan Notes
- Converts progressionPlan object to formatted notes
- Displays in a highlighted yellow box on the plan detail page
- Can be edited later if needed

### Auto-Generated Plan Name
If you don't provide a planName, it generates one like:
- "Body Part Split - 4 Weeks"
- "Upper Lower Split - 6 Weeks"

### End Date Calculation
If duration is provided (e.g., "4 Weeks"), it automatically calculates the end date based on:
- Start date you selected
- Number of weeks in the duration

## Important Notes

1. **Exercise Library Must Match:**
   - The import will only add exercises that exist in your exercise library
   - Make sure exercise names in JSON match (or are close to) names in your library
   - Examples:
     - "Bench Press" will match "Barbell Bench Press"
     - "Lat Pulldown" will match "Lat Pulldown"

2. **Active Plan:**
   - Importing a plan automatically deactivates other plans and sets this as active
   - This is the same behavior as creating a new plan

3. **Rest Days:**
   - Days with no exercises are still created but shown as rest days
   - Day 7 (Sunday) in your example has no exercises, which is fine

4. **Progression Plan is Optional:**
   - You can omit the progressionPlan field if you don't need it
   - It will simply not show the notes section

## Test File Included

I've created a test file at:
`test-workout-plan.json`

This contains your exact example. You can:
1. Open this file
2. Copy the contents
3. Paste into the import modal
4. Click Import

## UI Structure

The feature follows the same pattern as the YouTube link feature for exercises:
- **Main page:** Has an action button (Import from JSON)
- **Modal:** Opens for data entry
- **Validation:** Real-time JSON validation
- **Success:** Closes modal and refreshes the plan list
- **Error handling:** Shows clear error messages

## File Changes Made

### Backend:
1. `backend/prisma/schema.prisma` - Added new fields to WorkoutPlan model
2. `backend/src/routes/workoutPlans.js` - Added import endpoint and updated create endpoint

### Frontend:
1. `frontend/src/services/workoutService.js` - Added importPlan method
2. `frontend/src/components/WorkoutPlan/WorkoutPlanList.jsx` - Added import button and modal
3. `frontend/src/components/WorkoutPlan/WorkoutPlanDetail.jsx` - Enhanced to show new fields and notes

### Database:
- Migration applied: `20260115125754_add_plan_metadata`

## Next Steps

You can now:
1. Import your workout plan using the JSON you provided
2. View all 7 days with exercises
3. See progression notes
4. Edit/delete exercises as needed
5. Log workouts using this plan

Everything works just like the YouTube link feature - clean, simple, and integrated into the existing flow!
