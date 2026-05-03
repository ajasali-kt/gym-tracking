WITH cardio_group AS (
  INSERT INTO "muscle_groups" ("name", "description")
  VALUES ('Cardio', 'Cardiovascular endurance and conditioning')
  ON CONFLICT ("name") DO UPDATE SET "description" = EXCLUDED."description"
  RETURNING "id"
),
resolved_cardio_group AS (
  SELECT "id" FROM cardio_group
  UNION
  SELECT "id" FROM "muscle_groups" WHERE "name" = 'Cardio'
)
INSERT INTO "exercises" ("name", "muscle_group_id", "metric_type", "description", "steps", "youtube_url")
VALUES
  (
    'Outdoor Running',
    (SELECT "id" FROM resolved_cardio_group LIMIT 1),
    'RUNNING',
    'Outdoor running session tracked by distance and duration.',
    '["Warm up at an easy pace","Run the planned distance or duration","Keep effort controlled for the session goal","Cool down with easy walking or jogging"]'::jsonb,
    NULL
  ),
  (
    'Treadmill Running',
    (SELECT "id" FROM resolved_cardio_group LIMIT 1),
    'RUNNING',
    'Treadmill running session tracked by distance and duration.',
    '["Set a comfortable treadmill speed","Run the planned distance or duration","Use the safety clip when available","Cool down before stepping off the treadmill"]'::jsonb,
    NULL
  )
ON CONFLICT ("name") DO UPDATE
SET
  "muscle_group_id" = EXCLUDED."muscle_group_id",
  "metric_type" = 'RUNNING',
  "description" = EXCLUDED."description",
  "steps" = EXCLUDED."steps",
  "youtube_url" = EXCLUDED."youtube_url";
