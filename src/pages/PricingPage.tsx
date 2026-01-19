import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PricingCard } from '../components/PricingCard';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { useAuth } from '../hooks/useAuth';

export function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock premium features and take your property management to the next level
          </p>
        </div>

        <div className="flex justify-center">
          <div className="max-w-md">
            {STRIPE_PRODUCTS.map((product) => (
              <PricingCard
                key={product.id}
                product={product}
                isPopular={true}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              What's Included in Premium
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Advanced Analytics</h4>
                    <p className="text-gray-600">Detailed insights into your property performance</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Priority Support</h4>
                    <p className="text-gray-600">Get help when you need it most</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Unlimited Properties</h4>
                    <p className="text-gray-600">Manage as many properties as you need</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Advanced Features</h4>
                    <p className="text-gray-600">Access to all premium tools and integrations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}