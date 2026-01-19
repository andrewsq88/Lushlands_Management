/*
  # Fix Properties UPDATE Policy
  
  ## Problem
  The UPDATE policy for the properties table is missing the WITH CHECK clause.
  This can cause issues when users try to update their properties.
  
  ## Changes
  - Drop existing UPDATE policy
  - Recreate with both USING and WITH CHECK clauses
  
  ## Security
  - Ensures users can only update their own properties
  - Prevents users from changing ownership of properties
*/

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Users can update own properties" ON public.properties;

-- Recreate with both USING and WITH CHECK
CREATE POLICY "Users can update own properties"
  ON public.properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
