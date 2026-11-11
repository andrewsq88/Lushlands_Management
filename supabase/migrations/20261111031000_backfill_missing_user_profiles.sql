-- Backfill the public.users profile row for auth users that have none.
--
-- Found by a read-only query on 2026-11-11: exactly one auth user has no
-- public.users row. Explicit id list on purpose; nothing else is touched.
-- Insert only: no UPDATE, no DELETE. Names are not stored in that user's
-- auth metadata, so they fall back to '' (the columns are NOT NULL) and can be
-- filled in from the app's profile page.
--
-- Idempotent: ON CONFLICT DO NOTHING, so re-running is a no-op.

insert into public.users (id, email, first_name, last_name)
select
  u.id,
  u.email,
  coalesce(btrim(u.raw_user_meta_data ->> 'first_name'), ''),
  coalesce(btrim(u.raw_user_meta_data ->> 'last_name'), '')
from auth.users u
where u.id in (
  '9e2985f3-5eb5-4c81-af98-b4baa6b84b85'::uuid
)
  and u.email is not null
on conflict do nothing;

-- Rollback (idempotent; removes only the backfilled row, and only while it is
-- still exactly as inserted here, i.e. names never filled in; no other table
-- references public.users):
--
-- delete from public.users
-- where id in ('9e2985f3-5eb5-4c81-af98-b4baa6b84b85'::uuid)
--   and first_name = '' and last_name = '';
