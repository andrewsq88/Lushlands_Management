import React, { useState } from 'react';
import { Crown, Check, Mic, Video, Sparkles, Loader2 } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

export function UpgradeToPremium() {
  const { createPremiumSubscription, isPremium } = useSubscription();
  const [loading, setLoading] = useState(false);

  // Don't show upgrade component for premium users
  if (isPremium) {
    return null;
  }

  const handleUpgrade = async () => {
    console.log('Premium upgrade initiated by user');
    setLoading(true);
    
    try {
      console.log('Calling createPremiumSubscription...');
      // Call the function that handles the direct redirect to Stripe
      await createPremiumSubscription();
      console.log('Premium subscription creation initiated successfully');
      console.log('User should be redirected to Stripe Payment Link');
      
      // Show user-friendly message about the redirect
      alert('Redirecting to Stripe for premium upgrade!');
      
      // The page will redirect, so setLoading(false) is not strictly necessary here
    } catch (error) {
      console.error('Premium upgrade failed:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Display user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during upgrade.';
      alert('Error: ' + errorMessage);
      
      setLoading(false); // Set loading to false if the redirect fails
    }
  };

  const features = [
    {
      icon: <Mic className="h-5 w-5" />,
      title: 'Unlimited AI Voiceovers',
      description: 'Convert unlimited property descriptions and maintenance updates to professional voiceovers'
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Advanced Property Analytics',
      description: 'Get detailed insights and analytics for your property portfolio performance'
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Enhanced Accessibility',
      description: 'Make your property management more accessible with unlimited voice features'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm border-2 border-yellow-200">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Crown className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-gray-900">Upgrade to Premium</h2>
            <p className="text-sm text-gray-600">Unlock unlimited AI-powered voice and video features</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0 p-1 bg-yellow-100 rounded-full text-yellow-600 mr-3 mt-0.5">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg p-4 border border-yellow-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">$15</span>
                <span className="text-gray-600 ml-1">/month</span>
              </div>
              <p className="text-sm text-gray-600">Billed monthly, cancel anytime</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-green-600 text-sm font-medium">
                <Check className="h-4 w-4 mr-1" />
                30-day free trial
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Redirecting to Stripe...
            </>
          ) : (
            <>
              <Crown className="h-5 w-5 mr-2" />
              Start Free Trial
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-3">
          No commitment. Cancel anytime. Secure payment powered by Stripe.
        </p>
      </div>
    </div>
  );
}