-- ============================================================================
-- COMPLETE DATABASE BACKUP - ALL TABLES, ALL COLUMNS
-- ============================================================================
-- This script generates INSERT statements for ALL data in your database
-- Run each query separately and save the results
--
-- IMPORTANT: This matches your ACTUAL database columns, not the Prisma schema
-- ============================================================================

-- ============================================================================
-- TABLE 1: muscle_groups
-- Columns: id, name, description, "createdAt"
-- ============================================================================
SELECT
    'INSERT INTO muscle_groups (id, name, description, "createdAt") VALUES (' ||
    id || ', ' ||
    '''' || name || ''', ' ||
    COALESCE('''' || REPLACE(description, '''', '''''') || '''', 'NULL') || ', ' ||
    '''' || "createdAt" || '''' ||
    ');' as sql_statement
FROM muscle_groups
ORDER BY id;


-- ============================================================================
-- TABLE 2: exercises
-- Columns: id, name, muscle_group_id, description, steps, youtube_url, created_at
-- ============================================================================
SELECT
    'INSERT INTO exercises (id, name, muscle_group_id, description, steps, youtube_url, created_at) VALUES (' ||
    id || ', ' ||
    '''' || REPLACE(name, '''', '''''') || ''', ' ||
    muscle_group_id || ', ' ||
    '''' || REPLACE(description, '''', '''''') || ''', ' ||
    quote_literal(REPLACE(steps::text, '""', '"')) || '::json, ' ||
    COALESCE('''' || youtube_url || '''', 'NULL') || ', ' ||
    '''' || created_at || '''' ||
    ');' as sql_statement
FROM exercises
ORDER BY id;


-- ============================================================================
-- TABLE 3: workout_plans
-- Columns: id, name, start_date, end_date, is_active, created_at, duration, notes, split, training_type
-- ============================================================================
SELECT
    'INSERT INTO workout_plans (id, name, start_date, end_date, is_active, created_at, duration, notes, split, training_type) VALUES (' ||
    id || ', ' ||
    '''' || REPLACE(name, '''', '''''') || ''', ' ||
    '''' || start_date || ''', ' ||
    COALESCE('''' || end_date || '''', 'NULL') || ', ' ||
    is_active || ', ' ||
    '''' || created_at || ''', ' ||
    COALESCE('''' || REPLACE(duration, '''', '''''') || '''', 'NULL') || ', ' ||
    COALESCE('''' || REPLACE(notes, '''', '''''') || '''', 'NULL') || ', ' ||
    COALESCE('''' || REPLACE(split, '''', '''''') || '''', 'NULL') || ', ' ||
    COALESCE('''' || REPLACE(training_type, '''', '''''') || '''', 'NULL') ||
    ');' as sql_statement
FROM workout_plans
ORDER BY id;


-- ============================================================================
-- TABLE 4: workout_days
-- Columns: id, plan_id, day_number, day_name, muscle_group_id, created_at
-- ============================================================================
SELECT
    'INSERT INTO workout_days (id, plan_id, day_number, day_name, muscle_group_id, created_at) VALUES (' ||
    id || ', ' ||
    plan_id || ', ' ||
    day_number || ', ' ||
    '''' || REPLACE(day_name, '''', '''''') || ''', ' ||
    COALESCE(muscle_group_id::text, 'NULL') || ', ' ||
    '''' || created_at || '''' ||
    ');' as sql_statement
FROM workout_days
ORDER BY id;


-- ============================================================================
-- TABLE 5: workout_day_exercises
-- Columns: id, workout_day_id, exercise_id, sets, reps, rest_seconds, order_index, created_at
-- ============================================================================
SELECT
    'INSERT INTO workout_day_exercises (id, workout_day_id, exercise_id, sets, reps, rest_seconds, order_index, created_at) VALUES (' ||
    id || ', ' ||
    workout_day_id || ', ' ||
    exercise_id || ', ' ||
    sets || ', ' ||
    '''' || reps || ''', ' ||
    rest_seconds || ', ' ||
    order_index || ', ' ||
    '''' || created_at || '''' ||
    ');' as sql_statement
FROM workout_day_exercises
ORDER BY id;


-- ============================================================================
-- TABLE 6: workout_logs
-- Columns: id, workout_day_id, completed_date, notes, created_at, is_manual, workout_name
-- ============================================================================
SELECT
    'INSERT INTO workout_logs (id, workout_day_id, completed_date, notes, created_at, is_manual, workout_name) VALUES (' ||
    id || ', ' ||
    COALESCE(workout_day_id::text, 'NULL') || ', ' ||
    '''' || completed_date || ''', ' ||
    COALESCE('''' || REPLACE(notes, '''', '''''') || '''', 'NULL') || ', ' ||
    '''' || created_at || ''', ' ||
    is_manual || ', ' ||
    COALESCE('''' || REPLACE(workout_name, '''', '''''') || '''', 'NULL') ||
    ');' as sql_statement
FROM workout_logs
ORDER BY id;


-- ============================================================================
-- TABLE 7: exercise_logs
-- Columns: id, workout_log_id, exercise_id, set_number, reps_completed, weight_kg, notes, created_at
-- ============================================================================
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
-- TABLE 8: _prisma_migrations
-- Columns: id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count
-- ============================================================================
SELECT
    'INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES (' ||
    '''' || id || ''', ' ||
    '''' || checksum || ''', ' ||
    COALESCE('''' || finished_at || '''', 'NULL') || ', ' ||
    '''' || REPLACE(migration_name, '''', '''''') || ''', ' ||
    COALESCE('''' || REPLACE(logs, '''', '''''') || '''', 'NULL') || ', ' ||
    COALESCE('''' || rolled_back_at || '''', 'NULL') || ', ' ||
    '''' || started_at || ''', ' ||
    applied_steps_count ||
    ');' as sql_statement
FROM _prisma_migrations
ORDER BY started_at;


-- ============================================================================
-- VERIFY: Check all table counts
-- ============================================================================
SELECT
    'muscle_groups' as table_name,
    COUNT(*) as total_records
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
UNION ALL
SELECT '_prisma_migrations', COUNT(*) FROM _prisma_migrations
ORDER BY table_name;


-- ============================================================================
-- SAMPLE DATA VIEW: See what your data looks like
-- ============================================================================

-- Sample muscle groups
SELECT 'MUSCLE GROUPS' as table_name, id, name, LEFT(description, 50) as description_preview, "createdAt"
FROM muscle_groups
ORDER BY id
LIMIT 10;

-- Sample exercises
SELECT 'EXERCISES' as table_name, id, name, muscle_group_id, LEFT(description, 30) as desc_preview, youtube_url
FROM exercises
ORDER BY id
LIMIT 10;

-- Sample workout plans
SELECT 'WORKOUT PLANS' as table_name, id, name, start_date, end_date, is_active, created_at, duration, split, training_type
FROM workout_plans
ORDER BY created_at DESC
LIMIT 10;

-- Sample workout days
SELECT 'WORKOUT DAYS' as table_name, id, plan_id, day_number, day_name, muscle_group_id
FROM workout_days
ORDER BY plan_id, day_number
LIMIT 10;

-- Sample workout day exercises
SELECT 'WORKOUT DAY EXERCISES' as table_name, id, workout_day_id, exercise_id, sets, reps, rest_seconds, order_index
FROM workout_day_exercises
ORDER BY workout_day_id, order_index
LIMIT 10;

-- Sample workout logs
SELECT 'WORKOUT LOGS' as table_name, id, workout_day_id, workout_name, completed_date, is_manual, LEFT(notes, 30) as notes_preview
FROM workout_logs
ORDER BY completed_date DESC
LIMIT 10;

-- Sample exercise logs
SELECT 'EXERCISE LOGS' as table_name, id, workout_log_id, exercise_id, set_number, reps_completed, weight_kg, LEFT(notes, 20) as notes_preview
FROM exercise_logs
ORDER BY workout_log_id, set_number
LIMIT 10;

-- Sample prisma migrations
SELECT 'PRISMA MIGRATIONS' as table_name, id, migration_name, started_at, finished_at, applied_steps_count
FROM _prisma_migrations
ORDER BY started_at
LIMIT 10;
