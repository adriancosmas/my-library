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
