-- Hide a highlight from the public API without deleting it
alter table public.highlights
  add column if not exists hidden boolean not null default false;
