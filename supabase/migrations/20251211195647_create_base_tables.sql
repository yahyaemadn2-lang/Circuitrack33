/*
  # Create Base Tables

  This migration creates the foundational tables for the e-commerce platform without relations.

  ## New Tables

  ### 1. users
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique) - User email address
  - `phone` (text, optional) - User phone number
  - `password` (text) - User password (hashed)
  - `role` (text) - User role: visitor, buyer, company_user, vendor, admin
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. companies
  - `id` (uuid, primary key) - Unique company identifier
  - `name` (text) - Company name
  - `tax_id` (text, optional) - Company tax identification number
  - `address` (text, optional) - Company address
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. company_users
  - `id` (uuid, primary key) - Unique company user relationship identifier
  - `company_id` (uuid) - Reference to company
  - `user_id` (uuid) - Reference to user
  - `role` (text) - Company role: owner, procurement_manager, buyer, viewer
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. vendors
  - `id` (uuid, primary key) - Unique vendor identifier
  - `user_id` (uuid) - Reference to user
  - `commission_rate` (numeric) - Vendor commission rate
  - `status` (text) - Vendor status: pending, approved, rejected
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. categories
  - `id` (uuid, primary key) - Unique category identifier
  - `parent_id` (uuid, optional) - Reference to parent category
  - `name` (text) - Category name
  - `slug` (text) - URL-friendly category identifier
  - `created_at` (timestamptz) - Record creation timestamp

  ### 6. products
  - `id` (uuid, primary key) - Unique product identifier
  - `vendor_id` (uuid) - Reference to vendor
  - `category_id` (uuid) - Reference to category
  - `name` (text) - Product name
  - `slug` (text) - URL-friendly product identifier
  - `description` (text) - Product description
  - `price` (numeric) - Product price
  - `condition` (text) - Product condition: new, used
  - `created_at` (timestamptz) - Record creation timestamp

  ### 7. wallets
  - `id` (uuid, primary key) - Unique wallet identifier
  - `user_id` (uuid) - Reference to user
  - `main_balance` (numeric) - Main wallet balance
  - `cashback_balance` (numeric) - Cashback balance
  - `penalty_balance` (numeric) - Penalty balance

  ### 8. wallet_transactions
  - `id` (uuid, primary key) - Unique transaction identifier
  - `wallet_id` (uuid) - Reference to wallet
  - `type` (text) - Transaction type
  - `amount` (numeric) - Transaction amount
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - RLS enabled on all tables
  - No policies created yet (tables are locked down by default)

  ## Notes
  1. All IDs use UUID type with automatic generation
  2. All timestamps default to current time
  3. All numeric fields use numeric type for precision
  4. No foreign key constraints added yet
  5. No indexes added yet beyond primary keys
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'visitor',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tax_id text,
  address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create company_users table
CREATE TABLE IF NOT EXISTS company_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'viewer',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  commission_rate numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid,
  name text NOT NULL,
  slug text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  category_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  condition text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  main_balance numeric NOT NULL DEFAULT 0,
  cashback_balance numeric NOT NULL DEFAULT 0,
  penalty_balance numeric NOT NULL DEFAULT 0
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;