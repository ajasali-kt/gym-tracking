-- ============================================================================
-- FIX INVALID JSON DATA IN exercises.steps COLUMN
-- ============================================================================
-- This script fixes the double-double-quote issue in the steps JSON column
-- The data currently has "" instead of " which makes it invalid JSON
-- ============================================================================

-- First, let's see how many rows have this issue
SELECT
    id,
    name,
    steps::text as current_steps
FROM exercises
WHERE steps::text LIKE '%""%'
ORDER BY id;

-- Now let's fix the data by replacing "" with "
UPDATE exercises
SET steps = REPLACE(steps::text, '""', '"')::json
WHERE steps::text LIKE '%""%';

-- Verify the fix
SELECT
    id,
    name,
    steps
FROM exercises
ORDER BY id
LIMIT 10;
