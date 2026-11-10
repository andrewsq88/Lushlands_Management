import { planSubscriptionSync } from './subscriptionSync.mjs';

type SupabaseLike = {
  from: (table: string) => any;
};

type StripeLike = {
  subscriptions: { retrieve: (id: string) => Promise<any> };
  customers: { retrieve: (id: string) => Promise<any> };
};

async function firstId(query: Promise<{ data: { user_id?: string; id?: string } | { user_id?: string; id?: string }[] | null }>, field: 'user_id' | 'id') {
  const { data } = await query;
  if (!data) return null;
  if (Array.isArray(data)) return data[0]?.[field] ?? null;
  return data[field] ?? null;
}

export async function applySubscriptionEvent(supabase: SupabaseLike, stripe: StripeLike, event: { type: string; data: { object: any } }) {
  const plan = await planSubscriptionSync(event, {
    getSubscription: async (id: string) => {
      try {
        return await stripe.subscriptions.retrieve(id);
      } catch {
        console.error('Could not load Stripe subscription', id);
        return null;
      }
    },
    findUserById: async (id: string) => {
      const fromSubscription = await firstId(
        supabase.from('user_subscriptions').select('user_id').eq('user_id', id).maybeSingle(),
        'user_id',
      );
      if (fromSubscription) return fromSubscription;
      return firstId(supabase.from('users').select('id').eq('id', id).maybeSingle(), 'id');
    },
    findUserByCustomerId: async (customerId: string) => firstId(
      supabase.from('user_subscriptions').select('user_id').eq('stripe_customer_id', customerId).maybeSingle(),
      'user_id',
    ),
    findUserBySubscriptionId: async (subscriptionId: string) => firstId(
      supabase.from('user_subscriptions').select('user_id').eq('stripe_subscription_id', subscriptionId).maybeSingle(),
      'user_id',
    ),
    getStoredSubscription: async (userId: string) => {
      const { data } = await supabase
        .from('user_subscriptions')
        .select('stripe_subscription_id, status, last_stripe_event_created')
        .eq('user_id', userId)
        .maybeSingle();
      return data ?? null;
    },
    findUserByEmail: async (email: string) => firstId(
      supabase.from('users').select('id').eq('email', email).limit(1),
      'id',
    ),
    customerEmail: async (customerId: string) => {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer || customer.deleted || !customer.email) return null;
        return customer.email;
      } catch {
        console.error('Could not load Stripe customer', customerId);
        return null;
      }
    },
  });

  if (plan.op !== 'upsert') {
    console.log('Subscription event ignored:', plan.reason);
    return { applied: false, reason: plan.reason };
  }

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert(plan.row, { onConflict: 'user_id' });

  if (error) {
    console.error('Subscription sync failed:', error);
    throw new Error(error.message ?? 'Subscription sync failed');
  }

  return { applied: true, userId: plan.row.user_id, status: plan.row.status, subscriptionType: plan.row.subscription_type };
}
