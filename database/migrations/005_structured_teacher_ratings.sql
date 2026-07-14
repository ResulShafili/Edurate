BEGIN;

ALTER TABLE teacher_reviews
  RENAME COLUMN rating_difficulty TO rating_course_balance;

UPDATE teacher_reviews
SET
  rating_teaching = COALESCE(rating_teaching, rating_overall, 3),
  rating_course_balance = CASE
    WHEN rating_course_balance IS NULL THEN COALESCE(rating_overall, 3)
    ELSE 6 - rating_course_balance
  END,
  rating_grading_fairness = COALESCE(rating_grading_fairness, rating_overall, 3);

ALTER TABLE teacher_reviews
  ALTER COLUMN rating_teaching SET NOT NULL,
  ALTER COLUMN rating_course_balance SET NOT NULL,
  ALTER COLUMN rating_grading_fairness SET NOT NULL,
  DROP COLUMN IF EXISTS comment;

COMMIT;
