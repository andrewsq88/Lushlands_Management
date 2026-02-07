import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { StripeProduct } from '../stripe-config';

interface PricingCardProps {
  product: StripeProduct;
  isPopular?: boolean;
  onSubscribe: (priceId: string) => Promise<void>;
}

export function PricingCard({ product, isPopular = false, onSubscribe }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await onSubscribe(product.priceId);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price);
  };

  return (
    <div className={`relative rounded-2xl p-8 ${
      isPopular 
        ? 'bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-2xl scale-105' 
        : 'bg-white border border-gray-200 shadow-lg'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center">
        <h3 className={`text-2xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-gray-900'}`}>
          {product.name}
        </h3>
        <p className={`mb-6 ${isPopular ? 'text-blue-100' : 'text-gray-600'}`}>
          {product.description}
        </p>
        
        <div className="mb-8">
          <span className={`text-5xl font-bold ${isPopular ? 'text-white' : 'text-gray-900'}`}>
            {formatPrice(product.price, product.currency)}
          </span>
          <span className={`text-lg ${isPopular ? 'text-blue-100' : 'text-gray-600'}`}>
            /{product.mode === 'subscription' ? 'month' : 'one-time'}
          </span>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
            isPopular
              ? 'bg-white text-blue-600 hover:bg-gray-100 shadow-lg'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
          } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Subscribe to ${product.name}`
          )}
        </button>
      </div>
    </div>
  );
}