-- Add og_image_url to libraries for OG image display in highlight cards
-- Run in Supabase SQL Editor

alter table public.libraries
  add column if not exists og_image_url text;

comment on column public.libraries.og_image_url is 'Open Graph image URL auto-fetched from website';
