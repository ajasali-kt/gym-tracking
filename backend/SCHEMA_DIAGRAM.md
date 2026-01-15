# Database Schema Diagram

## Visual Relationships

```
┌─────────────────────┐
│  muscle_groups      │
│─────────────────────│
│ id (PK)             │
│ name                │◄──┐
│ description         │   │
│ created_at          │   │
└─────────────────────┘   │
         ▲                │
         │                │
         │ (FK)           │ (FK)
         │                │
┌─────────────────────┐   │         ┌──────────────────────┐
│  exercises          │   │         │  workout_days        │
│─────────────────────│   │         │──────────────────────│
│ id (PK)             │   │         │ id (PK)              │
│ name                │   │         │ plan_id (FK)         │
│ muscle_group_id ────┼───┘         │ day_number (1-7)     │
│ description         │             │ day_name             │
│ steps (JSON)        │◄─────┐      │ muscle_group_id ─────┼───┘
│ youtube_url         │      │      │ created_at           │
│ created_at          │      │      └──────────────────────┘
└─────────────────────┘      │               ▲
         ▲                   │               │
         │                   │               │ (FK)
         │                   │               │
         │ (FK)              │ (FK)  ┌───────────────────────┐
         │                   │       │  workout_plans        │
         │                   │       │───────────────────────│
┌─────────────────────────┐  │       │ id (PK)               │
│  workout_day_exercises  │  │       │ name                  │
│─────────────────────────│  │       │ start_date            │
│ id (PK)                 │  │       │ end_date              │
│ workout_day_id (FK) ────┼──┘       │ is_active (boolean)   │
│ exercise_id (FK) ───────┼──┐       │ created_at            │
│ sets                    │  │       └───────────────────────┘
│ reps                    │  │
│ rest_seconds            │  │
│ order_index             │  │
│ created_at              │  │
└─────────────────────────┘  │
                             │
         ┌───────────────────┘
         │
         │ (FK)
         ▼
┌─────────────────────┐           ┌──────────────────────┐
│  exercise_logs      │           │  workout_logs        │
│─────────────────────│           │──────────────────────│
│ id (PK)             │           │ id (PK)              │
│ workout_log_id (FK) │◄──────────│ workout_day_id (FK)  │
│ exercise_id (FK) ───┼───────────┼─► (to workout_days)  │
│ set_number          │           │ completed_date       │
│ reps_completed      │           │ notes                │
│ weight_kg           │           │ created_at           │
│ notes               │           └──────────────────────┘
│ created_at          │
└─────────────────────┘
```

## Table Descriptions

### Core Reference Tables

#### muscle_groups
Master table of muscle categories
- **Purpose**: Categorize exercises and workout days
- **Examples**: Chest, Back, Legs, Shoulders, Arms, Core
- **Relations**:
  - One muscle group → Many exercises
  - One muscle group → Many workout days

#### exercises
Complete exercise library
- **Purpose**: Store exercise details, instructions, and media
- **Key Fields**:
  - `steps`: JSON array of instruction steps
  - `youtube_url`: Link to demonstration video
- **Relations**:
  - Belongs to one muscle group
  - Can be in many workout day exercises
  - Can be logged many times

### Workout Planning Tables

#### workout_plans
Weekly workout schedules
- **Purpose**: Organize training into structured plans
- **Key Fields**:
  - `is_active`: Only one plan can be active
  - `start_date`: When plan begins
- **Relations**:
  - One plan → Many workout days (Day 1-7)

#### workout_days
Individual days within a plan
- **Purpose**: Define what to train each day
- **Key Fields**:
  - `day_number`: 1-7 (Monday-Sunday)
  - `day_name`: Custom name like "Chest Day"
- **Relations**:
  - Belongs to one workout plan
  - Has many workout day exercises
  - Can be logged multiple times

#### workout_day_exercises
Exercises assigned to specific days
- **Purpose**: Define sets/reps/rest for each exercise
- **Key Fields**:
  - `sets`: Number of sets
  - `reps`: Target reps (can be range like "8-12")
  - `rest_seconds`: Rest time between sets
  - `order_index`: Exercise order in the day
- **Relations**:
  - Belongs to one workout day
  - References one exercise

### Logging Tables

#### workout_logs
Records of completed workouts
- **Purpose**: Track when workouts were done
- **Key Fields**:
  - `completed_date`: Date of workout
  - `notes`: Optional workout notes
- **Relations**:
  - Belongs to one workout day
  - Has many exercise logs

#### exercise_logs
Detailed performance tracking
- **Purpose**: Record each set performed
- **Key Fields**:
  - `set_number`: Which set (1, 2, 3...)
  - `reps_completed`: Actual reps done
  - `weight_kg`: Weight used
- **Relations**:
  - Belongs to one workout log
  - References one exercise

## Data Flow Example

### Creating a Workout Plan

```
1. Create workout_plan
   ↓
2. Create workout_days (Day 1-7)
   ↓
3. Add workout_day_exercises for each day
   (references exercises from library)
   ↓
4. Plan is ready to use!
```

### Logging a Workout

```
1. User starts workout for Day 3
   ↓
2. Create workout_log (links to workout_day)
   ↓
3. For each exercise in the day:
   - User performs sets
   - Create exercise_log for each set
     (records reps_completed, weight_kg)
   ↓
4. Mark workout_log as complete
```

### Viewing Progress

```
Query exercise_logs:
- Filter by exercise_id
- Order by created_at
- See weight/reps progression over time
```

## Indexes

For optimal query performance:

- `exercises.muscle_group_id` - Fast filtering by muscle
- `workout_plans.is_active` - Quickly find active plan
- `workout_days.plan_id` - Fast plan detail queries
- `workout_day_exercises.workout_day_id` - Fast day exercise lookups
- `workout_logs.completed_date` - Fast date range queries
- `exercise_logs.workout_log_id` - Fast workout detail queries
- `exercise_logs.exercise_id` - Fast exercise progress queries

## Cascade Delete Rules

When parent is deleted:
- Delete `workout_plan` → Cascades to all `workout_days` → Cascades to all `workout_day_exercises`
- Delete `muscle_group` → Cascades to all `exercises`
- Delete `workout_day` → Cascades to all `workout_logs` and `exercise_logs`

This ensures referential integrity and prevents orphaned records.
