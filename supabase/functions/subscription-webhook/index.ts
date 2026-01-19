import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature!, endpointSecret!);
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Check if this is a subscription checkout
        if (session.mode === 'subscription' && session.customer_email) {
          console.log('Processing subscription checkout for:', session.customer_email);
          
          // Find user by email
          const { data: users, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.customer_email)
            .limit(1);

          if (userError || !users || users.length === 0) {
            console.error('User not found for email:', session.customer_email);
            break;
          }

          const userId = users[0].id;
          
          // Update user subscription to premium
          const { error: subError } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: userId,
              subscription_type: 'premium',
              stripe_subscription_id: session.subscription,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            });

          if (subError) {
            console.error('Error updating subscription:', subError);
          } else {
            console.log('Successfully upgraded user to premium:', userId);
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        if (customer.deleted || !customer.email) {
          console.error('Customer not found or no email');
          break;
        }

        // Find user by email
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', customer.email)
          .limit(1);

        if (userError || !users || users.length === 0) {
          console.error('User not found for email:', customer.email);
          break;
        }

        const userId = users[0].id;

        const { error } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            subscription_type: 'premium',
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });

        if (error) {
          console.error('Error updating subscription:', error);
        } else {
          console.log('Successfully updated subscription for user:', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        if (customer.deleted || !customer.email) {
          console.error('Customer not found or no email');
          break;
        }

        // Find user by email
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', customer.email)
          .limit(1);

        if (userError || !users || users.length === 0) {
          console.error('User not found for email:', customer.email);
          break;
        }

        const userId = users[0].id;

        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            subscription_type: 'free',
            status: 'canceled',
            stripe_subscription_id: null,
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Error canceling subscription:', error);
        } else {
          console.log('Successfully canceled subscription for user:', userId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          const { error } = await supabase
            .from('user_subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);

          if (error) {
            console.error('Error updating subscription status:', error);
          } else {
            console.log('Updated subscription to past_due for:', subscriptionId);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});