ALTER TABLE swap_items
ADD COLUMN IF NOT EXISTS swap_note TEXT;

ALTER TABLE swap_items
ADD COLUMN IF NOT EXISTS contact_method TEXT;

ALTER TABLE swap_items
ADD COLUMN IF NOT EXISTS contact_value TEXT;

UPDATE swap_items
SET contact_method = 'email'
WHERE contact_method IS NULL OR btrim(contact_method) = '';

UPDATE swap_items
SET contact_value = 'contact@example.edu.az'
WHERE contact_value IS NULL OR btrim(contact_value) = '';

ALTER TABLE swap_items
ALTER COLUMN contact_method SET NOT NULL;

ALTER TABLE swap_items
ALTER COLUMN contact_value SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_swap_items_contact_method'
  ) THEN
    ALTER TABLE swap_items
    ADD CONSTRAINT chk_swap_items_contact_method
    CHECK (contact_method IN ('whatsapp', 'email'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_swap_items_contact_value'
  ) THEN
    ALTER TABLE swap_items
    ADD CONSTRAINT chk_swap_items_contact_value
    CHECK (btrim(contact_value) <> '');
  END IF;
END $$;

DROP TABLE IF EXISTS swap_transactions;
DROP TABLE IF EXISTS swap_messages;
DROP TABLE IF EXISTS swap_offers;
DROP FUNCTION IF EXISTS enforce_swap_offer_rules();
DROP FUNCTION IF EXISTS enforce_swap_message_sender();
DROP TYPE IF EXISTS swap_offer_status;
