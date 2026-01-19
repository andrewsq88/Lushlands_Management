import React from 'react';
import { Crown, User } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

export function SubscriptionBadge() {
  const { subscription, loading, isPremium } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
        <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
      isPremium 
        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800' 
        : 'bg-gray-100 text-gray-700'
    }`}>
      {isPremium ? (
        <Crown className="w-4 h-4" />
      ) : (
        <User className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isPremium ? 'Premium' : 'Free'}
      </span>
    </div>
  );
}