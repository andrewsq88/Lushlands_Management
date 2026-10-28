import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!endpointSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : String(err));
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription' && session.subscription) {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            typeof session.subscription === 'string' ? session.subscription : session.subscription.id
          );

          let userEmail = session.customer_email;
          if (!userEmail && session.customer) {
            const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
            const customer = await stripe.customers.retrieve(customerId);
            if (!customer.deleted && 'email' in customer) {
              userEmail = customer.email;
            }
          }

          if (!userEmail) {
            console.error('No email found for checkout session:', session.id);
            break;
          }

          const { data: users, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', userEmail)
            .limit(1);

          if (userError || !users || users.length === 0) {
            console.error('User not found for email:', userEmail);
            break;
          }

          const { error: subError } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: users[0].id,
              subscription_type: 'premium',
              stripe_subscription_id: stripeSubscription.id,
              status: stripeSubscription.status,
              current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            });

          if (subError) {
            console.error('Error updating subscription:', subError);
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

        const customer = await stripe.customers.retrieve(customerId);

        if (customer.deleted || !('email' in customer) || !customer.email) {
          console.error('Customer not found or no email');
          break;
        }

        const { data: users, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', customer.email)
          .limit(1);

        if (userError || !users || users.length === 0) {
          console.error('User not found for email:', customer.email);
          break;
        }

        const { error } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: users[0].id,
            subscription_type: 'premium',
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });

        if (error) {
          console.error('Error updating subscription:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

        const customer = await stripe.customers.retrieve(customerId);

        if (customer.deleted || !('email' in customer) || !customer.email) {
          console.error('Customer not found or no email');
          break;
        }

        const { data: users, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', customer.email)
          .limit(1);

        if (userError || !users || users.length === 0) {
          console.error('User not found for email:', customer.email);
          break;
        }

        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            subscription_type: 'free',
            status: 'canceled',
            stripe_subscription_id: null,
          })
          .eq('user_id', users[0].id);

        if (error) {
          console.error('Error canceling subscription:', error);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id;
          const { error } = await supabase
            .from('user_subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subId);

          if (error) {
            console.error('Error updating subscription status:', error);
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
      JSON.stringify({ error: error instanceof Error ? error.message : 'Webhook processing failed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
