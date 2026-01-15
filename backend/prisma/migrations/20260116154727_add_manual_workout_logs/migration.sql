/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `exercises` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "workout_logs_workout_day_id_completed_date_key";

-- AlterTable
ALTER TABLE "workout_logs" ADD COLUMN     "is_manual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workout_name" TEXT,
ALTER COLUMN "workout_day_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "exercises_name_key" ON "exercises"("name");
