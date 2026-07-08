ALTER TABLE forum_answers
ADD COLUMN IF NOT EXISTS parent_answer_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_forum_answers_parent'
  ) THEN
    ALTER TABLE forum_answers
    ADD CONSTRAINT fk_forum_answers_parent
    FOREIGN KEY (parent_answer_id, question_id)
    REFERENCES forum_answers(id, question_id)
    ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_forum_answers_parent
ON forum_answers(question_id, parent_answer_id, created_at);
