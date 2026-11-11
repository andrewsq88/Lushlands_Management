# Archived duplicate migrations

These files are re-exported copies of migrations that are already applied and
recorded in production's migration history. After stripping comments and
whitespace, each one's SQL is identical to the recorded migration named in its
filename suffix (for example `20251008192710_20250618193911_humble_fog.sql`
duplicates `20250618193911_humble_fog`). The exception is
`20260114024258_20250624201216_navy_fire_storage.sql`, which duplicates
`20250624201216_navy_fire`.

They live outside `supabase/migrations/` so the Supabase CLI no longer treats
them as pending. Nothing here should be applied.
