/*
  # Fix users table INSERT policy

  1. Changes
    - Update INSERT policy for users table to allow public access during sign-up
    - Change FROM `TO authenticated` TO `TO public` for INSERT operations
    - Security is maintained through `WITH CHECK (auth.uid() = id)` clause

  2. Security
    - Users can only insert their own data (auth.uid() = id)
    - Other policies remain unchanged for SELECT and UPDATE operations
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create new INSERT policy that allows public access during sign-up
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);