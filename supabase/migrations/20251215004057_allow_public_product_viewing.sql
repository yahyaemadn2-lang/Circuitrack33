/*
  # Allow Public Product Viewing

  1. Changes
    - Drop existing "Anyone can read products" policy that only allows authenticated users
    - Create new policy "Public can view products" that allows both authenticated and anonymous users to SELECT products
  
  2. Security
    - Maintains existing vendor management policies
    - Only affects read access, not write operations
*/

DROP POLICY IF EXISTS "Anyone can read products" ON products;

CREATE POLICY "Public can view products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);
