-- ============================================================================
-- IMPORT FROM CSV FILES
-- ============================================================================
-- Use this if you exported data to CSV files using the COPY command
--
-- HOW TO USE IN pgAdmin:
-- 1. Make sure CSV files exist in the backups directory
-- 2. Connect to your LOCAL database
-- 3. Update the file paths below to match your actual file locations
-- 4. Run this script
-- ============================================================================

BEGIN;

-- Clear existing data first
DELETE FROM "WorkoutExercise";
DELETE FROM "Workout";
DELETE FROM "Exercise";
DELETE FROM "MuscleGroup";

-- Import MuscleGroup
\COPY "MuscleGroup" FROM 'C:/Users/AjasAli.KT/OneDrive - WellSky/Desktop/Persona/Gym-Tracking/backend/backups/muscle_groups.csv' DELIMITER ',' CSV HEADER;

-- Import Exercise
\COPY "Exercise" FROM 'C:/Users/AjasAli.KT/OneDrive - WellSky/Desktop/Persona/Gym-Tracking/backend/backups/exercises.csv' DELIMITER ',' CSV HEADER;

-- Import Workout
\COPY "Workout" FROM 'C:/Users/AjasAli.KT/OneDrive - WellSky/Desktop/Persona/Gym-Tracking/backend/backups/workouts.csv' DELIMITER ',' CSV HEADER;

-- Import WorkoutExercise
\COPY "WorkoutExercise" FROM 'C:/Users/AjasAli.KT/OneDrive - WellSky/Desktop/Persona/Gym-Tracking/backend/backups/workout_exercises.csv' DELIMITER ',' CSV HEADER;

-- Fix sequences
SELECT setval('"MuscleGroup_id_seq"', COALESCE((SELECT MAX(id) FROM "MuscleGroup"), 1), true);
SELECT setval('"Exercise_id_seq"', COALESCE((SELECT MAX(id) FROM "Exercise"), 1), true);
SELECT setval('"Workout_id_seq"', COALESCE((SELECT MAX(id) FROM "Workout"), 1), true);
SELECT setval('"WorkoutExercise_id_seq"', COALESCE((SELECT MAX(id) FROM "WorkoutExercise"), 1), true);

COMMIT;

-- Verify import
SELECT
    'MuscleGroup' as table_name,
    COUNT(*) as record_count
FROM "MuscleGroup"
UNION ALL
SELECT
    'Exercise' as table_name,
    COUNT(*) as record_count
FROM "Exercise"
UNION ALL
SELECT
    'Workout' as table_name,
    COUNT(*) as record_count
FROM "Workout"
UNION ALL
SELECT
    'WorkoutExercise' as table_name,
    COUNT(*) as record_count
FROM "WorkoutExercise";
