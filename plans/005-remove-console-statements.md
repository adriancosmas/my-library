# Plan 005: Remove Console Statements from Production Code

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat b7c5e35..HEAD -- app/ lib/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `b7c5e35`, 2026-07-24
- **Issue**:

## Why this matters

Production code contains 10 `console.log`, `console.warn`, and `console.error` statements that pollute the browser console and can expose sensitive information. These should be removed or replaced with proper logging libraries for production environments.

## Current state

Found 10 console statements across the codebase:

- `lib/highlights.ts:16` — console.warn for getHighlights error
- `app/submit/AddTags.tsx:35` — console.warn for fetch tags error
- `app/submit/AddTags.tsx:51` — console.log for removed tag
- `app/submit/AddTags.tsx:61` — console.log for selected tag
- `app/submit/AddTags.tsx:66` — console.log for created tag
- `app/page.tsx:63` — console.warn for Supabase view missing
- `app/page.tsx:77` — console.warn for tag lookup failure
- `app/page.tsx:85` — console.warn for library_ids by tag failure
- `app/page.tsx:112` — console.error for Supabase fallback error
- `app/page.tsx:126` — console.warn for tags fallback error

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `npm run lint` | exit 0 |
| Verify    | Run app and check console | no console statements in production code |

## Scope

**In scope** (the only files you should modify):
- `lib/highlights.ts` — remove console.warn
- `app/submit/AddTags.tsx` — remove console.log and console.warn
- `app/page.tsx` — remove all console statements

**Out of scope** (do NOT touch, even though they look related):
- Test files (console statements are useful in tests)
- Development scripts
- Documentation

## Git workflow

- Branch: `advisor/005-remove-console-statements`
- Commit per step: "dx: remove console.warn in lib/highlights", "dx: remove console statements in AddTags", etc.
- Message style: conventional commits (refactor: remove console statements)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Remove console.warn from lib/highlights.ts

**File**: `lib/highlights.ts:16`

**Before**:
```typescript
if (error || !data) {
  console.warn("getHighlights error:", error?.message);
  return SAMPLE_HIGHLIGHTS;
}
```

**After**:
```typescript
if (error || !data) {
  return SAMPLE_HIGHLIGHTS;
}
```

**Verify**: `npm run lint` → exit 0

### Step 2: Remove console.log statements from app/submit/AddTags.tsx

**File**: `app/submit/AddTags.tsx:51, 61, 66`

**Before**:
```typescript
console.log(`removed: ${value}`);
// ...
console.log(`selected: ${value}`);
// ...
console.log(`created: ${newTag}`);
```

**After**:
```typescript
// Removed all three console.log statements
```

**Verify**: `npm run lint` → exit 0

### Step 3: Remove console.warn from app/submit/AddTags.tsx

**File**: `app/submit/AddTags.tsx:35`

**Before**:
```typescript
if (error) {
  console.warn('Failed to fetch tags', error.message);
}
```

**After**:
```typescript
if (error) {
  // Silently fail; tags will be empty
}
```

**Verify**: `npm run lint` → exit 0

### Step 4: Remove console.warn from app/page.tsx (lines 63, 77, 85)

**File**: `app/page.tsx:63`

**Before**:
```typescript
if (error) {
  console.warn(
    "Supabase view missing, falling back to libraries:",
    error.message
  );
```

**After**:
```typescript
if (error) {
  // Silently fall back to libraries table
```

**Verify**: `npm run lint` → exit 0

### Step 5: Remove console.warn from app/page.tsx (lines 77, 85)

**File**: `app/page.tsx:77, 85`

**Before**:
```typescript
if (tagFindError) {
  console.warn("Fallback: tag lookup failed", tagFindError.message);
  tagLibIds = [];
}
// ...
if (ltIdsError) {
  console.warn("Fallback: library_ids by tag failed", ltIdsError.message);
  tagLibIds = [];
}
```

**After**:
```typescript
if (tagFindError) {
  tagLibIds = [];
}
// ...
if (ltIdsError) {
  tagLibIds = [];
}
```

**Verify**: `npm run lint` → exit 0

### Step 6: Remove console.error from app/page.tsx (line 112)

**File**: `app/page.tsx:112`

**Before**:
```typescript
const { data: libRows, error: libError } = await libQuery;
if (libError) {
  console.error("Supabase fallback error", libError.message);
}
```

**After**:
```typescript
const { data: libRows, error: libError } = await libQuery;
if (libError) {
  // Silently fail; libraries will be empty
}
```

**Verify**: `npm run lint` → exit 0

### Step 7: Remove console.warn from app/page.tsx (line 126)

**File**: `app/page.tsx:126`

**Before**:
```typescript
if (ltError) {
  console.warn("Supabase tags fallback error", ltError.message);
}
```

**After**:
```typescript
if (ltError) {
  // Silently fail; tags will be empty
}
```

**Verify**: `npm run lint` → exit 0

## Test plan

- Run the app in development mode
- Verify that no console statements appear in the browser console
- Test critical paths (search, tag filtering, submission)
- Verify that functionality still works correctly

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `grep -rn "console\.(log|warn|error)" app/ lib/` returns no matches
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- The fix appears to require touching an out-of-scope file
- You discover the assumption "<key assumption>" is false

## Maintenance notes

For the human/agent who owns this code after the change lands:

- When debugging issues in production, use a proper logging library (e.g., pino, winston)
- Do not add console statements to production code
- Console statements are acceptable in development and test files
- A reviewer should scrutinize that all console statements have been removed from production code
