import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      console.log('Fetching payments...');
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          tenants (
            name,
            email,
            properties (
              address
            )
          )
        `)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching payments:', error);
        throw error;
      }
      
      console.log('Payments fetched successfully:', data?.length || 0, 'records');
      setPayments(data || []);
    } catch (error) {
      console.error('Error in fetchPayments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async (payment: Omit<PaymentInsert, 'id'>) => {
    try {
      console.log('Adding payment:', payment);
      const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select(`
          *,
          tenants (
            name,
            email,
            properties (
              address
            )
          )
        `)
        .single();

      if (error) {
        console.error('Error adding payment:', error);
        throw error;
      }
      
      console.log('Payment added successfully:', data);
      setPayments(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error in addPayment:', error);
      return { data: null, error };
    }
  };

  const updatePayment = async (id: string, updates: PaymentUpdate) => {
    try {
      console.log('Updating payment:', id, updates);
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          tenants (
            name,
            email,
            properties (
              address
            )
          )
        `)
        .single();

      if (error) {
        console.error('Error updating payment:', error);
        throw error;
      }
      
      console.log('Payment updated successfully:', data);
      setPayments(prev => prev.map(p => p.id === id ? data : p));
      return { data, error: null };
    } catch (error) {
      console.error('Error in updatePayment:', error);
      return { data: null, error };
    }
  };

  const deletePayment = async (id: string) => {
    try {
      console.log('Deleting payment:', id);
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting payment:', error);
        throw error;
      }
      
      console.log('Payment deleted successfully');
      setPayments(prev => prev.filter(p => p.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error in deletePayment:', error);
      return { error };
    }
  };

  const createPaymentRequest = async (paymentData: {
    tenant_id: string;
    amount: number;
    type: string;
    due_date: string;
  }) => {
    try {
      console.log('Creating payment request:', paymentData);
      
      // First create the payment record
      const { data: payment, error: paymentError } = await addPayment(paymentData);
      if (paymentError) {
        console.error('Error creating payment record:', paymentError);
        throw paymentError;
      }

      console.log('Creating Stripe checkout session...');
      // Create Stripe checkout session
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentData.amount * 100, // Convert to cents
          currency: 'usd',
          product_name: `${paymentData.type.charAt(0).toUpperCase() + paymentData.type.slice(1)} Payment`,
          payment_id: payment.data?.id,
          success_url: `${window.location.origin}/payments?success=true`,
          cancel_url: `${window.location.origin}/payments?canceled=true`,
        }),
      });

      console.log('Stripe checkout response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stripe checkout error:', errorText);
        throw new Error('Failed to create payment session');
      }

      const { url } = await response.json();
      console.log('Stripe checkout session created successfully');
      return { url, error: null };
    } catch (error) {
      console.error('Error in createPaymentRequest:', error);
      return { url: null, error };
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const paidPayments = payments.filter(p => p.status === 'paid');

  return {
    payments,
    pendingPayments,
    paidPayments,
    loading,
    addPayment,
    updatePayment,
    deletePayment,
    createPaymentRequest,
    updatePayment,
    refetch: fetchPayments,
  };
}