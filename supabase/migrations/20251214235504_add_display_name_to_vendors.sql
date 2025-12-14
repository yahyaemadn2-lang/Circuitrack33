/*
  # Add display_name column to vendors table

  1. Changes
    - Add `display_name` column to vendors table
      - Type: text
      - Required field
      - Default: empty string for existing records
  
  2. Notes
    - Existing vendors will have empty display_name, which should be updated separately
    - New vendors created through registration will have display_name set automatically
*/

-- Add display_name column to vendors table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE vendors ADD COLUMN display_name text NOT NULL DEFAULT '';
  END IF;
END $$;
