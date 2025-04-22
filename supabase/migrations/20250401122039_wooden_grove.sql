/*
  # Add new fields to athletes table

  1. Changes
    - Add CPF field (with unique constraint)
    - Add phone number field
    - Add course field
    - Add photo_url field
    
  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity during migration
*/

-- First add the columns as nullable
ALTER TABLE athletes 
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS course text,
  ADD COLUMN IF NOT EXISTS photo_url text;

-- Update existing rows with a temporary CPF value
UPDATE athletes 
SET cpf = 'TEMP' || id::text 
WHERE cpf IS NULL;

-- Now make CPF NOT NULL and add unique constraint
ALTER TABLE athletes 
  ALTER COLUMN cpf SET NOT NULL,
  ADD CONSTRAINT athletes_cpf_unique UNIQUE (cpf);

-- Add comment explaining the temporary CPF values
COMMENT ON COLUMN athletes.cpf IS 'CPF do atleta. Registros existentes antes da migração possuem valores temporários que devem ser atualizados.';