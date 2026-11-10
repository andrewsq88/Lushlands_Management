import { useEffect, useSyncExternalStore } from 'react';
import { paymentsCollection } from '../lib/collections';
import type { Payment } from '../lib/collections';
import { createLoader } from '../lib/liveCollection';
import { commitOptimistic } from '../lib/optimisticUpdate';
import { retainRealtime } from '../lib/realtime';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

const paymentSelect = `
  *,
  tenants (
    name,
    email,
    properties (
      address
    )
  )
`;

const loadPayments = createLoader(
  paymentsCollection,
  async () => {
    const { data, error } = await supabase
      .from('payments')
      .select(paymentSelect)
      .order('due_date', { ascending: true });
    return { data: data as Payment[] | null, error };
  },
  'Error fetching payments:',
);

paymentsCollection.setDirtyFlush(() => {
  void loadPayments(true);
});

function onPaymentsChange() {
  if (paymentsCollection.hasInflightWrites()) {
    paymentsCollection.markDirty();
    return;
  }
  void loadPayments(true);
}

export function usePayments() {
  const { items: payments, loading } = useSyncExternalStore(
    paymentsCollection.subscribe,
    paymentsCollection.getSnapshot,
    paymentsCollection.getSnapshot,
  );

  useEffect(() => {
    void loadPayments();
    return retainRealtime('payments', onPaymentsChange);
  }, []);

  const addPayment = async (payment: Omit<PaymentInsert, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select(paymentSelect)
        .single();

      if (error) throw error;
      paymentsCollection.upsert(data as Payment);
      return { data, error: null };
    } catch (error) {
      console.error('Error in addPayment:', error);
      return { data: null, error };
    }
  };

  const updatePayment = (id: string, updates: PaymentUpdate) => {
    return commitOptimistic(
      paymentsCollection,
      id,
      updates,
      async () => {
        try {
          const { data, error } = await supabase
            .from('payments')
            .update(updates)
            .eq('id', id)
            .select(paymentSelect)
            .single();
          if (error || !data) return { data: null, error: error ?? new Error('Payment update failed') };
          return { data: data as Payment, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      "Couldn't update the payment. The previous value was restored.",
    );
  };

  const deletePayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      paymentsCollection.remove(id);
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

      const { data: payment, error: paymentError } = await addPayment(paymentData);
      if (paymentError) {
        console.error('Error creating payment record:', paymentError);
        throw paymentError;
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
          amount: paymentData.amount * 100, // Convert to cents
          currency: 'usd',
          product_name: `${paymentData.type.charAt(0).toUpperCase() + paymentData.type.slice(1)} Payment`,
          payment_id: payment?.id,
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

  const pendingPayments = payments.filter((payment) => payment.status === 'pending');
  const paidPayments = payments.filter((payment) => payment.status === 'paid');

  return {
    payments,
    pendingPayments,
    paidPayments,
    loading,
    addPayment,
    updatePayment,
    deletePayment,
    createPaymentRequest,
    refetch: () => loadPayments(true),
  };
}
