import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface StripeCheckoutProps {
  amount: number;
  description: string;
  paymentId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function StripeCheckout({ 
  amount, 
  description, 
  paymentId, 
  onSuccess, 
  onError,
  className = ''
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handlePayment = async () => {
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      onError?.('Stripe is not configured');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          product_name: description,
          payment_id: paymentId,
          success_url: `${window.location.origin}/payments?success=true&payment_id=${paymentId}`,
          cancel_url: `${window.location.origin}/payments?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
    } catch (error) {
      console.error('Payment error:', error);
      setStatus('error');
      onError?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      );
    }

    if (status === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Payment Successful
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <XCircle className="h-4 w-4 mr-2" />
          Payment Failed
        </>
      );
    }

    return (
      <>
        <CreditCard className="h-4 w-4 mr-2" />
        Pay ${amount.toFixed(2)}
      </>
    );
  };

  const getButtonColor = () => {
    if (status === 'success') return 'bg-green-600 hover:bg-green-700';
    if (status === 'error') return 'bg-red-600 hover:bg-red-700';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading || status === 'success'}
      className={`inline-flex items-center justify-center px-4 py-2 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${getButtonColor()} ${className}`}
    >
      {getButtonContent()}
    </button>
  );
}