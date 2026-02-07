import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { setUserContext, clearUserContext, captureException } from '../lib/sentry';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Initializing auth state...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting initial session:', error);
      } else {
        console.log('Initial session:', session ? 'Found' : 'Not found');
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session ? 'User logged in' : 'User logged out');
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          setUserContext({ id: session.user.id, email: session.user.email || '' });
        } else {
          clearUserContext();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        captureException(new Error(`Sign in failed: ${error.message}`), { email });

        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          return { data, error: { ...error, message: 'Invalid email or password. Please check your credentials and try again.' } };
        }
        if (error.message.includes('Failed to fetch')) {
          return { data, error: { ...error, message: 'Unable to connect to the server. Please check your internet connection and try again.' } };
        }
      } else {
        console.log('Sign in successful');
      }

      return { data, error };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      captureException(error instanceof Error ? error : new Error('Unknown sign in error'), { email });
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred during sign in'
        }
      };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log('Attempting sign up for:', email);
      
      // Validate inputs
      if (!email || !password || !firstName || !lastName) {
        throw new Error('All fields are required');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (data.user && !error) {
        console.log('User created, creating profile...');
        
        try {
          // Create user profile using the secure database function
          const { error: profileError } = await supabase.rpc('handle_new_user_profile', {
            user_id: data.user.id,
            user_email: data.user.email!,
            first_name: firstName,
            last_name: lastName,
          });

          if (profileError) {
            console.error('Error creating user profile:', profileError);
            return { data, error: profileError };
          } else {
            console.log('User profile created successfully');
          }
        } catch (profileError) {
          console.warn('Profile creation failed, but user account was created:', profileError);
          // Don't fail the entire signup if profile creation fails
        }
      } else if (error) {
        console.error('Sign up error:', error);
        // Provide more user-friendly error messages
        if (error.message.includes('Failed to fetch')) {
          return { data, error: { ...error, message: 'Unable to connect to the server. Please check your internet connection and try again.' } };
        }
      }

      return { data, error };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : 'An unexpected error occurred during sign up'
        } 
      };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting sign out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      } else {
        console.log('Sign out successful');
      }
      
      return { error };
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      return { error };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}