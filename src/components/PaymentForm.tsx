import React, { useState } from 'react';
import { CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useStripe } from './StripeProvider';

interface PaymentFormProps {
  amount: number;
  description: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function PaymentForm({ 
  amount, 
  description, 
  onSuccess, 
  onError,
  className = ''
}: PaymentFormProps) {
  const { stripe } = useStripe();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    email: '',
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    }
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'number') {
      value = formatCardNumber(value);
    } else if (field === 'expiry') {
      value = formatExpiry(value);
    } else if (field === 'cvc') {
      value = value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setCardData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setCardData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 13) {
      return 'Please enter a valid card number';
    }
    if (!cardData.expiry || cardData.expiry.length < 5) {
      return 'Please enter a valid expiry date';
    }
    if (!cardData.cvc || cardData.cvc.length < 3) {
      return 'Please enter a valid CVC';
    }
    if (!cardData.name.trim()) {
      return 'Please enter the cardholder name';
    }
    if (!cardData.email.trim() || !cardData.email.includes('@')) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setStatus('error');
      onError?.(validationError);
      return;
    }

    setLoading(true);
    setStatus('processing');
    setErrorMessage('');

    try {
      const stripeInstance = await stripe;
      if (!stripeInstance) {
        throw new Error('Stripe failed to load');
      }

      // Create payment intent
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            description
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { client_secret, payment_intent_id } = await response.json();

      // Parse card data
      const [month, year] = cardData.expiry.split('/');
      
      // Confirm payment
      const { error, paymentIntent } = await stripeInstance.confirmCardPayment(client_secret, {
        payment_method: {
          card: {
            number: cardData.number.replace(/\s/g, ''),
            exp_month: parseInt(month),
            exp_year: parseInt('20' + year),
            cvc: cardData.cvc,
          },
          billing_details: {
            name: cardData.name,
            email: cardData.email,
            address: cardData.address,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        setStatus('success');
        onSuccess?.(payment_intent_id);
      } else {
        throw new Error('Payment was not successful');
      }

    } catch (error) {
      console.error('Payment error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Payment failed';
      setErrorMessage(errorMsg);
      setStatus('error');
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Payment Successful
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="h-4 w-4 mr-2" />
            Try Again
          </>
        );
      default:
        return (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ${amount.toFixed(2)}
          </>
        );
    }
  };

  const getButtonColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  if (status === 'success') {
    return (
      <div className={`text-center py-8 ${className}`}>
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Your payment of ${amount.toFixed(2)} has been processed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Payment Summary */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">{description}</span>
          <span className="text-xl font-bold text-gray-900">${amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Error Message */}
      {status === 'error' && errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Card Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <input
            type="text"
            value={cardData.number}
            onChange={(e) => handleInputChange('number', e.target.value)}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              value={cardData.expiry}
              onChange={(e) => handleInputChange('expiry', e.target.value)}
              placeholder="MM/YY"
              maxLength={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVC
            </label>
            <input
              type="text"
              value={cardData.cvc}
              onChange={(e) => handleInputChange('cvc', e.target.value)}
              placeholder="123"
              maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={cardData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="john@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>

        {/* Billing Address */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Billing Address</h4>
          
          <input
            type="text"
            value={cardData.address.line1}
            onChange={(e) => handleInputChange('address.line1', e.target.value)}
            placeholder="Address Line 1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={cardData.address.city}
              onChange={(e) => handleInputChange('address.city', e.target.value)}
              placeholder="City"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            <input
              type="text"
              value={cardData.address.state}
              onChange={(e) => handleInputChange('address.state', e.target.value)}
              placeholder="State"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <input
            type="text"
            value={cardData.address.postal_code}
            onChange={(e) => handleInputChange('address.postal_code', e.target.value)}
            placeholder="ZIP Code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || status === 'success'}
        className={`w-full flex items-center justify-center px-4 py-3 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${getButtonColor()}`}
      >
        {getButtonContent()}
      </button>

      {/* Security Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          🔒 Your payment information is secure and encrypted
        </p>
      </div>
    </form>
  );
}