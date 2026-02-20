-- CreateTable
CREATE TABLE "workout_shares" (
    "id" SERIAL NOT NULL,
    "token" UUID NOT NULL,
    "user_id" INTEGER NOT NULL,
    "from_date" DATE NOT NULL,
    "to_date" DATE NOT NULL,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workout_shares_token_key" ON "workout_shares"("token");

-- CreateIndex
CREATE INDEX "workout_shares_token_idx" ON "workout_shares"("token");

-- CreateIndex
CREATE INDEX "workout_shares_user_id_idx" ON "workout_shares"("user_id");

-- CreateIndex
CREATE INDEX "workout_shares_is_active_idx" ON "workout_shares"("is_active");

-- CreateIndex
CREATE INDEX "workout_shares_expires_at_idx" ON "workout_shares"("expires_at");

-- CreateIndex
CREATE INDEX "workout_shares_created_at_idx" ON "workout_shares"("created_at");

-- AddForeignKey
ALTER TABLE "workout_shares" ADD CONSTRAINT "workout_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
