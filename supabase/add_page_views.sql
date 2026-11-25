-- Visitor tracking. Run once in the Supabase SQL editor.
-- No IP or user agent is stored: visitor_hash is a daily-rotating hash made by the API route.

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null,
  visitor_hash text not null,
  referrer text,
  country text,
  device text
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);

-- RLS on with no policies: anon cannot read or write rows directly.
alter table public.page_views enable row level security;

create or replace function public.track_view(
  p_path text, p_visitor text, p_referrer text, p_country text, p_device text
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.page_views (path, visitor_hash, referrer, country, device)
  values (left(p_path, 200), left(p_visitor, 64), left(p_referrer, 200), left(p_country, 2), left(p_device, 10));
$$;

revoke all on function public.track_view(text, text, text, text, text) from public;
grant execute on function public.track_view(text, text, text, text, text) to anon, authenticated;

-- Aggregates for the dashboard. Visitors are unique per day (the hash rotates daily).
create or replace view public.daily_stats as
select created_at::date as day,
       count(*) as views,
       count(distinct visitor_hash) as visitors
from public.page_views
group by 1
order by 1 desc;

create or replace view public.top_pages as
select path, count(*) as views, count(distinct visitor_hash) as visitors
from public.page_views
where created_at > now() - interval '30 days'
group by 1
order by views desc;

create or replace view public.top_referrers as
select coalesce(nullif(referrer, ''), 'direct') as referrer, count(*) as views
from public.page_views
where created_at > now() - interval '30 days'
group by 1
order by views desc;

create or replace view public.top_countries as
select coalesce(nullif(country, ''), 'unknown') as country, count(*) as views
from public.page_views
where created_at > now() - interval '30 days'
group by 1
order by views desc;

-- Dashboard reads: signed-in users only. The service role bypasses this.
revoke all on public.page_views, public.daily_stats, public.top_pages, public.top_referrers, public.top_countries from anon;
grant select on public.daily_stats, public.top_pages, public.top_referrers, public.top_countries to authenticated;
