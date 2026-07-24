-- Schema for a simple directory of libraries and tags
create table if not exists public.libraries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  framework text not null default 'React',
  website_url text,
  github_url text,
  logo_url text,
  created_at timestamptz default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

-- many-to-many relation
create table if not exists public.library_tags (
  library_id uuid references public.libraries(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (library_id, tag_id)
);

-- Helper view to fetch tag names per library
create or replace view public.library_with_tags as
select l.*, array_agg(t.name) as tags
from public.libraries l
left join public.library_tags lt on lt.library_id = l.id
left join public.tags t on t.id = lt.tag_id
group by l.id;

-- Enable RLS on libraries table
alter table public.libraries enable row level security;

-- Policy: Allow authenticated users to SELECT all libraries
create policy "Authenticated users can view libraries"
  on public.libraries
  for select
  to authenticated
  using (true);

-- Policy: Allow authenticated users to INSERT new libraries
create policy "Authenticated users can insert libraries"
  on public.libraries
  for insert
  to authenticated
  with check (true);

-- Policy: Allow authenticated users to UPDATE libraries
create policy "Authenticated users can update libraries"
  on public.libraries
  for update
  to authenticated
  using (true)
  with check (true);

-- Policy: Allow authenticated users to DELETE libraries
create policy "Authenticated users can delete libraries"
  on public.libraries
  for delete
  to authenticated
  using (true);

-- Enable RLS on tags table
alter table public.tags enable row level security;

-- Policy: Allow authenticated users to SELECT all tags
create policy "Authenticated users can view tags"
  on public.tags
  for select
  to authenticated
  using (true);

-- Policy: Allow authenticated users to INSERT new tags
create policy "Authenticated users can insert tags"
  on public.tags
  for insert
  to authenticated
  with check (true);

-- Policy: Allow authenticated users to UPDATE tags
create policy "Authenticated users can update tags"
  on public.tags
  for update
  to authenticated
  using (true)
  with check (true);

-- Policy: Allow authenticated users to DELETE tags
create policy "Authenticated users can delete tags"
  on public.tags
  for delete
  to authenticated
  using (true);

-- Enable RLS on library_tags table
alter table public.library_tags enable row level security;

-- Policy: Allow authenticated users to SELECT all library_tags
create policy "Authenticated users can view library_tags"
  on public.library_tags
  for select
  to authenticated
  using (true);

-- Policy: Allow authenticated users to INSERT new library_tags
create policy "Authenticated users can insert library_tags"
  on public.library_tags
  for insert
  to authenticated
  with check (true);

-- Policy: Allow authenticated users to UPDATE library_tags
create policy "Authenticated users can update library_tags"
  on public.library_tags
  for update
  to authenticated
  using (true)
  with check (true);

-- Policy: Allow authenticated users to DELETE library_tags
create policy "Authenticated users can delete library_tags"
  on public.library_tags
  for delete
  to authenticated
  using (true);

-- Ensure the view uses underlying table policies and is visible to clients
alter view public.library_with_tags set (security_invoker = true);

-- Grant read access to the common Supabase roles
grant usage on schema public to anon, authenticated;
grant select on table public.library_with_tags to anon, authenticated;

-- Ask PostgREST to refresh its schema cache so the new view is discoverable
do $$
begin
  perform pg_catalog.pg_notify('pgrst','reload schema');
exception when others then
  -- ignore if PostgREST channel isn't available (e.g., during CI)
  null;
end $$;
