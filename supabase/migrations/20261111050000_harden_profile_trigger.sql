-- Tidy up the sign-up profile functions.
--
-- 1. Drop the old no-argument public.handle_new_user_profile().
--    It is an empty stub (it only returns NEW). Checked on 2026-11-11: no
--    trigger, event trigger, view, policy, other function, pg_depend entry,
--    app code or edge function uses it. The 4-argument RPC
--    handle_new_user_profile(uuid,text,text,text) is a different function and
--    is NOT touched here.
--
-- 2. Stop silently swallowing duplicate-email clashes in
--    public.handle_new_user_profile_from_auth().
--    Before: INSERT ... ON CONFLICT DO NOTHING (any unique clash ignored silently).
--    Now:    INSERT ... ON CONFLICT (id) DO NOTHING (same user twice is a no-op),
--            and if the email already belongs to a different profile the clash
--            is caught and logged with RAISE WARNING (user ids only, no email).
--            Any other unexpected error is also logged rather than raised, so a
--            profile problem can never block an auth sign-up.
--    Same security as before: SECURITY DEFINER, owner postgres,
--    search_path = public, pg_temp, no EXECUTE for public/anon/authenticated.
--
-- Idempotent: safe to run more than once.

drop function if exists public.handle_new_user_profile();

create or replace function public.handle_new_user_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  clash_id uuid;
begin
  if new.email is null then
    return new;
  end if;

  select u.id into clash_id
  from public.users u
  where u.email = new.email and u.id <> new.id
  limit 1;

  if clash_id is not null then
    raise warning 'handle_new_user_profile_from_auth: no profile created for auth user %, email already used by profile %', new.id, clash_id;
    return new;
  end if;

  begin
    insert into public.users (id, email, first_name, last_name)
    values (
      new.id,
      new.email,
      coalesce(btrim(new.raw_user_meta_data ->> 'first_name'), ''),
      coalesce(btrim(new.raw_user_meta_data ->> 'last_name'), '')
    )
    on conflict (id) do nothing;
  exception
    when unique_violation then
      raise warning 'handle_new_user_profile_from_auth: no profile created for auth user %, email clash (concurrent insert)', new.id;
    when others then
      raise warning 'handle_new_user_profile_from_auth: no profile created for auth user %, SQLSTATE %', new.id, sqlstate;
  end;

  return new;
end;
$$;

alter function public.handle_new_user_profile_from_auth() owner to postgres;
revoke all on function public.handle_new_user_profile_from_auth() from public, anon, authenticated;

-- Rollback (idempotent; run manually if this must be undone). Restores the
-- previous trigger function body and the old no-argument stub with its grants:
--
-- create or replace function public.handle_new_user_profile_from_auth()
-- returns trigger
-- language plpgsql
-- security definer
-- set search_path = public, pg_temp
-- as $$
-- begin
--   if new.email is not null then
--     insert into public.users (id, email, first_name, last_name)
--     values (
--       new.id,
--       new.email,
--       coalesce(btrim(new.raw_user_meta_data ->> 'first_name'), ''),
--       coalesce(btrim(new.raw_user_meta_data ->> 'last_name'), '')
--     )
--     on conflict do nothing;
--   end if;
--   return new;
-- end;
-- $$;
-- alter function public.handle_new_user_profile_from_auth() owner to postgres;
-- revoke all on function public.handle_new_user_profile_from_auth() from public, anon, authenticated;
--
-- create or replace function public.handle_new_user_profile()
-- returns trigger
-- language plpgsql
-- security definer
-- set search_path to 'public', 'auth'
-- as $$
-- begin
--   set search_path = '';
--   -- function logic goes here
--   return new;
-- end;
-- $$;
-- alter function public.handle_new_user_profile() owner to postgres;
-- revoke all on function public.handle_new_user_profile() from public, anon, authenticated;
-- grant execute on function public.handle_new_user_profile() to service_role;
