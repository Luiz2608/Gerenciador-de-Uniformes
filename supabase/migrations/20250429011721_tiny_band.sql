/*
  # Create uniforms table

  1. New Tables
    - `uniforms`
      - `id` (uuid, primary key)
      - `type` (text, not null)
      - `size` (text, not null)
      - `status` (text, not null, with check constraint)
      - `number` (integer, not null)
      - `condition` (text, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `uniforms` table
    - Add policy for all users to perform all operations (as per existing schema)

  3. Triggers
    - Add trigger to update `updated_at` column automatically
*/

-- Create uniforms table
CREATE TABLE IF NOT EXISTS uniforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  size text NOT NULL,
  status text NOT NULL DEFAULT 'available',
  number integer NOT NULL,
  condition text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add status check constraint
ALTER TABLE uniforms ADD CONSTRAINT status_check 
  CHECK (status IN ('available', 'assigned', 'maintenance'));

-- Enable RLS
ALTER TABLE uniforms ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Enable all operations for all users" ON uniforms
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_uniforms_updated_at
  BEFORE UPDATE ON uniforms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();