import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);

        // Update payment status in database if payment_id is in metadata
        const paymentId = paymentIntent.metadata?.payment_id;
        if (paymentId) {
          const { error } = await supabase
            .from('payments')
            .update({ 
              status: 'paid',
              stripe_payment_id: paymentIntent.id 
            })
            .eq('id', paymentId);

          if (error) {
            console.error('Error updating payment:', error);
          } else {
            console.log('Payment updated successfully:', paymentId);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('Payment failed:', paymentIntent.id);

        const paymentId = paymentIntent.metadata?.payment_id;
        if (paymentId) {
          const { error } = await supabase
            .from('payments')
            .update({ 
              status: 'failed',
              stripe_payment_id: paymentIntent.id 
            })
            .eq('id', paymentId);

          if (error) {
            console.error('Error updating failed payment:', error);
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription event:', subscription.id);
        
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

        // Update subscription in database
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
        console.log('Subscription canceled:', subscription.id);
        
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

        // Downgrade to free subscription
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