-- Create the public.users profile row automatically when someone signs up.
--
-- Why: the app's sign-up calls the RPC public.handle_new_user_profile(uuid,text,text,text)
-- right after supabase.auth.signUp(). Nobody but postgres and service_role may
-- EXECUTE that function, so the call fails with "permission denied" and new
-- accounts end up without a profile row. We do NOT want to open that function to
-- anon (it lets a caller write a profile for any user id), so the profile is
-- now created by a SECURITY DEFINER trigger on auth.users instead, the same way
-- user_subscriptions is already created by on_auth_user_created.
--
-- What this does:
--   1. Adds public.handle_new_user_profile_from_auth(), an AFTER INSERT trigger
--      function that inserts (id, email, first_name, last_name) into public.users
--      from NEW.id, NEW.email and NEW.raw_user_meta_data ->> 'first_name' / 'last_name'.
--      These are the same columns the RPC sets. Names fall back to '' because the
--      columns are NOT NULL. Rows without an email are skipped (email is NOT NULL).
--      ON CONFLICT DO NOTHING (no target) so neither a duplicate id nor a duplicate
--      email can ever make a sign-up fail.
--   2. Adds trigger on_auth_user_created_profile on auth.users. The existing
--      on_auth_user_created trigger / handle_new_user_subscription() are untouched.
--   3. Makes the RPC handle_new_user_profile(uuid,text,text,text) idempotent
--      (ON CONFLICT DO NOTHING). Its EXECUTE grants stay postgres + service_role only.
--
-- Idempotent: safe to run more than once.

create or replace function public.handle_new_user_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.email is not null then
    insert into public.users (id, email, first_name, last_name)
    values (
      new.id,
      new.email,
      coalesce(btrim(new.raw_user_meta_data ->> 'first_name'), ''),
      coalesce(btrim(new.raw_user_meta_data ->> 'last_name'), '')
    )
    on conflict do nothing;
  end if;
  return new;
end;
$$;

alter function public.handle_new_user_profile_from_auth() owner to postgres;
revoke all on function public.handle_new_user_profile_from_auth() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile_from_auth();

create or replace function public.handle_new_user_profile(user_id uuid, user_email text, first_name text, last_name text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.users (id, email, first_name, last_name)
  values (user_id, user_email, first_name, last_name)
  on conflict do nothing;
end;
$$;

alter function public.handle_new_user_profile(uuid, text, text, text) owner to postgres;
revoke all on function public.handle_new_user_profile(uuid, text, text, text) from public, anon, authenticated;

-- Rollback (idempotent; run manually if this must be undone):
--
-- drop trigger if exists on_auth_user_created_profile on auth.users;
-- drop function if exists public.handle_new_user_profile_from_auth();
-- create or replace function public.handle_new_user_profile(user_id uuid, user_email text, first_name text, last_name text)
-- returns void
-- language plpgsql
-- security definer
-- set search_path = public, pg_temp
-- as $$
-- begin
--   insert into public.users (id, email, first_name, last_name)
--   values (user_id, user_email, first_name, last_name);
-- end;
-- $$;
