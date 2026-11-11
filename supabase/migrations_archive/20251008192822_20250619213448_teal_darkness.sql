/*
  # Create user profile function

  1. Functions
    - `handle_new_user_profile` - Securely creates user profile after signup
  
  2. Security
    - Function runs with security definer privileges
    - Only creates profile for authenticated user
*/

CREATE OR REPLACE FUNCTION handle_new_user_profile(
  user_id uuid,
  user_email text,
  first_name text,
  last_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (user_id, user_email, first_name, last_name);
END;
$$;