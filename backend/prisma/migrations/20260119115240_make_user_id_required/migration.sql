/*
  Warnings:

  - Made the column `user_id` on table `workout_logs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `workout_plans` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "workout_logs" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "workout_plans" ALTER COLUMN "user_id" SET NOT NULL;
