# Database Backup & Restore Guide

This guide explains how to manually backup and restore your Gym Tracker database using SQL scripts in pgAdmin.

## 📋 Prerequisites

- pgAdmin installed and configured
- Both RENDER and LOCAL database connections set up in pgAdmin
- Write permissions to the backups directory

## 🔄 Method 1: SQL INSERT Statements (Recommended)

This method generates INSERT statements that you can copy and paste.

### Step 1: Backup from Render Database

1. Open **pgAdmin**
2. Connect to your **RENDER** database (`dpg-d5ljq4ngi27c738uvkv0-a.oregon-postgres.render.com`)
3. Open **Query Tool** (Tools > Query Tool)
4. Open the file: `scripts/backup-manual.sql`
5. Run each SELECT query **one at a time**
6. For each query:
   - Copy the results (all rows from the output)
   - Save them to a text file (e.g., `muscle-groups-backup.sql`)

**Example output:**
```sql
INSERT INTO "MuscleGroup" (id, name, description) VALUES (1, 'Chest', 'Pectoral muscles...');
INSERT INTO "MuscleGroup" (id, name, description) VALUES (2, 'Back', 'Latissimus dorsi...');
```

### Step 2: Restore to Local Database

1. Connect to your **LOCAL** database in pgAdmin
2. Open **Query Tool**
3. Open the file: `scripts/restore-manual.sql`
4. Run **STEP 1** to clear existing data (⚠️ WARNING: This deletes all local data!)
5. Paste your saved INSERT statements from Step 1
6. Run all the INSERT statements
7. Run **STEP 3** to fix sequence values
8. Run **STEP 4** to verify the restore

## 📄 Method 2: CSV Export/Import

This method uses CSV files for data transfer.

### Step 1: Export from Render to CSV

1. Connect to **RENDER** database in pgAdmin
2. Open **Query Tool**
3. Create the backups directory if it doesn't exist
4. Run the `\COPY` commands from `backup-manual.sql`:

```sql
\COPY "MuscleGroup" TO 'C:/path/to/backups/muscle_groups.csv' DELIMITER ',' CSV HEADER;
\COPY "Exercise" TO 'C:/path/to/backups/exercises.csv' DELIMITER ',' CSV HEADER;
\COPY "Workout" TO 'C:/path/to/backups/workouts.csv' DELIMITER ',' CSV HEADER;
\COPY "WorkoutExercise" TO 'C:/path/to/backups/workout_exercises.csv' DELIMITER ',' CSV HEADER;
```

### Step 2: Import CSV to Local

1. Update file paths in `scripts/import-from-csv.sql`
2. Connect to **LOCAL** database in pgAdmin
3. Open **Query Tool**
4. Run the entire `import-from-csv.sql` script

## 🐘 Method 3: pg_dump (Command Line - Most Reliable)

If you have PostgreSQL command line tools installed:

### Backup (from anywhere):
```bash
pg_dump "postgresql://gym_tracker_user:vIqkexhr9BcfmqUYEcaaTw8F@dpg-d5ljq4ngi27c7n-postgres.render.com/gym_tracke_q8m1" > backup.sql
```

### Restore (to local):
```bash
psql "postgresql://postgres:123@localhost:5432/gym-tracker-db01" < backup.sql
```

## 📊 Verify Your Backup

Run this query on both databases to compare record counts:

```sql
SELECT
    'MuscleGroup' as table_name,
    COUNT(*) as record_count
FROM "MuscleGroup"
UNION ALL
SELECT 'Exercise', COUNT(*) FROM "Exercise"
UNION ALL
SELECT 'Workout', COUNT(*) FROM "Workout"
UNION ALL
SELECT 'WorkoutExercise', COUNT(*) FROM "WorkoutExercise";
```

The counts should match between RENDER and LOCAL after restore.

## ⚠️ Important Notes

1. **Always backup before restore** - The restore process deletes all existing data
2. **Double-check which database you're connected to** - Don't accidentally clear your production data!
3. **Sequence values matter** - Always run the sequence fix queries after restore
4. **Test locally first** - Verify the backup/restore process works before relying on it

## 🆘 Troubleshooting

### "Permission denied" error with \COPY
- Use pgAdmin's Import/Export feature instead
- Right-click table → Import/Export → Select CSV file

### Special characters causing errors
- The backup script handles escaping single quotes
- If you still have issues, use the CSV method instead

### Sequence values not updating
- Make sure to run the `setval()` commands in STEP 3 of restore-manual.sql
- Otherwise, new records will get duplicate ID errors

## 📞 Quick Reference

| File | Purpose |
|------|---------|
| `backup-manual.sql` | Generates INSERT statements from Render DB |
| `restore-manual.sql` | Prepares local DB and restores data |
| `import-from-csv.sql` | Imports CSV files to local DB |
| `pg-dump-backup.sh` | Full database dump using pg_dump |

## 🔐 Security Note

Never commit files containing:
- Actual database credentials
- Connection strings with passwords
- Real backup data with user information

The scripts in this directory use environment variables for sensitive data.
