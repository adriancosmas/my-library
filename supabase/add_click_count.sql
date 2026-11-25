-- Outbound click counter for the "Popular" sort.
-- Run in Supabase SQL Editor.

alter table public.libraries
  add column if not exists click_count integer not null default 0;

-- The view expands l.* when created, so it must be recreated to expose click_count.
drop view if exists public.library_with_tags;
create view public.library_with_tags as
select l.*, array_agg(t.name) as tags
from public.libraries l
left join public.library_tags lt on lt.library_id = l.id
left join public.tags t on t.id = lt.tag_id
group by l.id;

grant select on public.library_with_tags to anon, authenticated;

-- Anonymous visitors may only increment by one through this function.
create or replace function public.track_click(lib_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.libraries set click_count = click_count + 1 where id = lib_id;
$$;

revoke all on function public.track_click(uuid) from public;
grant execute on function public.track_click(uuid) to anon, authenticated;
