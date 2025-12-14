/*
  # Remove password column from users table

  1. Changes
    - Drop password column from public.users table
    - Passwords are managed by Supabase Auth in auth.users table
    - public.users should only contain profile data (id, email, role, phone, created_at)
*/

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'password'
  ) THEN
    ALTER TABLE public.users DROP COLUMN password;
  END IF;
END $$;
