import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { performanceMonitor } from '../utils/performanceMonitor';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  });
  console.warn('Creating mock Supabase client - features will be limited');

  // Create a mock client to prevent app crashes
  supabaseClient = createClient(
    'https://placeholder.supabase.co',
    'placeholder-anon-key',
    {
      auth: { persistSession: false, autoRefreshToken: false }
    }
  );
} else {
  console.log('Initializing Supabase client with URL:', supabaseUrl);

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'lushlands-management-app'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 2
      }
    }
  });

  // Monitor Supabase connection only if properly configured
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth state changed:', event);

    try {
      performanceMonitor.trackUserAction(`auth-${event}`);
    } catch (error) {
      console.warn('Performance monitoring error:', error);
    }

    if (event === 'SIGNED_IN') {
      console.log('User signed in successfully');
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('Auth token refreshed');
    }
  });
}

export const supabase = supabaseClient;

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          address: string;
          type: string;
          status: string;
          rent_amount: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          square_feet: number | null;
          description: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          address: string;
          type: string;
          status?: string;
          rent_amount?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_feet?: number | null;
          description?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          address?: string;
          type?: string;
          status?: string;
          rent_amount?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_feet?: number | null;
          description?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          category: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          message: string;
          category?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          message?: string;
          category?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenants: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          property_id: string | null;
          lease_start: string | null;
          lease_end: string | null;
          income: number | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          property_id?: string | null;
          lease_start?: string | null;
          lease_end?: string | null;
          income?: number | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          property_id?: string | null;
          lease_start?: string | null;
          lease_end?: string | null;
          income?: number | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          tenant_id: string | null;
          amount: number;
          type: string;
          status: string;
          due_date: string;
          stripe_payment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          amount: number;
          type: string;
          status?: string;
          due_date: string;
          stripe_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          amount?: number;
          type?: string;
          status?: string;
          due_date?: string;
          stripe_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      affiliate_links: {
        Row: {
          id: string;
          name: string;
          description: string;
          url: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          url: string;
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          url?: string;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      screening_results: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          score: number;
          recommendation: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          score: number;
          recommendation: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          score?: number;
          recommendation?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      maintenance_requests: {
        Row: {
          id: string;
          tenant_id: string | null;
          property_id: string;
          user_id: string;
          description: string;
          priority: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          property_id: string;
          user_id: string;
          description: string;
          priority?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          property_id?: string;
          user_id?: string;
          description?: string;
          priority?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          subscription_type: string;
          stripe_subscription_id: string | null;
          status: string;
          current_period_start: string;
          current_period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_type?: string;
          stripe_subscription_id?: string | null;
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_type?: string;
          stripe_subscription_id?: string | null;
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      premium_usage_logs: {
        Row: {
          id: string;
          user_id: string;
          feature_type: string;
          api_provider: string;
          usage_count: number;
          month_year: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          feature_type: string;
          api_provider: string;
          usage_count?: number;
          month_year: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          feature_type?: string;
          api_provider?: string;
          usage_count?: number;
          month_year?: string;
          created_at?: string;
        };
      };
    };
  };
};