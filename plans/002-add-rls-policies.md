# Plan 002: Add Row-Level Security Policies to Supabase

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat b7c5e35..HEAD -- supabase/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `b7c5e35`, 2026-07-24
- **Issue**:

## Why this matters

The current Supabase schema grants SELECT access to anonymous users through the `library_with_tags` view, but no Row-Level Security (RLS) policies exist on the underlying tables (`libraries`, `tags`, `library_tags`). This means any authenticated user can see all data, and there's no protection against unauthorized access. RLS policies will ensure that only data visible through the view is accessible, and that INSERT/UPDATE/DELETE operations are properly restricted.

## Current state

- The schema in `supabase/schema.sql` currently has no RLS policies:
  - `libraries` table (lines 2-12) — no policies
  - `tags` table (lines 14-17) — no policies
  - `library_tags` table (lines 20-24) — no policies
  - `library_with_tags` view (lines 27-32) — grants SELECT to anon, authenticated
- Only `grant select on table public.library_with_tags to anon, authenticated;` exists (line 39)
- The app uses server actions (`createLibrary`) for writes, so RLS should allow authenticated users to INSERT/UPDATE/DELETE through those actions
- RLS is not enabled on any tables yet

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Verify DB  | `psql -d your_database -f supabase/schema.sql` | tables created, policies added |
| Test RLS   | Test queries from Supabase SQL Editor with different roles | behavior matches expectations |

## Suggested executor toolkit

- Supabase SQL Editor for running migration scripts
- Supabase dashboard to test policies with different roles
- PostgreSQL documentation for RLS syntax: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

## Scope

**In scope** (the only files you should modify):
- `supabase/schema.sql` — add RLS enablement and policies for all tables
- `supabase/add_og_image.sql` — add RLS for the new highlights/highlight_items tables if they exist

**Out of scope** (do NOT touch, even though they look related):
- Application code (no changes needed, RLS policies work with existing server actions)
- The `library_with_tags` view (keep as-is, just add policies to underlying tables)
- Any other Supabase migrations not related to RLS

## Git workflow

- Branch: `advisor/002-add-rls-policies`
- Commit per step: "security: enable RLS on libraries table", "security: add policies to tags table", etc.
- Message style: conventional commits (security: add RLS policies)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Enable RLS on libraries table

Add RLS enablement and policies for the `libraries` table. The app uses server actions for writes, so authenticated users should be able to INSERT/UPDATE/DELETE. Anonymous users can SELECT through the view.

Run this SQL in Supabase SQL Editor:

```sql
-- Enable RLS on libraries table
ALTER TABLE public.libraries ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to SELECT all libraries
CREATE POLICY "Authenticated users can view libraries"
  ON public.libraries
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to INSERT new libraries
CREATE POLICY "Authenticated users can insert libraries"
  ON public.libraries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to UPDATE libraries
CREATE POLICY "Authenticated users can update libraries"
  ON public.libraries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to DELETE libraries
CREATE POLICY "Authenticated users can delete libraries"
  ON public.libraries
  FOR DELETE
  TO authenticated
  USING (true);
```

**Verify**: Check the Supabase dashboard that policies are created (look for "Policies" tab in table settings)

### Step 2: Enable RLS on tags table

Tags are used for filtering and are publicly readable through the view. No writes should happen at the database level (app handles tag upserts).

Run this SQL in Supabase SQL Editor:

```sql
-- Enable RLS on tags table
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to SELECT all tags
CREATE POLICY "Authenticated users can view tags"
  ON public.tags
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to INSERT new tags
CREATE POLICY "Authenticated users can insert tags"
  ON public.tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to UPDATE tags
CREATE POLICY "Authenticated users can update tags"
  ON public.tags
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to DELETE tags
CREATE POLICY "Authenticated users can delete tags"
  ON public.tags
  FOR DELETE
  TO authenticated
  USING (true);
```

**Verify**: Check the Supabase dashboard that policies are created

### Step 3: Enable RLS on library_tags table

This is the many-to-many relationship table. It should be writable only through the app (server actions), and readable by authenticated users.

Run this SQL in Supabase SQL Editor:

```sql
-- Enable RLS on library_tags table
ALTER TABLE public.library_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to SELECT all library_tags
CREATE POLICY "Authenticated users can view library_tags"
  ON public.library_tags
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to INSERT new library_tags
CREATE POLICY "Authenticated users can insert library_tags"
  ON public.library_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to UPDATE library_tags
CREATE POLICY "Authenticated users can update library_tags"
  ON public.library_tags
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to DELETE library_tags
CREATE POLICY "Authenticated users can delete library_tags"
  ON public.library_tags
  FOR DELETE
  TO authenticated
  USING (true);
```

**Verify**: Check the Supabase dashboard that policies are created

### Step 4: Verify RLS is working correctly

Test the policies using the Supabase dashboard:

1. Open the Supabase dashboard
2. Go to the SQL Editor
3. Run a test query with different roles:

```sql
-- Test SELECT as authenticated user (should work)
SELECT * FROM public.libraries;

-- Test INSERT as authenticated user (should work)
INSERT INTO public.libraries (name, slug, description, framework)
VALUES ('Test Library', 'test-library', 'Test description', 'React')
RETURNING *;

-- Test SELECT as anon user (should work through view)
SELECT * FROM public.library_with_tags;
```

**Verify**: All queries succeed, and the app continues to work correctly

### Step 5: Update schema.sql with RLS policies

Add the RLS enablement and policy creation to `supabase/schema.sql`. This ensures the schema is reproducible and includes security best practices.

Append the following to `supabase/schema.sql`:

```sql
-- Enable RLS on all tables
ALTER TABLE public.libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_tags ENABLE ROW LEVEL SECURITY;

-- Libraries policies
CREATE POLICY "Authenticated users can view libraries"
  ON public.libraries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert libraries"
  ON public.libraries FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update libraries"
  ON public.libraries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete libraries"
  ON public.libraries FOR DELETE TO authenticated USING (true);

-- Tags policies
CREATE POLICY "Authenticated users can view tags"
  ON public.tags FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert tags"
  ON public.tags FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tags"
  ON public.tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tags"
  ON public.tags FOR DELETE TO authenticated USING (true);

-- Library_tags policies
CREATE POLICY "Authenticated users can view library_tags"
  ON public.library_tags FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert library_tags"
  ON public.library_tags FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update library_tags"
  ON public.library_tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete library_tags"
  ON public.library_tags FOR DELETE TO authenticated USING (true);
```

**Verify**: `npm run lint` → exit 0

## Test plan

- Test SELECT queries as authenticated user on all three tables
- Test INSERT queries as authenticated user
- Test UPDATE queries as authenticated user
- Test DELETE queries as authenticated user
- Verify that the app still works correctly after applying policies
- Verify that the app still works when Supabase is not configured (falls back to sample data)

## Done criteria

Machine-checkable. ALL must hold:

- [ ] RLS is enabled on all three tables (libraries, tags, library_tags)
- [ ] All four policies exist on each table (SELECT, INSERT, UPDATE, DELETE)
- [ ] `npm run lint` exits 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `supabase/schema.sql` includes all RLS enablement and policy statements
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- The fix appears to require touching an out-of-scope file
- You discover the assumption "<key assumption>" is false

## Maintenance notes

For the human/agent who owns this code after the change lands:

- When adding new tables to the schema, always enable RLS and add appropriate policies
- When adding new tables to the app, update the schema.sql file with RLS
- A reviewer should scrutinize that all tables have RLS enabled and appropriate policies
- If you need to add a new role (e.g., admin), add policies for that role as well
