-- ============================================================================
-- MANUAL DATABASE RESTORE SCRIPT
-- ============================================================================
-- This script prepares your LOCAL database to receive backup data
--
-- HOW TO USE IN pgAdmin:
-- 1. Connect to your LOCAL database in pgAdmin
-- 2. Open Query Tool (Tools > Query Tool)
-- 3. Run this entire script first to clear existing data
-- 4. Then run your backup INSERT statements (from backup-manual.sql results)
-- ============================================================================

-- ============================================================================
-- STEP 1: CLEAR EXISTING DATA (CAREFUL!)
-- ============================================================================
-- WARNING: This will delete ALL data in your local database
-- Make sure you're connected to the LOCAL database, not RENDER!

BEGIN;

-- Delete in reverse order of dependencies
DELETE FROM exercise_logs;
DELETE FROM workout_logs;
DELETE FROM workout_day_exercises;
DELETE FROM workout_days;
DELETE FROM workout_plans;
DELETE FROM exercises;
DELETE FROM muscle_groups;

-- Reset sequences to start from 1
ALTER SEQUENCE muscle_groups_id_seq RESTART WITH 1;
ALTER SEQUENCE exercises_id_seq RESTART WITH 1;
ALTER SEQUENCE workout_plans_id_seq RESTART WITH 1;
ALTER SEQUENCE workout_days_id_seq RESTART WITH 1;
ALTER SEQUENCE workout_day_exercises_id_seq RESTART WITH 1;
ALTER SEQUENCE workout_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE exercise_logs_id_seq RESTART WITH 1;

COMMIT;

-- Verify tables are empty
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

-- ============================================================================
-- STEP 2: PASTE YOUR BACKUP INSERT STATEMENTS HERE
-- ============================================================================
-- After running the above, paste the INSERT statements you got from
-- running backup-manual.sql on your RENDER database

-- Example format (replace with your actual data):
-- INSERT INTO muscle_groups (id, name, description, created_at) VALUES (1, 'Chest', 'Pectoral muscles...', '2026-01-17 10:00:00');
-- INSERT INTO muscle_groups (id, name, description, created_at) VALUES (2, 'Back', 'Latissimus dorsi...', '2026-01-17 10:00:00');
-- ... etc


-- ============================================================================
-- STEP 3: FIX SEQUENCE VALUES AFTER RESTORE
-- ============================================================================
-- After inserting all data, run this to fix the auto-increment sequences
-- This ensures new records get the correct next ID

BEGIN;

-- Fix muscle_groups sequence
SELECT setval(
    'muscle_groups_id_seq',
    COALESCE((SELECT MAX(id) FROM muscle_groups), 1),
    true
);

-- Fix exercises sequence
SELECT setval(
    'exercises_id_seq',
    COALESCE((SELECT MAX(id) FROM exercises), 1),
    true
);

-- Fix workout_plans sequence
SELECT setval(
    'workout_plans_id_seq',
    COALESCE((SELECT MAX(id) FROM workout_plans), 1),
    true
);

-- Fix workout_days sequence
SELECT setval(
    'workout_days_id_seq',
    COALESCE((SELECT MAX(id) FROM workout_days), 1),
    true
);

-- Fix workout_day_exercises sequence
SELECT setval(
    'workout_day_exercises_id_seq',
    COALESCE((SELECT MAX(id) FROM workout_day_exercises), 1),
    true
);

-- Fix workout_logs sequence
SELECT setval(
    'workout_logs_id_seq',
    COALESCE((SELECT MAX(id) FROM workout_logs), 1),
    true
);

-- Fix exercise_logs sequence
SELECT setval(
    'exercise_logs_id_seq',
    COALESCE((SELECT MAX(id) FROM exercise_logs), 1),
    true
);

COMMIT;

-- ============================================================================
-- STEP 4: VERIFY RESTORE
-- ============================================================================
-- Check record counts match your backup
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

-- Sample some data to verify
SELECT * FROM muscle_groups LIMIT 5;
SELECT * FROM exercises LIMIT 5;
SELECT * FROM workout_plans LIMIT 5;
SELECT * FROM workout_logs ORDER BY created_at DESC LIMIT 5;
