ALTER TABLE "exercises"
ADD COLUMN "metric_type" TEXT NOT NULL DEFAULT 'STRENGTH';

ALTER TABLE "workout_day_exercises"
ADD COLUMN "target_distance_km" DOUBLE PRECISION,
ADD COLUMN "target_duration_minutes" DOUBLE PRECISION;

ALTER TABLE "exercise_logs"
ALTER COLUMN "reps_completed" DROP NOT NULL,
ALTER COLUMN "weight_kg" DROP NOT NULL,
ADD COLUMN "distance_km" DOUBLE PRECISION,
ADD COLUMN "duration_minutes" DOUBLE PRECISION,
ADD COLUMN "pace_minutes_per_km" DOUBLE PRECISION;

UPDATE "exercises"
SET "metric_type" = 'RUNNING'
WHERE LOWER("name") IN ('outdoor running', 'treadmill running');
