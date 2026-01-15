# Database Setup Guide

This guide will help you set up the PostgreSQL database for the Gym Tracker application.

---

## Prerequisites

- PostgreSQL 14+ installed on your system
- PostgreSQL running on port 5432
- Default postgres user with password `123` (or update .env)

---

## Installation Steps

### Windows

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the installer
   - Run the installer

2. **During Installation**
   - Set port to `5432`
   - Set password for postgres user to `123` (or remember your password)
   - Install pgAdmin (optional, but recommended for GUI)

3. **Verify Installation**
   ```cmd
   # Open Command Prompt
   "C:\Program Files\PostgreSQL\16\bin\psql.exe" --version
   ```

### macOS

```bash
# Using Homebrew
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14

# Set password for postgres user
psql postgres
ALTER USER postgres PASSWORD '123';
\q
```

### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Set password for postgres user
sudo -u postgres psql
ALTER USER postgres PASSWORD '123';
\q
```

---

## Database Creation

### Option 1: Using Command Line

**Windows:**
```cmd
"C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres gym-tracker-db01
```

**macOS/Linux:**
```bash
createdb -U postgres gym-tracker-db01
```

### Option 2: Using psql

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE "gym-tracker-db01";

# Verify creation
\l

# Exit
\q
```

### Option 3: Using pgAdmin (GUI)

1. Open pgAdmin
2. Connect to PostgreSQL server
3. Right-click on "Databases"
4. Click "Create" → "Database"
5. Name: `gym-tracker-db01`
6. Click "Save"

---

## Prisma Setup

Once the database is created, run these commands in the `backend` directory:

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations (creates tables)
npx prisma migrate dev --name init

# 4. Seed database with sample data
npx prisma db seed
```

---

## Verification

### Check Database

```bash
# Connect to database
psql -U postgres -d gym-tracker-db01

# List tables
\dt

# You should see:
# - muscle_groups
# - exercises
# - workout_plans
# - workout_days
# - workout_day_exercises
# - workout_logs
# - exercise_logs

# Count records in muscle_groups
SELECT COUNT(*) FROM muscle_groups;
# Should return: 6

# Count records in exercises
SELECT COUNT(*) FROM exercises;
# Should return: 30

# Exit
\q
```

### Using Prisma Studio

```bash
cd backend
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can:
- Browse all tables
- View data
- Edit records
- Test relationships

---

## Troubleshooting

### Issue: "database does not exist"

**Solution:**
```bash
createdb -U postgres gym-tracker-db01
```

### Issue: "password authentication failed"

**Solution:**
1. Update `.env` file with your actual password
2. Or reset postgres password:
   ```bash
   psql -U postgres
   ALTER USER postgres PASSWORD '123';
   \q
   ```

### Issue: "psql: command not found"

**Solution:**
- **Windows:** Add PostgreSQL bin directory to PATH
  ```
  C:\Program Files\PostgreSQL\16\bin
  ```
- **macOS:**
  ```bash
  echo 'export PATH="/usr/local/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
  source ~/.zshrc
  ```
- **Linux:** PostgreSQL should be in PATH by default

### Issue: "Port 5432 already in use"

**Solution:**
1. Check if PostgreSQL is running:
   ```bash
   # Windows
   netstat -ano | findstr :5432

   # macOS/Linux
   lsof -i :5432
   ```

2. Stop other PostgreSQL instances or change port in `.env`

### Issue: Migration errors

**Solution:**
```bash
# Reset database and migrations
npx prisma migrate reset

# This will:
# 1. Drop the database
# 2. Create it again
# 3. Run all migrations
# 4. Run seed script
```

---

## Environment Configuration

Update `backend/.env` if needed:

```env
# Database connection
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Example with custom settings:
DATABASE_URL="postgresql://myuser:mypassword@localhost:5433/gym-tracker-db01"

# Server port
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

---

## Testing Connection

Create a test file `backend/test-connection.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Try to query muscle groups
    const muscleGroups = await prisma.muscleGroup.findMany();
    console.log('✅ Database connection successful!');
    console.log(`Found ${muscleGroups.length} muscle groups`);

    // Show muscle groups
    muscleGroups.forEach(mg => {
      console.log(`  - ${mg.name}`);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

Run it:
```bash
node test-connection.js
```

Expected output:
```
✅ Database connection successful!
Found 6 muscle groups
  - Arms
  - Back
  - Chest
  - Core
  - Legs
  - Shoulders
```

---

## Database Backup & Restore

### Create Backup

**Windows:**
```cmd
"C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -U postgres gym-tracker-db01 > backup.sql
```

**macOS/Linux:**
```bash
pg_dump -U postgres gym-tracker-db01 > backup.sql
```

### Restore Backup

**Windows:**
```cmd
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres gym-tracker-db01 < backup.sql
```

**macOS/Linux:**
```bash
psql -U postgres gym-tracker-db01 < backup.sql
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `createdb -U postgres gym-tracker-db01` | Create database |
| `dropdb -U postgres gym-tracker-db01` | Delete database |
| `psql -U postgres -d gym-tracker-db01` | Connect to database |
| `npx prisma migrate dev` | Run migrations |
| `npx prisma db seed` | Seed database |
| `npx prisma studio` | Open database GUI |
| `npx prisma migrate reset` | Reset database |
| `npx prisma generate` | Generate Prisma Client |

---

## Next Steps

After database setup:

1. ✅ Database created
2. ✅ Migrations run
3. ✅ Data seeded
4. ▶️ Start backend server: `npm run dev`
5. ▶️ Test API endpoints (see TEST_API.md)
6. ▶️ Build frontend (Phase 4)

---

**Need Help?**

- PostgreSQL Docs: https://www.postgresql.org/docs/
- Prisma Docs: https://www.prisma.io/docs/
- Check backend logs for detailed error messages
