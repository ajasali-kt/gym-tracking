-- CreateTable
CREATE TABLE "user_features" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "body_measurements_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "body_measurements" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "measured_date" DATE NOT NULL,
    "weight_kg" DOUBLE PRECISION NOT NULL,
    "height_cm" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "body_measurements_pkey" PRIMARY KEY ("id")
);

-- Backfill feature rows for existing users.
INSERT INTO "user_features" ("user_id", "body_measurements_enabled", "created_at", "updated_at")
SELECT "id", false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users";

-- CreateIndex
CREATE UNIQUE INDEX "user_features_user_id_key" ON "user_features"("user_id");

-- CreateIndex
CREATE INDEX "user_features_user_id_idx" ON "user_features"("user_id");

-- CreateIndex
CREATE INDEX "body_measurements_user_id_idx" ON "body_measurements"("user_id");

-- CreateIndex
CREATE INDEX "body_measurements_measured_date_idx" ON "body_measurements"("measured_date");

-- CreateIndex
CREATE UNIQUE INDEX "body_measurements_user_id_measured_date_key" ON "body_measurements"("user_id", "measured_date");

-- AddForeignKey
ALTER TABLE "user_features" ADD CONSTRAINT "user_features_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "body_measurements" ADD CONSTRAINT "body_measurements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
