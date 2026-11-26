-- Visitor feedback. Run once in the Supabase SQL editor.
-- Read it in Table Editor > feedback. Set is_read to true once handled.
-- Anon can only insert through submit_feedback(); it cannot read rows.

create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  message text not null,
  email text,
  path text,
  is_read boolean not null default false
);

create index if not exists feedback_unread_idx on public.feedback (created_at desc) where not is_read;

-- RLS on with no policies: anon cannot read or write rows directly.
alter table public.feedback enable row level security;

create or replace function public.submit_feedback(p_message text, p_email text, p_path text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.feedback (message, email, path)
  values (left(p_message, 2000), nullif(left(p_email, 200), ''), nullif(left(p_path, 200), ''));
$$;

revoke all on function public.submit_feedback(text, text, text) from public;
grant execute on function public.submit_feedback(text, text, text) to anon, authenticated;

-- Notification count: open Table Editor > feedback_unread to see how many are waiting.
create or replace view public.feedback_unread as
select count(*) as unread, max(created_at) as latest
from public.feedback
where not is_read;

revoke all on public.feedback_unread from anon;
