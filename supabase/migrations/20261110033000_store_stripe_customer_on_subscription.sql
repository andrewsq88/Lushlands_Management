/*
  # Store the Stripe customer and the last applied event time

  Checkout sessions carry client_reference_id (the Supabase user id).
  Later subscription events only carry the Stripe customer and subscription
  ids. stripe_customer_id lets those events find the same user.
  last_stripe_event_created lets an older delivery be skipped.

  Depends on 20261110022000_free_tier_property_limit.sql, which allows
  trialing, paused, unpaid, and incomplete_expired to be stored.
  This file does not change the property limit or the status check.
  It does not delete rows.

  Run these read-only checks before applying. Both must be clean:
  duplicate subscription ids must return zero rows, and user_id must
  already have a unique constraint or unique index (the original
  UNIQUE(user_id) does).

    SELECT stripe_subscription_id, count(*) AS rows
    FROM public.user_subscriptions
    WHERE stripe_subscription_id IS NOT NULL
    GROUP BY stripe_subscription_id
    HAVING count(*) > 1;

    SELECT c.conname, pg_get_constraintdef(c.oid) AS definition
    FROM pg_constraint c
    WHERE c.conrelid = 'public.user_subscriptions'::regclass
      AND c.contype = 'u'
      AND pg_get_constraintdef(c.oid) ILIKE '%(user_id)%';

    SELECT indexrelid::regclass AS index_name, pg_get_indexdef(indexrelid) AS definition
    FROM pg_index
    WHERE indrelid = 'public.user_subscriptions'::regclass
      AND indisunique
      AND pg_get_indexdef(indexrelid) ILIKE '%(user_id)%';
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.user_subscriptions
    WHERE stripe_subscription_id IS NOT NULL
    GROUP BY stripe_subscription_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Refusing to continue: duplicate non-null stripe_subscription_id values exist. No rows were deleted.';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.user_subscriptions'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) ILIKE '%(user_id)%'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_index
    WHERE indrelid = 'public.user_subscriptions'::regclass
      AND indisunique
      AND pg_get_indexdef(indexrelid) ILIKE '%(user_id)%'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX user_subscriptions_user_id_key ON public.user_subscriptions (user_id)';
  END IF;
END $$;

ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS last_stripe_event_created timestamptz;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.user_subscriptions
    WHERE stripe_customer_id IS NOT NULL
    GROUP BY stripe_customer_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Refusing to continue: duplicate non-null stripe_customer_id values exist. No rows were deleted.';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id
  ON public.user_subscriptions (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id
  ON public.user_subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
