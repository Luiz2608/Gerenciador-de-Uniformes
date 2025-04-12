/*
  # Update RLS policies for uniform assignments table

  1. Changes
    - Remove existing RLS policies from uniform_assignments table
    - Add new policy that allows all operations without restrictions
    
  2. Security
    - As this is an internal system, we'll allow all operations
    - No authentication restrictions needed for this case
*/

-- Remove existing policies
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON uniform_assignments;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON uniform_assignments;

-- Create new policy that allows all operations
CREATE POLICY "Enable all operations for all users"
ON uniform_assignments
FOR ALL
USING (true)
WITH CHECK (true);