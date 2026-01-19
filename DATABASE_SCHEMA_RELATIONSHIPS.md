# Database Schema - Foreign Key Relationships

## Entity Relationship Diagram (Text Format)

```
┌─────────────────┐
│     USERS       │
│─────────────────│
│ • id (PK)       │◄─────────────┐
│ • username      │              │
│ • password      │              │ ON DELETE CASCADE
│ • userType      │              │ ON UPDATE CASCADE
│ • createdAt     │              │
│ • updatedAt     │              │
└─────────────────┘              │
        ▲                        │
        │                        │
        │ ON DELETE CASCADE      │
        │ ON UPDATE CASCADE      │
        │                        │
        │                        │
┌───────┴──────────┐    ┌────────┴──────────┐
│  WORKOUT_PLANS   │    │   WORKOUT_LOGS    │
│──────────────────│    │───────────────────│
│ • id (PK)        │    │ • id (PK)         │
│ • userId (FK) ✓  │    │ • userId (FK) ✓   │
│ • name           │    │ • workoutDayId(FK)│
│ • startDate      │    │ • workoutName     │
│ • endDate        │    │ • completedDate   │
│ • isActive       │    │ • notes           │
│ • duration       │    │ • isManual        │
│ • trainingType   │    │ • createdAt       │
│ • split          │    └───────────────────┘
│ • notes          │            │
│ • createdAt      │            │
└──────────────────┘            │
        │                       │
        │                       │
        │ ON DELETE CASCADE     │ ON DELETE CASCADE
        │                       │
        ▼                       │
┌──────────────────┐            │
│  WORKOUT_DAYS    │◄───────────┘
│──────────────────│
│ • id (PK)        │
│ • planId (FK)    │
│ • dayNumber      │
│ • dayName        │
│ • muscleGroupId  │
│ • createdAt      │
└──────────────────┘
        │
        │ ON DELETE CASCADE
        │
        ▼
┌──────────────────────┐
│WORKOUT_DAY_EXERCISES │
│──────────────────────│
│ • id (PK)            │
│ • workoutDayId (FK)  │
│ • exerciseId (FK)    │
│ • sets               │
│ • reps               │
│ • restSeconds        │
│ • orderIndex         │
│ • createdAt          │
└──────────────────────┘
```

---

## Foreign Key Summary Table

| Child Table          | FK Column      | Parent Table   | Parent Column | ON DELETE | ON UPDATE | Required |
|---------------------|----------------|----------------|---------------|-----------|-----------|----------|
| workout_plans       | user_id        | users          | id            | CASCADE   | CASCADE   | ✅ YES   |
| workout_logs        | user_id        | users          | id            | CASCADE   | CASCADE   | ✅ YES   |
| workout_logs        | workout_day_id | workout_days   | id            | CASCADE   | CASCADE   | ❌ NO    |
| workout_days        | plan_id        | workout_plans  | id            | CASCADE   | CASCADE   | ✅ YES   |
| workout_days        | muscle_group_id| muscle_groups  | id            | SET NULL  | CASCADE   | ❌ NO    |
| workout_day_exercises| workout_day_id| workout_days   | id            | CASCADE   | CASCADE   | ✅ YES   |
| workout_day_exercises| exercise_id   | exercises      | id            | CASCADE   | CASCADE   | ✅ YES   |
| exercise_logs       | workout_log_id | workout_logs   | id            | CASCADE   | CASCADE   | ✅ YES   |
| exercise_logs       | exercise_id    | exercises      | id            | CASCADE   | CASCADE   | ✅ YES   |
| exercises           | muscle_group_id| muscle_groups  | id            | CASCADE   | CASCADE   | ✅ YES   |

---

## Data Ownership Hierarchy

### Level 1: User (Top Level)
```
USER
├── owns → WORKOUT_PLANS (via user_id FK)
└── owns → WORKOUT_LOGS (via user_id FK)
```

### Level 2: User-Owned Resources
```
WORKOUT_PLAN (owned by USER)
└── contains → WORKOUT_DAYS (via plan_id FK)

WORKOUT_LOG (owned by USER)
├── references → WORKOUT_DAY (via workout_day_id FK, optional)
└── contains → EXERCISE_LOGS (via workout_log_id FK)
```

### Level 3: Nested Resources
```
WORKOUT_DAY (belongs to WORKOUT_PLAN)
└── contains → WORKOUT_DAY_EXERCISES (via workout_day_id FK)

EXERCISE_LOG (belongs to WORKOUT_LOG)
└── references → EXERCISE (via exercise_id FK)
```

---

## Cascade Delete Behavior

### Deleting a User
When a user is deleted:
1. ✅ All their `workout_plans` are deleted
2. ✅ All their `workout_logs` are deleted
3. ✅ All `workout_days` under their plans are deleted (cascade from plans)
4. ✅ All `workout_day_exercises` are deleted (cascade from days)
5. ✅ All `exercise_logs` are deleted (cascade from logs)

**Result**: Complete cleanup of all user data - no orphaned records

### Deleting a Workout Plan
When a workout plan is deleted:
1. ✅ All `workout_days` in the plan are deleted
2. ✅ All `workout_day_exercises` are deleted (cascade from days)

**Note**: Workout logs are NOT deleted because they are historical records owned by the user

### Deleting a Workout Day
When a workout day is deleted:
1. ✅ All `workout_day_exercises` for that day are deleted
2. ❌ Workout logs remain (historical records)
3. ✅ Workout log's `workout_day_id` is set to NULL (if ON DELETE CASCADE was SET NULL)

---

## Multi-User Data Isolation

### How Data is Isolated

1. **Database Level (Foreign Keys)**
   - `workout_plans.user_id` → `users.id` (REQUIRED)
   - `workout_logs.user_id` → `users.id` (REQUIRED)
   - Cannot create plans/logs without valid user
   - Cannot reference non-existent users

2. **Application Level (Backend Routes)**
   - All queries filtered by `req.userId` from JWT token
   - Direct filtering: `WHERE userId = req.userId`
   - Nested filtering: `WHERE plan.userId = req.userId`

3. **Verification Chain**
   ```
   User A creates Workout Plan
   └─> workout_plans.user_id = A's userId

   User B tries to access the plan
   └─> Backend queries: WHERE id = planId AND userId = B's userId
   └─> Returns NULL (no match)
   └─> Returns 404 Not Found
   ```

---

## Index Strategy for Performance

### User-Related Indexes
```sql
-- Fast user lookup by username (login)
CREATE INDEX "users_username_idx" ON "users"("username");

-- Fast plan queries by user
CREATE INDEX "workout_plans_user_id_idx" ON "workout_plans"("user_id");

-- Fast log queries by user
CREATE INDEX "workout_logs_user_id_idx" ON "workout_logs"("user_id");

-- Fast active plan lookup
CREATE INDEX "workout_plans_is_active_idx" ON "workout_plans"("is_active");

-- Fast log date queries
CREATE INDEX "workout_logs_completed_date_idx" ON "workout_logs"("completed_date");
```

### Common Query Patterns
1. **Get user's active plan**: Uses `user_id` + `is_active` indexes
2. **Get user's workout history**: Uses `user_id` + `completed_date` indexes
3. **Get specific plan**: Uses `id` (PK) + `user_id` for ownership check

---

## Data Integrity Guarantees

### ✅ Enforced by Database
- User must exist before creating plans/logs (FK constraint)
- Plans/logs must reference valid user (FK constraint)
- Deleting user removes all their data (CASCADE)
- No orphaned records possible

### ✅ Enforced by Prisma Schema
- `userId` is required (Int, not Int?)
- `user` relation is required (User, not User?)
- TypeScript types enforce non-null
- Cannot compile code that violates schema

### ✅ Enforced by Backend Routes
- Authentication middleware ensures valid user
- All queries filter by authenticated userId
- Ownership verified before updates/deletes
- Users cannot access other users' data

### ✅ Enforced by Frontend
- Protected routes require authentication
- API client includes JWT token in all requests
- Failed auth redirects to login
- No direct database access from frontend

---

## Migration History

### Migration 1: Add User Model (20260119064256)
```sql
-- Create users table
CREATE TABLE "users" (...);

-- Add user_id columns (nullable for migration)
ALTER TABLE "workout_plans" ADD COLUMN "user_id" INTEGER;
ALTER TABLE "workout_logs" ADD COLUMN "user_id" INTEGER;

-- Add foreign key constraints
ALTER TABLE "workout_plans"
  ADD CONSTRAINT "workout_plans_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workout_logs"
  ADD CONSTRAINT "workout_logs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX "workout_plans_user_id_idx" ON "workout_plans"("user_id");
CREATE INDEX "workout_logs_user_id_idx" ON "workout_logs"("user_id");
```

### Migration 2: Make userId Required (20260119115240)
```sql
-- Make user_id NOT NULL (after data migration)
ALTER TABLE "workout_logs" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "workout_plans" ALTER COLUMN "user_id" SET NOT NULL;
```

---

## Verification Commands

### Check Foreign Keys
```bash
cd backend
node scripts/checkForeignKeys.js
```

### Check Data Ownership
```bash
cd backend
node scripts/verifyMigration.js
```

### View Schema in Prisma Studio
```bash
cd backend
npx prisma studio
```

### Raw SQL Query
```sql
-- Check foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

---

**Last Updated**: 2026-01-19
**Status**: ✅ All foreign keys implemented and verified
**Related Docs**:
- [MULTI_USER_IMPLEMENTATION_PROGRESS.md](MULTI_USER_IMPLEMENTATION_PROGRESS.md)
- [FOREIGN_KEY_IMPLEMENTATION_SUMMARY.md](FOREIGN_KEY_IMPLEMENTATION_SUMMARY.md)
