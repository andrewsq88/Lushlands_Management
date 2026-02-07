import React, { useState } from 'react';
import { Crown, Check, X, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { PaymentForm } from './PaymentForm';

export function SubscriptionManager() {
  const { subscription, isPremium, createPremiumSubscription, cancelSubscription, loading } = useSubscription();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleUpgrade = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setActionLoading(true);
    try {
      await createPremiumSubscription();
      setShowPaymentForm(false);
    } catch (error) {
      console.error('Subscription upgrade failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel your premium subscription? You will lose access to premium features at the end of your billing period.')) {
      setActionLoading(true);
      try {
        await cancelSubscription();
      } catch (error) {
        console.error('Subscription cancellation failed:', error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const features = [
    'Unlimited AI Voiceovers',
    'Advanced Property Analytics',
    'Priority Customer Support',
    'Custom Branding Options',
    'Advanced Reporting'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
        <p className="mt-2 text-gray-600">Manage your LushLands Management subscription</p>
      </div>

      {/* Current Subscription Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${isPremium ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              <Crown className={`h-6 w-6 ${isPremium ? 'text-yellow-600' : 'text-gray-400'}`} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isPremium ? 'Premium Plan' : 'Free Plan'}
              </h3>
              <p className="text-sm text-gray-600">
                {isPremium 
                  ? 'You have access to all premium features'
                  : 'Limited access to basic features'
                }
              </p>
              {subscription && (
                <p className="text-xs text-gray-500 mt-1">
                  Status: {subscription.status} | 
                  {subscription.current_period_end && (
                    ` Renews: ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  )}
                </p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {isPremium ? '$15' : '$0'}
              <span className="text-sm font-normal text-gray-600">/month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <div className={`p-1 rounded-full ${isPremium ? 'bg-green-100' : 'bg-gray-100'}`}>
                {isPremium ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <span className={`ml-3 text-sm ${isPremium ? 'text-gray-900' : 'text-gray-500'}`}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Subscription</h3>
        
        {!isPremium ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Crown className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Upgrade to Premium</h4>
                  <p className="text-sm text-yellow-700">
                    Unlock unlimited AI features and advanced property management tools
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleUpgrade}
              disabled={actionLoading}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {actionLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-5 w-5 mr-2" />
              )}
              Upgrade to Premium - $15/month
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-green-800">Premium Active</h4>
                  <p className="text-sm text-green-700">
                    You have access to all premium features and unlimited usage
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Cancel Subscription
            </button>
          </div>
        )}
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upgrade to Premium</h3>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <PaymentForm
                amount={15}
                description="Premium Subscription - Monthly"
                onSuccess={handlePaymentSuccess}
                onError={(error) => {
                  console.error('Payment error:', error);
                  // Handle payment error
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}