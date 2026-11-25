# Changelog

## 2026-11-25

### Added
- Tool detail pages at `/tools/[slug]`: logo, description, category chips, Open Graph screenshot with a "No preview available" fallback, "Similar tools", and a sticky title row with a "Visit website" button.
- SEO: per-tool title, description, canonical URL, Open Graph and Twitter tags, generated OG image, JSON-LD (`SoftwareApplication`, `BreadcrumbList`), `sitemap.xml` and `robots.txt`. Filtered, sorted, saved and shared views are `noindex`.
- Sort dropdown on the homepage: newest, oldest, A–Z, popular.
- Share saved list: copy a link to a read-only list with "Save all".
- Outbound click counter (`/api/click`) that feeds the "Popular" sort. Requires `supabase/add_click_count.sql`.
- Keyboard shortcut: `/` or Cmd/Ctrl+K focuses search.
- Collapsible desktop sidebar with animation, a remembered state, and a narrow strip with expand, search, saved and theme buttons.
- Category icons in the sidebar, matched to the category name from the `reicon-react` library.
- Empty state for saved tools, loading skeleton, and motion on cards.

### Changed
- Sidebar categories are built from the directory's top tags instead of a fixed list.
- Cards open their tool page; the external link is an arrow button next to the bookmark. Category chips are centre-aligned with both buttons.
- The saved page no longer shows the page header.
- Logo container background lowered to `bg-white/10`; the fallback letter follows the theme colour.
- Sidebar scrollbar restyled; sort dropdown uses a custom chevron.
- Search ring and borders use the primary amber; the search box has a clear button.

### Fixed
- Tool detail pages read the `libraries` table because the `library_with_tags` view lacks `og_image_url`.

### Setup
- Run `supabase/add_click_count.sql` in the Supabase SQL editor.
- Set `NEXT_PUBLIC_SITE_URL` to the production origin.
