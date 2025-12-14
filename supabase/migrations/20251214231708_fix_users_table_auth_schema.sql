/*
  # Fix Users Table Authentication Schema

  1. Changes
    - Update default role from 'visitor' to 'buyer'
    - Add public INSERT policy for registration
    - Ensure password_hash column exists with proper constraints
    
  2. Security
    - Enable RLS (already enabled)
    - Add policy for public registration (INSERT)
    - Maintain existing policies for SELECT and UPDATE
    - Users can only read/update their own data

  3. Notes
    - This allows new users to register via public INSERT
    - After registration, users can only access their own data
    - Password hash is required for all new registrations
*/

-- Update default role to 'buyer' if not already set
DO $$
BEGIN
  ALTER TABLE users ALTER COLUMN role SET DEFAULT 'buyer';
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Ensure password_hash column exists and is required
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN password_hash text NOT NULL;
  END IF;
END $$;

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Public can register new users" ON users;

-- Add policy allowing public INSERT for registration
CREATE POLICY "Public can register new users"
  ON users FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure SELECT policy exists for authenticated users
DROP POLICY IF EXISTS "Users can read own data" ON users;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Ensure UPDATE policy exists for authenticated users
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);