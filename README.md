# best-tools

A Next.js catalogue website similar to the screenshot, backed by Supabase.

## Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

## Environment

Create `.env.local` in the project root (already added) and set:

```
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

## Database Schema

Copy the SQL from `supabase/schema.sql` into the Supabase SQL editor and run it to create `libraries`, `tags`, and `library_tags`.

## Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000. If env vars are not set, the page falls back to sample data so you can still preview the UI.

## Notes

- Current filters: search by name (`q`) and framework (`framework`).
- Tag filtering can be enabled by returning a `tags` array per library (see `library_with_tags` view in `schema.sql`).
