-- Remove anonymous (signed-out) access to private tables.
--
-- Why: the Supabase security advisor (lint 0026, pg_graphql_anon_table_exposed)
-- reports that the `anon` role can SELECT these tables, so they appear in the
-- public GraphQL schema to anyone holding the public anon key. RLS still
-- filters rows, but signed-out visitors have no reason to see or write them.
--
-- Evidence that no signed-out page needs them (repo main @ 0da06f1):
--   * Signed-out routes render only PublicLanding / AuthForm, which make no
--     table queries (the only call is the handle_new_user_profile RPC, which is
--     a function, not a table grant).
--   * Every .from('<table>') call for these tables lives in signed-in pages
--     (Dashboard, Properties, Tenants, Maintenance, Payments, Subscription...).
--   * Edge functions either use the service role or forward the caller's
--     Authorization header, so they run as `authenticated`, not `anon`.
--
-- Kept on purpose:
--   * affiliate_links keeps anon SELECT: it has an explicit
--     "Affiliate links are public" policy for anon. Only anon's write
--     privileges are removed there. Decide separately whether it should stay public.
--   * All `authenticated` and `service_role` grants and every RLS policy are untouched.
--
-- Idempotent: REVOKE is a no-op when the privilege is already gone, and each
-- table is skipped if it does not exist.

do $$
declare
  t text;
begin
  -- Private tables: anon gets nothing.
  foreach t in array array[
    'feedback',
    'maintenance_requests',
    'payments',
    'premium_usage_logs',
    'properties',
    'screening_results',
    'tenants',
    'user_subscriptions',
    'stripe_customers',
    'stripe_orders',
    'stripe_subscriptions',
    'stripe_user_orders',
    'stripe_user_subscriptions',
    'users'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('revoke all privileges on table public.%I from anon', t);
    end if;
  end loop;

  -- Public read-only table: keep SELECT, drop anon writes.
  if to_regclass('public.affiliate_links') is not null then
    execute 'revoke insert, update, delete, truncate, references, trigger on table public.affiliate_links from anon';
  end if;
end
$$;

-- Rollback (restores the grants that existed on 2026-11-11 before this migration):
-- do $$
-- declare t text;
-- begin
--   foreach t in array array['feedback','maintenance_requests','payments','premium_usage_logs',
--     'properties','screening_results','tenants','user_subscriptions'] loop
--     if to_regclass('public.' || t) is not null then
--       execute format('grant select, insert, update, delete, truncate, references, trigger on table public.%I to anon', t);
--     end if;
--   end loop;
--   foreach t in array array['stripe_customers','stripe_orders','stripe_subscriptions',
--     'stripe_user_orders','stripe_user_subscriptions','users'] loop
--     if to_regclass('public.' || t) is not null then
--       execute format('grant insert, update, delete, truncate, references, trigger on table public.%I to anon', t);
--     end if;
--   end loop;
--   if to_regclass('public.affiliate_links') is not null then
--     execute 'grant insert, update, delete, truncate, references, trigger on table public.affiliate_links to anon';
--   end if;
-- end
-- $$;
