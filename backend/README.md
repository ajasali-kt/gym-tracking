# Gym Tracker Backend

Backend API for the Gym Tracking Application built with Node.js, Express, and Prisma ORM.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Database Setup

### 1. Install PostgreSQL
If you haven't installed PostgreSQL yet:
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

### 2. Create Database
```bash
# Using psql
psql -U postgres
CREATE DATABASE "gym-tracker-db01";
\q

# Or using createdb command
createdb -U postgres gym-tracker-db01
```

### 3. Configure Environment Variables
The `.env` file is already configured with:
```
DATABASE_URL="postgresql://postgres:123@localhost:5432/gym-tracker-db01"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed
```

## Database Schema

The application uses 7 tables:

1. **muscle_groups** - Muscle group categories (Chest, Back, Legs, etc.)
2. **exercises** - Exercise library with instructions and YouTube links
3. **workout_plans** - Weekly workout plans
4. **workout_days** - Individual days within plans (Day 1-7)
5. **workout_day_exercises** - Exercises assigned to specific days
6. **workout_logs** - Records of completed workouts
7. **exercise_logs** - Detailed logs of each set performed

### Relationships
```
muscle_groups ──< exercises
muscle_groups ──< workout_days

workout_plans ──< workout_days ──< workout_day_exercises >── exercises
workout_days ──< workout_logs ──< exercise_logs >── exercises
```

## Seed Data

The seed script populates:
- 6 muscle groups
- 30 exercises with:
  - Detailed step-by-step instructions
  - YouTube tutorial links
  - Target muscle groups

### Exercise Categories:
- **Chest**: Bench Press, Incline DB Press, Push-ups, Cable Flyes
- **Back**: Deadlift, Pull-ups, Barbell Rows, Lat Pulldown, Cable Rows
- **Legs**: Squat, Leg Press, Lunges, RDL, Leg Curls, Calf Raises
- **Shoulders**: Overhead Press, Lateral Raises, Front Raises, Face Pulls
- **Arms**: Barbell Curl, Hammer Curls, Tricep Dips, Extensions, Close-Grip BP
- **Core**: Plank, Crunches, Leg Raises, Russian Twists, Dead Bug

## Useful Prisma Commands

```bash
# Open Prisma Studio (database GUI in browser)
npx prisma studio

# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Format schema file
npx prisma format
```

## Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## Testing the Database

After seeding, verify data:

```sql
-- Check muscle groups
SELECT * FROM muscle_groups;

-- Check exercises by muscle group
SELECT e.name, mg.name as muscle_group
FROM exercises e
JOIN muscle_groups mg ON e.muscle_group_id = mg.id
ORDER BY mg.name, e.name;

-- Count exercises per muscle group
SELECT mg.name, COUNT(e.id) as exercise_count
FROM muscle_groups mg
LEFT JOIN exercises e ON e.muscle_group_id = mg.id
GROUP BY mg.name;
```

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env` file
- Ensure database exists: `psql -U postgres -l`

### Migration Issues
- Delete `prisma/migrations` folder and `.env` file
- Recreate `.env` with correct DATABASE_URL
- Run `npx prisma migrate dev --name init` again

### Seed Issues
- Ensure migrations have run first
- Check that database is empty or run `npx prisma migrate reset`
- Verify no foreign key constraint violations

## Next Steps

Once database is set up:
1. Proceed to Phase 3: Build Backend API routes
2. Then Phase 4: Create Frontend service layer
3. Finally Phase 5: Build React components

---

**Database Status**: ✅ Schema defined, ready for migration
**Seed Data**: ✅ 30 exercises across 6 muscle groups
