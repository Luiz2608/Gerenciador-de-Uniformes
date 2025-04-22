/*
  # Add uniform number to athletes table

  1. Changes
    - Add `uniform_number` column to `athletes` table
      - Type: integer
      - Nullable: true (since not all athletes may have a uniform number assigned)

  2. Notes
    - Using IF NOT EXISTS to ensure idempotency
    - Column is added as nullable to maintain compatibility with existing records
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'athletes' 
    AND column_name = 'uniform_number'
  ) THEN
    ALTER TABLE athletes ADD COLUMN uniform_number integer;
  END IF;
END $$;