/*
  # Live dropdown updates across tabs and devices

  Realtime postgres_changes reads only the supabase_realtime publication.
  In production that publication currently has no member tables.

  This migration:
  - publishes insert and update only (no delete, no truncate)
  - adds the tables edited by the live dropdowns

  This file is the schema change only. Do not apply it to production
  from the app, a deploy, or a manual SQL session as part of this change.
  The client ignores events until a channel reports SUBSCRIBED.
  Local deletes already update the client store and do not need a
  DELETE event.
*/

alter publication supabase_realtime set (publish = 'insert, update');

do $$
declare
  target text;
begin
  foreach target in array array['properties', 'maintenance_requests', 'payments', 'tenants']
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = target
    ) then
      execute format('alter publication supabase_realtime add table public.%I', target);
    end if;
  end loop;
end $$;

-- Rollback:
-- alter publication supabase_realtime drop table public.properties;
-- alter publication supabase_realtime drop table public.maintenance_requests;
-- alter publication supabase_realtime drop table public.payments;
-- alter publication supabase_realtime drop table public.tenants;
-- alter publication supabase_realtime set (publish = 'insert, update, delete, truncate');
