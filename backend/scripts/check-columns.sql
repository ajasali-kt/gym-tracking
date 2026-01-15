-- ============================================================================
-- CHECK ACTUAL DATABASE COLUMN NAMES
-- ============================================================================
-- Run this in pgAdmin to see the exact column names in your database
-- This will help us create the correct backup queries
-- ============================================================================

-- Check muscle_groups columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'muscle_groups'
ORDER BY ordinal_position;

-- Check exercises columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'exercises'
ORDER BY ordinal_position;

-- Check workout_plans columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'workout_plans'
ORDER BY ordinal_position;

-- Check workout_days columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'workout_days'
ORDER BY ordinal_position;

-- Check workout_day_exercises columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'workout_day_exercises'
ORDER BY ordinal_position;

-- Check workout_logs columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'workout_logs'
ORDER BY ordinal_position;

-- Check exercise_logs columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'exercise_logs'
ORDER BY ordinal_position;

-- Check _prisma_migrations columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = '_prisma_migrations'
ORDER BY ordinal_position;
