-- Public tool suggestions. Run once in the Supabase SQL editor.
-- Anon can only insert through submit_tool(); rows are read and approved in the dashboard.

create table if not exists public.submissions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  website_url text not null,
  description text not null default '',
  category text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists submissions_status_idx on public.submissions (status, created_at desc);

-- RLS on with no policies: anon cannot read or write rows directly.
alter table public.submissions enable row level security;

create or replace function public.submit_tool(
  p_name text, p_url text, p_description text, p_category text
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.submissions (name, website_url, description, category)
  values (left(p_name, 100), left(p_url, 300), left(p_description, 500), left(p_category, 50));
$$;

revoke all on function public.submit_tool(text, text, text, text) from public;
grant execute on function public.submit_tool(text, text, text, text) to anon, authenticated;
