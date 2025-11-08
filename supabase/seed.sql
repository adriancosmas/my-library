-- Idempotent seed for libraries and tags

insert into public.libraries (name, slug, description, framework, website_url, github_url, logo_url)
values
('shadcn/ui', 'shadcn-ui', 'Beautifully designed components built with Radix UI and Tailwind CSS', 'React', 'https://ui.shadcn.com', 'https://github.com/shadcn-ui/ui', 75000, null),
('Aceternity UI', 'aceternity-ui', 'Copy-paste beautiful UI components built with Tailwind', 'React', 'https://ui.aceternity.com', 'https://github.com/aceternity/ui', 12000, null),
('Magic UI', 'magic-ui', 'Animated UI components for React and Tailwind CSS', 'React', 'https://magicui.design', 'https://github.com/magicuidesign/magicui', 4800, null)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  framework = excluded.framework,
  website_url = excluded.website_url,
  github_url = excluded.github_url,
  logo_url = excluded.logo_url;

insert into public.tags (name) values
('components'), ('tailwind'), ('radix'), ('animation'), ('react')
on conflict (name) do nothing;

-- Map tags to libraries (example)
-- shadcn/ui -> components, tailwind, radix
insert into public.library_tags (library_id, tag_id)
select l.id, t.id from public.libraries l, public.tags t where l.slug = 'shadcn-ui' and t.name in ('components','tailwind','radix')
on conflict do nothing;

-- Aceternity UI -> components, tailwind
insert into public.library_tags (library_id, tag_id)
select l.id, t.id from public.libraries l, public.tags t where l.slug = 'aceternity-ui' and t.name in ('components','tailwind')
on conflict do nothing;

-- Magic UI -> components, animation, react
insert into public.library_tags (library_id, tag_id)
select l.id, t.id from public.libraries l, public.tags t where l.slug = 'magic-ui' and t.name in ('components','animation','react')
on conflict do nothing;