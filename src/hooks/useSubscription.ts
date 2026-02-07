import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row'];
type PremiumUsageLog = Database['public']['Tables']['premium_usage_logs']['Row'];

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usageLimits, setUsageLimits] = useState({
    audioUsed: 0,
    videoUsed: 0,
    audioLimit: 5,
    videoLimit: 1
  });
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      console.log('Fetching user subscription data...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setSubscription(null);
        return;
      }

      console.log('Fetching subscription for user:', user.id);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no subscription exists, create a free one
        if (error.code === 'PGRST116') {
          console.log('No subscription found, creating free subscription...');
          const { data: newSub, error: createError } = await supabase
            .from('user_subscriptions')
            .insert([{
              user_id: user.id,
              subscription_type: 'free',
              status: 'active'
            }])
            .select()
            .single();

          if (createError) {
            console.error('Error creating free subscription:', createError);
            throw createError;
          }
          console.log('Free subscription created successfully:', newSub);
          setSubscription(newSub);
        } else {
          console.error('Error fetching subscription:', error);
          throw error;
        }
      } else {
        console.log('Subscription fetched successfully:', data);
        setSubscription(data);
      }

      // Fetch current month usage for free users
      if (!data || data.subscription_type === 'free') {
        await fetchUsageLimits(user.id);
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageLimits = async (userId: string) => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      const { data: usageLogs, error } = await supabase
        .from('premium_usage_logs')
        .select('feature_type, usage_count')
        .eq('user_id', userId)
        .eq('month_year', currentMonth);

      if (error) {
        console.error('Error fetching usage limits:', error);
        return;
      }

      const audioUsed = usageLogs
        ?.filter(log => log.feature_type === 'voiceover')
        .reduce((sum, log) => sum + log.usage_count, 0) || 0;

      const videoUsed = usageLogs
        ?.filter(log => log.feature_type === 'video')
        .reduce((sum, log) => sum + log.usage_count, 0) || 0;

      setUsageLimits({
        audioUsed,
        videoUsed,
        audioLimit: 5,
        videoLimit: 1
      });

      console.log('Usage limits updated:', { audioUsed, videoUsed });
    } catch (error) {
      console.error('Error in fetchUsageLimits:', error);
    }
  };

  const createPremiumSubscription = async () => {
    try {
      console.log('Initiating premium subscription upgrade...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated for premium upgrade');
        throw new Error('User not authenticated');
      }

      // The provided Stripe Payment Link for premium subscription
      const paymentLinkUrl = 'https://buy.stripe.com/eVqbJ25Nr3f98FJbuA6Na00';

      console.log('Redirecting to Stripe Payment Link:', paymentLinkUrl);
      console.log('User ID for subscription:', user.id);
      
      // Redirect the user directly to the Stripe Payment Link
      window.location.href = paymentLinkUrl;
      
      // No return value is needed as the page will redirect
    } catch (error) {
      console.error('Error redirecting to Stripe Payment Link:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error; // Re-throw for the component to catch and display an error message
    }
  };

  const cancelSubscription = async () => {
    try {
      console.log('Initiating subscription cancellation...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated for cancellation');
        throw new Error('User not authenticated');
      }

      console.log('Calling cancel subscription function for user:', user.id);
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to cancel subscription:', errorText);
        throw new Error('Failed to cancel subscription');
      }

      const result = await response.json();
      console.log('Subscription cancellation result:', result);

      await fetchSubscription();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  };

  const logPremiumUsage = async (featureType: 'voiceover' | 'video', apiProvider: 'eleven_labs' | 'tavus') => {
    try {
      console.log('Logging premium usage:', { featureType, apiProvider });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated for usage logging');
        throw new Error('User not authenticated');
      }

      const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM format

      const { error } = await supabase
        .from('premium_usage_logs')
        .insert([{
          user_id: user.id,
          feature_type: featureType,
          api_provider: apiProvider,
          month_year: monthYear,
          usage_count: 1
        }]);

      if (error) {
        console.error('Error logging premium usage:', error);
        throw error;
      }
      console.log('Premium usage logged successfully');

      // Update local usage limits for free users
      if (subscription?.subscription_type === 'free') {
        await fetchUsageLimits(user.id);
      }
    } catch (error) {
      console.error('Error in logPremiumUsage:', error);
    }
  };

  const canUseFeature = (featureType: 'voiceover' | 'video'): boolean => {
    if (isPremium) return true; // Premium users have unlimited access
    
    if (featureType === 'voiceover') {
      return usageLimits.audioUsed < usageLimits.audioLimit;
    } else {
      return usageLimits.videoUsed < usageLimits.videoLimit;
    }
  };

  const getRemainingUsage = (featureType: 'voiceover' | 'video'): number => {
    if (isPremium) return -1; // Unlimited for premium users
    
    if (featureType === 'voiceover') {
      return Math.max(0, usageLimits.audioLimit - usageLimits.audioUsed);
    } else {
      return Math.max(0, usageLimits.videoLimit - usageLimits.videoUsed);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const isPremium = subscription?.subscription_type === 'premium' && subscription?.status === 'active';
  const isActive = subscription?.status === 'active';

  console.log('Subscription status:', { isPremium, isActive, subscription, usageLimits });

  return {
    subscription,
    usageLimits,
    loading,
    isPremium,
    isActive,
    canUseFeature,
    getRemainingUsage,
    createPremiumSubscription,
    cancelSubscription,
    logPremiumUsage,
    refetch: fetchSubscription,
  };
}