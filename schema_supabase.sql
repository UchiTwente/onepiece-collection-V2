-- Exécuter une fois dans l'éditeur SQL de TON projet Supabase.
-- Chaque utilisateur authentifié ne lit et n'écrit que son propre inventaire.
create table if not exists public.onepiece_collections (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.onepiece_collections enable row level security;
revoke all on public.onepiece_collections from anon;
grant select, insert, update on public.onepiece_collections to authenticated;
drop policy if exists onepiece_read_own on public.onepiece_collections;
drop policy if exists onepiece_insert_own on public.onepiece_collections;
drop policy if exists onepiece_update_own on public.onepiece_collections;
create policy onepiece_read_own on public.onepiece_collections for select to authenticated using ((select auth.uid()) = user_id);
create policy onepiece_insert_own on public.onepiece_collections for insert to authenticated with check ((select auth.uid()) = user_id);
create policy onepiece_update_own on public.onepiece_collections for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
