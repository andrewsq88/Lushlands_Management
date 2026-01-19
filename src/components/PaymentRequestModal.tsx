import React, { useState } from 'react';
import { X, Send, ExternalLink, CreditCard, DollarSign } from 'lucide-react';
import { usePayments } from '../hooks/usePayments';
import { useTenants } from '../hooks/useTenants';
import { PaymentForm } from './PaymentForm';

interface PaymentRequestModalProps {
  onClose: () => void;
}

export function PaymentRequestModal({ onClose }: PaymentRequestModalProps) {
  const { createPaymentRequest, addPayment } = usePayments();
  const { tenants } = useTenants();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [createdPayment, setCreatedPayment] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'link' | 'direct'>('link');
  const [showDirectPayment, setShowDirectPayment] = useState(false);
  
  const [formData, setFormData] = useState({
    tenant_id: '',
    amount: '',
    type: 'rent',
    due_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (paymentMethod === 'link') {
        // Create payment link
        const { url, error } = await createPaymentRequest({
          tenant_id: formData.tenant_id,
          amount: Number(formData.amount),
          type: formData.type,
          due_date: formData.due_date,
        });

        if (error) {
          setError(error.message || 'Failed to create payment request');
        } else if (url) {
          setPaymentUrl(url);
        }
      } else {
        // Create payment for direct checkout
        const paymentData = {
          tenant_id: formData.tenant_id,
          amount: Number(formData.amount),
          type: formData.type,
          due_date: formData.due_date,
          status: 'pending',
        };

        const { data, error } = await addPayment(paymentData);
        if (error) {
          setError(error.message || 'Failed to create payment');
        } else {
          setCreatedPayment(data);
          setShowDirectPayment(true);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectPaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Update payment with Stripe payment ID
      await updatePayment(createdPayment.id, {
        status: 'paid',
        stripe_payment_id: paymentIntentId
      });
      onClose();
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const selectedTenant = tenants.find(t => t.id === formData.tenant_id);

  // Show direct payment form
  if (showDirectPayment && createdPayment) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Payment Details</h4>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Tenant:</span>
                    <span className="font-medium">{selectedTenant?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium capitalize">{formData.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="font-medium">{new Date(formData.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <PaymentForm
              amount={Number(formData.amount)}
              description={`${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Payment for ${selectedTenant?.name}`}
              onSuccess={handleDirectPaymentSuccess}
              onError={(error) => setError(error)}
            />
          </div>
        </div>
      </div>
    );
  }
  // Show payment link success
  if (paymentUrl) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Payment Request Created</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Payment Link Generated</h4>
            <p className="text-gray-600 mb-6">
              Share this secure payment link with {selectedTenant?.name}
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-2">Payment URL:</p>
              <div className="flex items-center justify-between bg-white p-2 rounded border">
                <span className="text-sm text-gray-900 truncate">{paymentUrl}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(paymentUrl)}
                  className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Link
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Send Payment Request</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('link')}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  paymentMethod === 'link'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Send className="h-4 w-4 mx-auto mb-1" />
                Send Link
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('direct')}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  paymentMethod === 'direct'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="h-4 w-4 mx-auto mb-1" />
                Pay Now
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="tenant_id" className="block text-sm font-medium text-gray-700 mb-2">
              Tenant *
            </label>
            <select
              id="tenant_id"
              name="tenant_id"
              required
              value={formData.tenant_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} - {tenant.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Type *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="rent">Rent</option>
                <option value="mortgage">Mortgage</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1500.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              required
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : paymentMethod === 'link' ? (
                <Send className="h-4 w-4 mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Creating...' : paymentMethod === 'link' ? 'Create Payment Link' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}