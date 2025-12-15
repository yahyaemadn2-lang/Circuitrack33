/*
  # Enhanced Offers, Auctions, and Secondary Market Schema

  1. Offers Table Enhancements
    - Add `vendor_id` column to track the vendor receiving the offer
    - Add `quantity` column for offer quantity
    - Add `message` column for buyer message to vendor
    - Add `parent_offer_id` column for counter-offers
    - Add `response_message` column for vendor responses
    - Update status enum to include 'countered'

  2. Auctions Table Enhancements
    - Add `vendor_id` column to track auction creator
    - Add `winning_bid_id` column to track the winning bid
    - Add `winning_buyer_id` column for quick reference

  3. New Secondary Market Table
    - `secondary_market_listings`
      - Allows buyers to resell products they've purchased
      - Fields: seller_id, product_reference (name), condition, quantity, asking_price, notes, status
      - Status: active, sold, cancelled

  4. Security
    - Enable RLS on new table
    - Add policies for offers operations (insert for buyers, update for vendors)
    - Add policies for auctions operations (insert for vendors, bids for buyers)
    - Add policies for secondary market (manage own listings, view all active)
*/

-- Enhance offers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offers' AND column_name = 'vendor_id'
  ) THEN
    ALTER TABLE offers ADD COLUMN vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offers' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE offers ADD COLUMN quantity integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offers' AND column_name = 'message'
  ) THEN
    ALTER TABLE offers ADD COLUMN message text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offers' AND column_name = 'parent_offer_id'
  ) THEN
    ALTER TABLE offers ADD COLUMN parent_offer_id uuid REFERENCES offers(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offers' AND column_name = 'response_message'
  ) THEN
    ALTER TABLE offers ADD COLUMN response_message text DEFAULT '';
  END IF;
END $$;

-- Populate vendor_id for existing offers
UPDATE offers o
SET vendor_id = p.vendor_id
FROM products p
WHERE o.product_id = p.id
AND o.vendor_id IS NULL;

-- Add policies for offers
DROP POLICY IF EXISTS "Buyers can create offers" ON offers;
CREATE POLICY "Buyers can create offers"
  ON offers FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Vendors can update offers on their products" ON offers;
CREATE POLICY "Vendors can update offers on their products"
  ON offers FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Enhance auctions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auctions' AND column_name = 'vendor_id'
  ) THEN
    ALTER TABLE auctions ADD COLUMN vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auctions' AND column_name = 'winning_bid_id'
  ) THEN
    ALTER TABLE auctions ADD COLUMN winning_bid_id uuid REFERENCES bids(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auctions' AND column_name = 'winning_buyer_id'
  ) THEN
    ALTER TABLE auctions ADD COLUMN winning_buyer_id uuid REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Populate vendor_id for existing auctions
UPDATE auctions a
SET vendor_id = p.vendor_id
FROM products p
WHERE a.product_id = p.id
AND a.vendor_id IS NULL;

-- Add policies for auctions
DROP POLICY IF EXISTS "Vendors can create auctions" ON auctions;
CREATE POLICY "Vendors can create auctions"
  ON auctions FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Vendors can update own auctions" ON auctions;
CREATE POLICY "Vendors can update own auctions"
  ON auctions FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Add policies for bids
DROP POLICY IF EXISTS "Buyers can create bids" ON bids;
CREATE POLICY "Buyers can create bids"
  ON bids FOR INSERT
  TO authenticated
  WITH CHECK (bidder_id = auth.uid());

-- Create secondary market table
CREATE TABLE IF NOT EXISTS secondary_market_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_reference text NOT NULL,
  condition text NOT NULL DEFAULT 'used',
  quantity integer NOT NULL DEFAULT 1,
  asking_price numeric(12,2) NOT NULL,
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE secondary_market_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read active listings"
  ON secondary_market_listings FOR SELECT
  TO authenticated
  USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "Users can manage own listings"
  ON secondary_market_listings FOR ALL
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- Add notifications policies for insert
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);