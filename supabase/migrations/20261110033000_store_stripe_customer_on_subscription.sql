/*
  # Store the Stripe customer on the subscription row

  Checkout sessions carry client_reference_id (the Supabase user id).
  Later subscription events only carry the Stripe customer and subscription
  ids. This column lets those events find the same user.

  Depends on 20261110022000_free_tier_property_limit.sql, which allows
  trialing, paused, unpaid, and incomplete_expired to be stored.
  This file does not change the property limit or the status check.
*/

ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id
  ON public.user_subscriptions (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id
  ON public.user_subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
