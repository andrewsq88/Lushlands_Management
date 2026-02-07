import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Subscription {
  id: string;
  subscription_type: 'free' | 'premium';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = Boolean(
    subscription &&
    subscription.subscription_type === 'premium' &&
    subscription.status === 'active'
  );

  const getRemainingUsage = (featureType: string): number => {
    try {
      if (!user) return 0;

      if (isPremium) {
        return Infinity;
      }

      const limits: Record<string, number> = {
        voiceover: 5,
        video: 2
      };

      return limits[featureType] || 0;
    } catch (error) {
      console.error('Error getting remaining usage:', error);
      return 0;
    }
  };

  const canUseFeature = (featureType: string): boolean => {
    try {
      if (!user) return false;

      if (isPremium) {
        return true;
      }

      return getRemainingUsage(featureType) > 0;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  };

  const logPremiumUsage = async (featureType: string, apiProvider: string): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('premium_usage')
        .insert({
          user_id: user.id,
          feature_type: featureType,
          api_provider: apiProvider
        });

      if (error) {
        console.error('Error logging premium usage:', error);
      }
    } catch (error) {
      console.error('Error logging premium usage:', error);
    }
  };

  return {
    subscription,
    loading,
    isPremium,
    refetch: fetchSubscription,
    getRemainingUsage,
    canUseFeature,
    logPremiumUsage
  };
}