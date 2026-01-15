-- CreateIndex: Add unique constraint to prevent duplicate workout logs for same day
CREATE UNIQUE INDEX "workout_logs_workout_day_id_completed_date_key" ON "workout_logs"("workout_day_id", "completed_date");
