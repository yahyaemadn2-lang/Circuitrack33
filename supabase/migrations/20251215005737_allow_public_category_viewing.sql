/*
  # Allow Public Category Viewing

  1. Changes
    - Drop existing "Anyone can read categories" policy that only allows authenticated users
    - Create new policy "Public can view categories" that allows both authenticated and anonymous users to SELECT categories
  
  2. Security
    - Only affects read access, not write operations
    - Categories are public information needed for product browsing
*/

DROP POLICY IF EXISTS "Anyone can read categories" ON categories;

CREATE POLICY "Public can view categories"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);
