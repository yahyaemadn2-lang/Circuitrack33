/*
  # Fix users table to remove password_hash requirement

  1. Changes
    - Drop password_hash column from public.users table (passwords are managed by Supabase Auth)
    - Ensure role column has proper default value
    - Ensure email and role are required fields only

  2. Notes
    - Supabase Auth manages passwords in auth.users table
    - public.users table should only store profile data
*/

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE public.users DROP COLUMN password_hash;
  END IF;
END $$;

ALTER TABLE public.users 
  ALTER COLUMN role SET DEFAULT 'buyer',
  ALTER COLUMN role SET NOT NULL;
