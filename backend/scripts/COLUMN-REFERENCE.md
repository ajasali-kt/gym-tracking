# Database Column Reference

This document lists the ACTUAL column names in your PostgreSQL database based on the Prisma schema.

## Table 1: muscle_groups

| Prisma Field | Database Column | Notes |
|-------------|-----------------|-------|
| id | id | |
| name | name | |
| description | description | |
| **createdAt** | **"createdAt"** | ⚠️ NO @map - stays camelCase, needs quotes! |

## Table 2: exercises

| Prisma Field | Database Column | Notes |
|-------------|-----------------|-------|
| id | id | |
| name | name | |
| muscleGroupId | muscle_group_id | @map("muscle_group_id") |
| description | description | |
| steps | steps | JSON type |
| youtubeUrl | youtube_url | @map("youtube_url") |
| createdAt | created_at | @map("created_at") |

## Table 3: workout_plans

| Prisma Field | Database Column | Notes |
|-------------|-----------------|-------|
| id | id | |
| name | name | |
| startDate | start_date | @map("start_date") |
| endDate | end_date | @map("end_date") |
| isActive | is_active | @map("is_active") |
| duration | duration | |
| trainingType | training_type | @map("training_type") |
| split | split | |
| notes | notes | |
| createdAt | created_at | @map("created_at") |

## Table 4: workout_days

| Prisma Field | Database Column | Notes |
|-------------|-----------------|-------|
| id | id | |
| planId | plan_id | @map("plan_id") |
| dayNumber | day_number | @map("day_number") |
| dayName | day_name | @map("day_name") |
| muscleGroupId | muscle_group_id | @map("muscle_group_id") |
| createdAt | created_at | @map("created_at") |

## Table 5: workout_day_exercises

| Prisma Field | Database Column | Notes |
|-------------|-----------------|-------|
| id | id | |
| workoutDayId | workout_day_id | @map("workout_day_id") |
| exerciseId | exercise_id | @map("exercise_id") |
| sets | sets | |
| reps | reps | |
| restSeconds | rest_seconds | @map("rest_seconds") |
| orderIndex | order_index | @map("order_index") |
| createdAt | created_at | @map("created_at") |

## Table 6: workout_logs

| Prisma Field | Database Column | Notes |
|-------------|-----------------|-------|
| id | id | |
| workoutDayId | workout_day_id | @map("workout_day_id") |
| workoutName | workout_name | @map("workout_name") |
| completedDate | completed_date | @map("completed_date") |
| notes | notes | |
| isManual | is_manual | @map("is_manual") |
| createdAt | created_at | @map("created_at") |

## Table 7: exercise_logs

| Prisma Field | Database Column | Notes |
|-------------|-----------------|-------|
| id | id | |
| workoutLogId | workout_log_id | @map("workout_log_id") |
| exerciseId | exercise_id | @map("exercise_id") |
| setNumber | set_number | @map("set_number") |
| repsCompleted | reps_completed | @map("reps_completed") |
| weightKg | weight_kg | @map("weight_kg") |
| notes | notes | |
| createdAt | created_at | @map("created_at") |

## Table 8: _prisma_migrations

| Database Column | Type | Notes |
|----------------|------|-------|
| id | varchar(36) | Primary key |
| checksum | varchar(64) | |
| finished_at | timestamp with time zone | |
| migration_name | varchar(255) | |
| logs | text | |
| rolled_back_at | timestamp with time zone | |
| started_at | timestamp with time zone | |
| applied_steps_count | integer | |

## Summary

**Fields WITHOUT @map (use camelCase in DB):**
- muscle_groups.createdAt → `"createdAt"` ⚠️ Must use quotes!
- workout_plans.duration → `duration`
- workout_plans.split → `split`
- workout_plans.notes → `notes`
- workout_logs.notes → `notes`
- exercise_logs.notes → `notes`

**Fields WITH @map (use snake_case in DB):**
- All other mapped fields use snake_case without quotes
