-- ============================================================================
-- MANUAL DATABASE BACKUP SCRIPT
-- ============================================================================
-- This script exports all data from your Render database to SQL INSERT statements
-- that you can run on your local database
--
-- HOW TO USE IN pgAdmin:
-- 1. Connect to your RENDER database in pgAdmin
-- 2. Open Query Tool (Tools > Query Tool)
-- 3. Run each SELECT statement below
-- 4. Copy the results
-- 5. Use the generated INSERT statements in your LOCAL database
-- ============================================================================

-- ============================================================================
-- STEP 1: BACKUP MUSCLE GROUPS
-- ============================================================================
-- Run this query on RENDER database and save results
SELECT
    'INSERT INTO muscle_groups (id, name, description, created_at) VALUES (' ||
    id || ', ' ||
    '''' || name || '''' || ', ' ||
    COALESCE('''' || description || '''', 'NULL') || ', ' ||
    '''' || created_at || '''' ||
    ');' as sql_statement
FROM muscle_groups
ORDER BY id;

-- ============================================================================
-- STEP 2: BACKUP EXERCISES
-- ============================================================================
-- Run this query on RENDER database and save results
SELECT
    'INSERT INTO exercises (id, name, muscle_group_id, description, steps, youtube_url, created_at) VALUES (' ||
    id || ', ' ||
    '''' || REPLACE(name, '''', '''''') || '''' || ', ' ||
    muscle_group_id || ', ' ||
    '''' || REPLACE(description, '''', '''''') || '''' || ', ' ||
    '''' || steps::text || '''::json' || ', ' ||
    COALESCE('''' || youtube_url || '''', 'NULL') || ', ' ||
    '''' || created_at || '''' ||
    ');' as sql_statement
FROM exercises
ORDER BY id;

-- ============================================================================
-- STEP 3: BACKUP WORKOUT PLANS
-- ============================================================================
-- Run this query on RENDER database and save results
SELECT
    'INSERT INTO workout_plans (id, name, start_date, end_date, is_active, duration, training_type, split, notes, created_at) VALUES (' ||
    id || ', ' ||
    '''' || REPLACE(name, '''', '''''') || '''' || ', ' ||
    '''' || start_date || '''' || ', ' ||
    COALESCE('''' || end_date || '''', 'NULL') || ', ' ||
    is_active || ', ' ||
    COALESCE('''' || duration || '''', 'NULL') || ', ' ||
    COALESCE('''' || training_type || '''', 'NULL') || ', ' ||
    COALESCE('''' || split || '''', 'NULL') || ', ' ||
    COALESCE('''' || REPLACE(notes, '''', '''''') || '''', 'NULL') || ', ' ||
    '''' || created_at || '''' ||
    ');' as sql_statement
FROM workout_plans
ORDER BY id;

-- ============================================================================
-- STEP 4: BACKUP WORKOUT DAYS
-- ============================================================================
-- Run this query on RENDER database and save results
SELECT
    'INSERT INTO workout_days (id, plan_id, day_number, day_name, muscle_group_id, created_at) VALUES (' ||
    id || ', ' ||
    plan_id || ', ' ||
    day_number || ', ' ||
    '''' || REPLACE(day_name, '''', '''''') || '''' || ', ' ||
    COALESCE(muscle_group_id::text, 'NULL') || ', ' ||
    '''' || created_at || '''' ||
    ');' as sql_statement
FROM workout_days
ORDER BY id;

-- ============================================================================
-- STEP 5: BACKUP WORKOUT DAY EXERCISES
-- ============================================================================
-- Run this query on RENDER database and save results
SELECT
    'INSERT INTO workout_day_exercises (id, workout_day_id, exercise_id, sets, reps, rest_seconds, order_index, created_at) VALUES (' ||
    id || ', ' ||
    workout_day_id || ', ' ||
    exercise_id || ', ' ||
    sets || ', ' ||
    '''' || reps || '''' || ', ' ||
    rest_seconds || ', ' ||
    order_index || ', ' ||
    '''' || created_at || '''' ||
    ');' as sql_statement
FROM workout_day_exercises
ORDER BY id;

-- ============================================================================
-- STEP 6: BACKUP WORKOUT LOGS
-- ============================================================================
-- Run this query on RENDER database and save results
SELECT
    'INSERT INTO workout_logs (id, workout_day_id, workout_name, completed_date, notes, is_manual, created_at) VALUES (' ||
    id || ', ' ||
    COALESCE(workout_day_id::text, 'NULL') || ', ' ||
    COALESCE('''' || REPLACE(workout_name, '''', '''''') || '''', 'NULL') || ', ' ||
    '''' || completed_date || '''' || ', ' ||
    COALESCE('''' || REPLACE(notes, '''', '''''') || '''', 'NULL') || ', ' ||
    is_manual || ', ' ||
    '''' || created_at || '''' ||
    ');' as sql_statement
FROM workout_logs
ORDER BY id;

-- ============================================================================
-- STEP 7: BACKUP EXERCISE LOGS
-- ============================================================================
-- Run this query on RENDER database and save results
SELECT
    'INSERT INTO exercise_logs (id, workout_log_id, exercise_id, set_number, reps_completed, weight_kg, notes, created_at) VALUES (' ||
    id || ', ' ||
    workout_log_id || ', ' ||
    exercise_id || ', ' ||
    set_number || ', ' ||
    reps_completed || ', ' ||
    weight_kg || ', ' ||
    COALESCE('''' || REPLACE(notes, '''', '''''') || '''', 'NULL') || ', ' ||
    '''' || created_at || '''' ||
    ');' as sql_statement
FROM exercise_logs
ORDER BY id;

-- ============================================================================
-- STATISTICS QUERY
-- ============================================================================
-- Run this to see how much data you're backing up
SELECT
    'muscle_groups' as table_name,
    COUNT(*) as record_count
FROM muscle_groups
UNION ALL
SELECT 'exercises', COUNT(*) FROM exercises
UNION ALL
SELECT 'workout_plans', COUNT(*) FROM workout_plans
UNION ALL
SELECT 'workout_days', COUNT(*) FROM workout_days
UNION ALL
SELECT 'workout_day_exercises', COUNT(*) FROM workout_day_exercises
UNION ALL
SELECT 'workout_logs', COUNT(*) FROM workout_logs
UNION ALL
SELECT 'exercise_logs', COUNT(*) FROM exercise_logs
ORDER BY table_name;
