/*
  # Add new fields to uniforms table

  1. Changes
    - Add number field (integer)
    - Add condition field (text)
    - Update existing records with default values
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns
ALTER TABLE uniforms 
  ADD COLUMN IF NOT EXISTS number integer,
  ADD COLUMN IF NOT EXISTS condition text;

-- Set default values for existing records
UPDATE uniforms 
SET 
  number = (SELECT COUNT(*) + 1 FROM uniforms u2 WHERE u2.id <= uniforms.id),
  condition = 'Bom'
WHERE number IS NULL OR condition IS NULL;

-- Make columns NOT NULL after setting defaults
ALTER TABLE uniforms
  ALTER COLUMN number SET NOT NULL,
  ALTER COLUMN condition SET NOT NULL;