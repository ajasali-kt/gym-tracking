-- ============================================================================
-- COMPLETE DATABASE RESTORE - ALL TABLES, ALL COLUMNS
-- ============================================================================
-- This script clears your local database and prepares it for data restore
--
-- USAGE:
-- 1. Run STEP 1 to clear all data
-- 2. Paste INSERT statements from backup-complete.sql
-- 3. Run STEP 2 to fix sequences
-- 4. Run STEP 3 to verify
-- ============================================================================

-- ============================================================================
-- STEP 1: CLEAR ALL DATA FROM ALL TABLES
-- ============================================================================
-- WARNING: This deletes EVERYTHING in your local database!
-- Double-check you're connected to LOCAL database, NOT RENDER!

BEGIN;

-- Delete in reverse dependency order
DELETE FROM exercise_logs;
DELETE FROM workout_logs;
DELETE FROM workout_day_exercises;
DELETE FROM workout_days;
DELETE FROM workout_plans;
DELETE FROM exercises;
DELETE FROM muscle_groups;
DELETE FROM _prisma_migrations;

-- Reset all sequences to 1
ALTER SEQUENCE muscle_groups_id_seq RESTART WITH 1;
ALTER SEQUENCE exercises_id_seq RESTART WITH 1;
ALTER SEQUENCE workout_plans_id_seq RESTART WITH 1;
ALTER SEQUENCE workout_days_id_seq RESTART WITH 1;
ALTER SEQUENCE workout_day_exercises_id_seq RESTART WITH 1;
ALTER SEQUENCE workout_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE exercise_logs_id_seq RESTART WITH 1;

COMMIT;

-- Verify all tables are empty
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
UNION ALL
SELECT '_prisma_migrations', COUNT(*) FROM _prisma_migrations
ORDER BY table_name;

-- Expected result: All counts should be 0


-- ============================================================================
-- PASTE YOUR INSERT STATEMENTS HERE (FROM backup-complete.sql)
-- ============================================================================

-- MUSCLE GROUPS (Note: column is "createdAt" with quotes - camelCase!)
-- Paste INSERT statements here...


-- EXERCISES
-- Paste INSERT statements here...


-- WORKOUT PLANS
-- Paste INSERT statements here...


-- WORKOUT DAYS
-- Paste INSERT statements here...


-- WORKOUT DAY EXERCISES
-- Paste INSERT statements here...


-- WORKOUT LOGS
-- Paste INSERT statements here...


-- EXERCISE LOGS
-- Paste INSERT statements here...


-- PRISMA MIGRATIONS
-- Paste INSERT statements here...


-- ============================================================================
-- STEP 2: FIX ALL SEQUENCE VALUES
-- ============================================================================
-- This ensures auto-increment IDs continue from the correct values

BEGIN;

-- Fix muscle_groups sequence
SELECT setval(
    'muscle_groups_id_seq',
    COALESCE((SELECT MAX(id) FROM muscle_groups), 0),
    true
);

-- Fix exercises sequence
SELECT setval(
    'exercises_id_seq',
    COALESCE((SELECT MAX(id) FROM exercises), 0),
    true
);

-- Fix workout_plans sequence
SELECT setval(
    'workout_plans_id_seq',
    COALESCE((SELECT MAX(id) FROM workout_plans), 0),
    true
);

-- Fix workout_days sequence
SELECT setval(
    'workout_days_id_seq',
    COALESCE((SELECT MAX(id) FROM workout_days), 0),
    true
);

-- Fix workout_day_exercises sequence
SELECT setval(
    'workout_day_exercises_id_seq',
    COALESCE((SELECT MAX(id) FROM workout_day_exercises), 0),
    true
);

-- Fix workout_logs sequence
SELECT setval(
    'workout_logs_id_seq',
    COALESCE((SELECT MAX(id) FROM workout_logs), 0),
    true
);

-- Fix exercise_logs sequence
SELECT setval(
    'exercise_logs_id_seq',
    COALESCE((SELECT MAX(id) FROM exercise_logs), 0),
    true
);

COMMIT;


-- ============================================================================
-- STEP 3: VERIFY RESTORE COMPLETE
-- ============================================================================

-- Check record counts
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


-- Check sequence values (should match max IDs)
SELECT
    'muscle_groups_id_seq' as sequence_name,
    last_value as current_value,
    (SELECT MAX(id) FROM muscle_groups) as max_table_id
FROM muscle_groups_id_seq
UNION ALL
SELECT
    'exercises_id_seq',
    last_value,
    (SELECT MAX(id) FROM exercises)
FROM exercises_id_seq
UNION ALL
SELECT
    'workout_plans_id_seq',
    last_value,
    (SELECT MAX(id) FROM workout_plans)
FROM workout_plans_id_seq
UNION ALL
SELECT
    'workout_days_id_seq',
    last_value,
    (SELECT MAX(id) FROM workout_days)
FROM workout_days_id_seq
UNION ALL
SELECT
    'workout_day_exercises_id_seq',
    last_value,
    (SELECT MAX(id) FROM workout_day_exercises)
FROM workout_day_exercises_id_seq
UNION ALL
SELECT
    'workout_logs_id_seq',
    last_value,
    (SELECT MAX(id) FROM workout_logs)
FROM workout_logs_id_seq
UNION ALL
SELECT
    'exercise_logs_id_seq',
    last_value,
    (SELECT MAX(id) FROM exercise_logs)
FROM exercise_logs_id_seq;


-- Sample data from each table
SELECT '=== MUSCLE GROUPS ===' as info;
SELECT * FROM muscle_groups ORDER BY id LIMIT 5;

SELECT '=== EXERCISES ===' as info;
SELECT id, name, muscle_group_id, LEFT(description, 50) as description FROM exercises ORDER BY id LIMIT 5;

SELECT '=== WORKOUT PLANS ===' as info;
SELECT * FROM workout_plans ORDER BY createdAt DESC LIMIT 5;

SELECT '=== WORKOUT DAYS ===' as info;
SELECT * FROM workout_days ORDER BY plan_id, day_number LIMIT 5;

SELECT '=== WORKOUT DAY EXERCISES ===' as info;
SELECT * FROM workout_day_exercises ORDER BY workout_day_id, order_index LIMIT 5;

SELECT '=== WORKOUT LOGS ===' as info;
SELECT id, workout_day_id, workout_name, completed_date, is_manual FROM workout_logs ORDER BY completed_date DESC LIMIT 5;

SELECT '=== EXERCISE LOGS ===' as info;
SELECT * FROM exercise_logs ORDER BY workout_log_id, set_number LIMIT 5;

SELECT '=== PRISMA MIGRATIONS ===' as info;
SELECT id, migration_name, started_at, finished_at, applied_steps_count FROM _prisma_migrations ORDER BY started_at LIMIT 5;


-- ============================================================================
-- RESTORE COMPLETE!
-- ============================================================================
-- If all counts match and sample data looks correct, your restore is successful!
