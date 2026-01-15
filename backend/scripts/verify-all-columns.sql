-- ============================================================================
-- VERIFY ALL TABLE COLUMNS
-- ============================================================================
-- Run this script on your RENDER database to see ALL actual column names
-- This will help us ensure the backup script is 100% accurate
-- ============================================================================

-- TABLE 1: muscle_groups
SELECT
    'muscle_groups' as table_name,
    column_name,
    data_type,
    ordinal_position as position
FROM information_schema.columns
WHERE table_name = 'muscle_groups'
ORDER BY ordinal_position;

-- TABLE 2: exercises
SELECT
    'exercises' as table_name,
    column_name,
    data_type,
    ordinal_position as position
FROM information_schema.columns
WHERE table_name = 'exercises'
ORDER BY ordinal_position;

-- TABLE 3: workout_plans
SELECT
    'workout_plans' as table_name,
    column_name,
    data_type,
    ordinal_position as position
FROM information_schema.columns
WHERE table_name = 'workout_plans'
ORDER BY ordinal_position;

-- TABLE 4: workout_days
SELECT
    'workout_days' as table_name,
    column_name,
    data_type,
    ordinal_position as position
FROM information_schema.columns
WHERE table_name = 'workout_days'
ORDER BY ordinal_position;

-- TABLE 5: workout_day_exercises
SELECT
    'workout_day_exercises' as table_name,
    column_name,
    data_type,
    ordinal_position as position
FROM information_schema.columns
WHERE table_name = 'workout_day_exercises'
ORDER BY ordinal_position;

-- TABLE 6: workout_logs
SELECT
    'workout_logs' as table_name,
    column_name,
    data_type,
    ordinal_position as position
FROM information_schema.columns
WHERE table_name = 'workout_logs'
ORDER BY ordinal_position;

-- TABLE 7: exercise_logs
SELECT
    'exercise_logs' as table_name,
    column_name,
    data_type,
    ordinal_position as position
FROM information_schema.columns
WHERE table_name = 'exercise_logs'
ORDER BY ordinal_position;

-- TABLE 8: _prisma_migrations
SELECT
    '_prisma_migrations' as table_name,
    column_name,
    data_type,
    ordinal_position as position
FROM information_schema.columns
WHERE table_name = '_prisma_migrations'
ORDER BY ordinal_position;

-- ============================================================================
-- ALL TABLES SUMMARY
-- ============================================================================
SELECT
    table_name,
    COUNT(*) as column_count,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as all_columns
FROM information_schema.columns
WHERE table_name IN (
    'muscle_groups',
    'exercises',
    'workout_plans',
    'workout_days',
    'workout_day_exercises',
    'workout_logs',
    'exercise_logs',
    '_prisma_migrations'
)
GROUP BY table_name
ORDER BY table_name;
