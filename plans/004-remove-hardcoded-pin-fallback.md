# Plan 004: Remove Hardcoded Submission PIN Fallback

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat b7c5e35..HEAD -- app/submit/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: MED
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `b7c5e35`, 2026-07-24
- **Issue**:

## Why this matters

The submission endpoint has a hardcoded fallback PIN ("181299") when the `SUBMISSION_PIN` environment variable is not set. This is a security risk because anyone with knowledge of this hardcoded value could submit libraries, bypassing the intended PIN protection. The fallback should be removed entirely to force proper configuration.

## Current state

- `app/submit/page.tsx` line 10: `const SUBMISSION_PIN = process.env.SUBMISSION_PIN || "181299";`
- When `SUBMISSION_PIN` is not set, the default value "181299" is used
- The PIN is checked in the `createLibrary` server action (line 28)
- No environment variable validation exists

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `npm run lint` | exit 0 |
| Verify    | `npm run dev` then test submission | submission requires PIN, no fallback |

## Scope

**In scope** (the only files you should modify):
- `app/submit/page.tsx` — remove the fallback PIN value

**Out of scope** (do NOT touch, even though they look related):
- Other parts of the submission flow
- Authentication or authorization systems
- Environment variable documentation

## Git workflow

- Branch: `advisor/004-remove-hardcoded-pin-fallback`
- Commit per step: "security: remove hardcoded PIN fallback"
- Message style: conventional commits (security: remove hardcoded PIN fallback)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Remove the fallback PIN value

Update `app/submit/page.tsx` line 10 to remove the fallback:

**Before**:
```typescript
const SUBMISSION_PIN = process.env.SUBMISSION_PIN || "181299";
```

**After**:
```typescript
const SUBMISSION_PIN = process.env.SUBMISSION_PIN;
```

**Verify**: `npm run lint` → exit 0

### Step 2: Add environment variable validation

Add validation to ensure `SUBMISSION_PIN` is set before allowing submissions:

Update `app/submit/page.tsx` to add a check at the top of the `createLibrary` function:

```typescript
async function createLibrary(formData: FormData) {
  "use server";

  // Validate SUBMISSION_PIN is configured
  if (!process.env.SUBMISSION_PIN) {
    return Response.json(
      { error: 'Submission is not configured. Please contact the administrator.' },
      { status: 500 }
    );
  }

  const name = String(formData.get("name") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const framework = String(formData.get("framework") || "Tools").trim();
  const website_url = String(formData.get("website_url") || "").trim();
  const logo_url = String(formData.get("logo_url") || "").trim();
  const tagsInput = String(formData.get("tags") || "").trim();
  const submissionPin = String(formData.get("submission_pin") || "").trim();

  // ... rest of the function ...
}
```

**Verify**: `npm run lint` → exit 0

### Step 3: Update the PIN check

Update the PIN check in `createLibrary` to use the validated `SUBMISSION_PIN`:

**Before**:
```typescript
if (submissionPin !== SUBMISSION_PIN) {
  redirect("/submit?error=invalid_pin");
}
```

**After**:
```typescript
if (submissionPin !== SUBMISSION_PIN) {
  return Response.json(
    { error: 'Invalid submission PIN' },
    { status: 401 }
  );
}
```

**Note**: Using `Response.json` instead of `redirect` allows for better error handling and rate limiting integration.

**Verify**: `npm run lint` → exit 0

### Step 4: Update error handling in SubmitPage

Update `app/submit/page.tsx` to handle the new error response format:

Find the error handling code (around lines 120-136) and update it to handle 500 and 401 status codes:

```typescript
{error === "supabase_not_configured" && (
  <div className="mb-4 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300 font-sans">
    Submission failed because Supabase is not configured.
  </div>
)}

{error === "invalid_pin" && (
  <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 font-sans">
    Invalid PIN. Enter the correct submission PIN to add a new library.
  </div>
)}

{error === "submission_not_configured" && (
  <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 font-sans">
    Submission is not configured. Please contact the administrator.
  </div>
)}

{error && error !== "supabase_not_configured" && error !== "invalid_pin" && error !== "submission_not_configured" && (
  <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 font-sans">
    {error}
  </div>
)}
```

**Verify**: `npm run lint` → exit 0

### Step 5: Update SubmitButton to handle new error responses

Update `app/submit/SubmitButton.tsx` to handle 401 and 500 status codes:

```typescript
"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function SubmitButton({ isConfigured }: { isConfigured: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConfigured || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await e.currentTarget.submit();
      const data = await response.json();

      if (response.status === 401) {
        toast.error("Invalid submission PIN");
      } else if (response.status === 500) {
        toast.error("Submission is not configured. Please contact the administrator.");
      } else if (response.ok) {
        toast.success("Library submitted successfully!");
        window.location.href = "/?submitted=1";
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="submit"
      disabled={!isConfigured || isSubmitting}
      className="rounded-md dark:bg-yellow-200 bg-yellow-400 px-8 py-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-neutral-900 font-semibold mt-4 text-base font-sans"
    >
      {isSubmitting ? "Submitting..." : "Submit"}
    </button>
  );
}
```

**Verify**: `npm run lint` → exit 0

## Test plan

- Test that submission fails with 401 when invalid PIN is provided
- Test that submission fails with 500 when `SUBMISSION_PIN` environment variable is not set
- Test that submission succeeds with correct PIN
- Verify that the error message is displayed correctly to the user

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `SUBMISSION_PIN` has no fallback value
- [ ] `SUBMISSION_PIN` is validated at the start of `createLibrary`
- [ ] PIN check uses `Response.json` instead of `redirect`
- [ ] Error handling in `SubmitPage` handles 500 and 401 status codes
- [ ] `SubmitButton` handles 401 and 500 responses
- [ ] `npm run lint` exits 0
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

- Document the `SUBMISSION_PIN` environment variable in README.md
- If you need to change the PIN in the future, update the environment variable and document it
- A reviewer should scrutinize that the fallback has been removed and proper validation exists
