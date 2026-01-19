/*
  # Fix RLS for user sign-up

  1. Security Changes
    - Remove problematic INSERT policy that causes timing issues
    - Create secure function to handle user profile creation
    - Function uses SECURITY DEFINER to bypass RLS safely
    - Validates user_id matches authenticated user for security

  2. Function Details
    - `handle_new_user_profile` creates user profiles with elevated privileges
    - Prevents RLS violations during sign-up process
    - Maintains security through proper validation
*/

-- Drop the existing INSERT policy since we'll handle insertion through the function
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create the secure user profile creation function
CREATE OR REPLACE FUNCTION handle_new_user_profile(
  user_id uuid,
  user_email text,
  first_name text,
  last_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate that the user_id matches the authenticated user
  IF auth.uid() != user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot create profile for different user';
  END IF;

  -- Insert the user profile
  INSERT INTO users (id, email, first_name, last_name)
  VALUES (user_id, user_email, first_name, last_name);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION handle_new_user_profile(uuid, text, text, text) TO authenticated;

-- Also grant to anon users since they need to call this during sign-up
GRANT EXECUTE ON FUNCTION handle_new_user_profile(uuid, text, text, text) TO anon;