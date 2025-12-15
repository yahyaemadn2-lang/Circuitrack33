/*
  # Seed demo wallet balance for testing

  1. Changes
    - Create demo buyer user if doesn't exist
    - Create wallet for demo buyer with initial balance
  
  2. Notes
    - This is for testing the e-commerce flow
    - Demo buyer can use this balance to place orders
*/

-- Create demo buyer user in auth.users
DO $$
BEGIN
  -- Check if demo buyer exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '77777777-7777-7777-7777-777777777777') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      '77777777-7777-7777-7777-777777777777',
      'demo-buyer@circuitrack.com',
      crypt('demo123456', gen_salt('bf')),
      now(),
      now(),
      now()
    );
  END IF;
END $$;

-- Create public users record for demo buyer
INSERT INTO users (id, email, role)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  'demo-buyer@circuitrack.com',
  'buyer'
)
ON CONFLICT (id) DO NOTHING;

-- Create wallet for demo buyer with initial balance
INSERT INTO wallets (id, user_id, main_balance, cashback_balance, penalty_balance)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  10000.00,
  0.00,
  0.00
)
ON CONFLICT (id) DO NOTHING;
