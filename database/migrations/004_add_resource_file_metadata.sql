DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'resource_file_type'
  ) THEN
    CREATE TYPE resource_file_type AS ENUM ('pdf', 'image');
  END IF;
END $$;

ALTER TABLE pdf_notes
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_type resource_file_type NOT NULL DEFAULT 'pdf',
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT true;

UPDATE pdf_notes
SET file_name = COALESCE(file_name, title)
WHERE file_name IS NULL;

ALTER TABLE pdf_notes
ALTER COLUMN file_name SET NOT NULL;
