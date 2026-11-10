/*
  # Live dropdown updates across tabs and devices

  Adds the tables edited by the status, priority, type, and property
  dropdowns to the supabase_realtime publication.

  This file is the schema change only. Do not apply it to production
  from the app, a deploy, or a manual SQL session as part of this change.
  Cross-tab delivery stays off until this migration is applied later.
  The client ignores realtime events until a channel reports SUBSCRIBED.
*/

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
