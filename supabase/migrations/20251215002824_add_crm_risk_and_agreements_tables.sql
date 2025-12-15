/*
  # CRM, Risk Management, and Compliance Schema

  1. New Tables
    - `user_agreements`
      - Tracks user acceptance of terms, policies, and declarations
      - Types: registration_terms, vendor_declaration, order_terms
      - Fields: user_id, agreement_type, accepted_at, ip_address, user_agent
    
    - `risk_scores`
      - Stores calculated risk scores for users
      - Fields: user_id, score, level (low/medium/high), reasons, last_calculated
    
    - `company_metrics`
      - Cached metrics for companies for CRM dashboard
      - Fields: company_id, total_orders, total_gmv, avg_order_value, user_count, last_updated
  
  2. Security
    - Enable RLS on all tables
    - Only admins can read risk and compliance data
    - Users can read their own agreements
*/

-- User agreements table
CREATE TABLE IF NOT EXISTS user_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agreement_type text NOT NULL,
  accepted_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own agreements"
  ON user_agreements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own agreements"
  ON user_agreements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all agreements"
  ON user_agreements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_agreements_user_id ON user_agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agreements_type ON user_agreements(agreement_type);

-- Risk scores table
CREATE TABLE IF NOT EXISTS risk_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score numeric(5,2) NOT NULL DEFAULT 0,
  level text NOT NULL DEFAULT 'low',
  reasons jsonb DEFAULT '[]'::jsonb,
  last_calculated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all risk scores"
  ON risk_scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "System can manage risk scores"
  ON risk_scores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Company metrics cache table
CREATE TABLE IF NOT EXISTS company_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  total_orders integer DEFAULT 0,
  total_gmv numeric(12,2) DEFAULT 0,
  avg_order_value numeric(12,2) DEFAULT 0,
  buyer_count integer DEFAULT 0,
  vendor_count integer DEFAULT 0,
  last_order_date timestamptz,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id)
);

ALTER TABLE company_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read company metrics"
  ON company_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage company metrics"
  ON company_metrics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add order_agreements column to orders table if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'terms_accepted_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN terms_accepted_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'terms_version'
  ) THEN
    ALTER TABLE orders ADD COLUMN terms_version text DEFAULT 'v1.0';
  END IF;
END $$;