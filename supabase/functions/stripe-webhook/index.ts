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
        const paymentId = session.metadata?.payment_id;

        if (paymentId) {
          const { error } = await supabase
            .from('payments')
            .update({ 
              status: 'paid',
              stripe_payment_id: session.id 
            })
            .eq('id', paymentId);

          if (error) {
            console.error('Error updating payment:', error);
            return new Response(
              JSON.stringify({ error: 'Failed to update payment' }),
              { status: 500, headers: corsHeaders }
            );
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
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
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const paymentId = paymentIntent.metadata?.payment_id;

        if (paymentId) {
          // Optionally update payment status to failed
          console.log(`Payment failed for payment ID: ${paymentId}`);
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