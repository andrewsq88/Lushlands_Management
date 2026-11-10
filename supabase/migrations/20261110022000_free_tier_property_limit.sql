/*
  # Free-tier property limit

  Free accounts (anyone who is not an active Lushlands Premium subscriber)
  may insert at most 5 properties. Monthly Premium is unlimited.

  Premium uses the same server-side signal as the AI usage check
  (supabase/functions/_shared/usage.ts) and the client hook
  (src/hooks/useSubscription.ts):

    user_subscriptions.subscription_type = 'premium'
    AND user_subscriptions.status = 'active'

  That row is written by the Stripe subscription webhooks and the
  create-subscription function. A missing row, or any other status
  (free, canceled, past_due, incomplete), is treated as free.

  Existing rows are not deleted, hidden, or locked. This is a BEFORE INSERT
  trigger only, so UPDATE and DELETE of properties a free account already
  has continue to follow the existing RLS policies. Those policies are not
  changed.

  The count is checked inside the trigger, so a direct insert through the
  API is rejected even when the caller bypasses the UI. An advisory lock
  per owner stops two concurrent inserts from both passing a count of 4.
*/

CREATE OR REPLACE FUNCTION public.enforce_free_property_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  property_count integer;
  is_premium boolean;
BEGIN
  -- One inserter at a time per owner, for the rest of this transaction.
  PERFORM pg_advisory_xact_lock(hashtext(NEW.user_id::text)::bigint);

  SELECT EXISTS (
    SELECT 1
    FROM public.user_subscriptions
    WHERE user_id = NEW.user_id
      AND subscription_type = 'premium'
      AND status = 'active'
  )
  INTO is_premium;

  IF is_premium THEN
    RETURN NEW;
  END IF;

  SELECT count(*)::integer
  INTO property_count
  FROM public.properties
  WHERE user_id = NEW.user_id;

  IF property_count >= 5 THEN
    RAISE EXCEPTION
      'Free accounts can have up to 5 properties. Upgrade to Lushlands Premium to add more.'
      USING
        ERRCODE = 'P0001',
        HINT = 'FREE_PROPERTY_LIMIT';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_free_property_limit() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_free_property_limit() FROM anon, authenticated;

DROP TRIGGER IF EXISTS enforce_free_property_limit ON public.properties;

CREATE TRIGGER enforce_free_property_limit
  BEFORE INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_free_property_limit();
