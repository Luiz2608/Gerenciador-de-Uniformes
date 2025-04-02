/*
  # Initial Schema for Uniform Management System

  1. New Tables
    - `athletes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `sport` (text)
      - `uniform_number` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `uniforms`
      - `id` (uuid, primary key)
      - `type` (text)
      - `size` (text)
      - `status` (text) - available, assigned, maintenance
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `uniform_assignments`
      - `id` (uuid, primary key)
      - `athlete_id` (uuid, foreign key)
      - `uniform_id` (uuid, foreign key)
      - `pickup_date` (timestamp)
      - `return_date` (timestamp)
      - `status` (text) - scheduled, picked_up, returned
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create athletes table
CREATE TABLE athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sport text NOT NULL,
  uniform_number integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create uniforms table
CREATE TABLE uniforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  size text NOT NULL,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('available', 'assigned', 'maintenance'))
);

-- Create uniform_assignments table
CREATE TABLE uniform_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  uniform_id uuid REFERENCES uniforms(id) ON DELETE CASCADE,
  pickup_date timestamptz NOT NULL,
  return_date timestamptz,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'picked_up', 'returned'))
);

-- Enable RLS
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE uniforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE uniform_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to all authenticated users"
  ON athletes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to all authenticated users"
  ON uniforms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to all authenticated users"
  ON uniform_assignments FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for insert, update, delete
CREATE POLICY "Allow full access to authenticated users"
  ON athletes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow full access to authenticated users"
  ON uniforms FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow full access to authenticated users"
  ON uniform_assignments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_athletes_updated_at
    BEFORE UPDATE ON athletes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uniforms_updated_at
    BEFORE UPDATE ON uniforms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uniform_assignments_updated_at
    BEFORE UPDATE ON uniform_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();