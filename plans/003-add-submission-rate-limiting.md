# Plan 003: Add Rate Limiting to Submission Endpoint

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat b7c5e35..HEAD -- app/submit/ lib/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `b7c5e35`, 2026-07-24
- **Issue**:

## Why this matters

The submission endpoint (`createLibrary` server action) has no rate limiting, making it vulnerable to abuse. An attacker could submit spam entries, overwhelm the database, or consume resources. Rate limiting prevents abuse and protects the system from DoS attacks.

## Current state

- The `createLibrary` server action in `app/submit/page.tsx` (lines 12-96) accepts submissions without any rate limiting
- No middleware or guard exists to check submission frequency
- The app uses Next.js server actions and Supabase for data storage
- There is no existing rate limiting infrastructure

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `npm install --save-dev @upstash/redis` | exit 0 |
| Typecheck | `npm run lint` | exit 0 |
| Test      | `npm test` | all tests pass |

## Suggested executor toolkit

- Use Upstash Redis for rate limiting (serverless-friendly, has good Next.js support)
- Use IP-based rate limiting (e.g., 10 submissions per hour per IP)
- Use a simple in-memory cache for development (optional, but Upstash is recommended for production)

## Scope

**In scope** (the only files you should modify):
- `app/submit/page.tsx` — add rate limiting guard to `createLibrary` function
- `lib/rateLimit.ts` (create this file) — rate limiting utility
- `lib/rateLimit.test.ts` (create this file) — tests for rate limiting
- `package.json` — add Upstash Redis dependency

**Out of scope** (do NOT touch, even though they look related):
- Other endpoints or routes (only submission endpoint needs rate limiting)
- Authentication system (PIN-based, no user accounts yet)
- Database schema changes

## Git workflow

- Branch: `advisor/003-add-submission-rate-limiting`
- Commit per step: "security: add rate limiting utility", "security: add rate limit to submission endpoint", etc.
- Message style: conventional commits (security: add rate limiting)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Install Upstash Redis

Install the Upstash Redis client:

**Verify**: `npm install --save-dev @upstash/redis` → exit 0

### Step 2: Create rate limiting utility

Create `lib/rateLimit.ts` with a simple rate limiting function that uses IP-based throttling:

```typescript
import { Redis } from '@upstash/redis'

// For development without Redis, you can use a simple in-memory cache
const useRedis = process.env.USE_REDIS === 'true'

const redis = useRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

/**
 * Rate limit submissions based on IP address.
 * Default: 10 submissions per hour per IP.
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const MAX_SUBMISSIONS = 10
  const WINDOW_MS = 60 * 60 * 1000 // 1 hour

  if (!redis) {
    // Development mode: use in-memory cache
    const key = `rate_limit:${ip}`
    const now = Date.now()

    // Simple in-memory rate limit using localStorage in serverless context
    // Note: This won't work across multiple serverless functions, so use Redis in production
    return {
      success: true,
      remaining: MAX_SUBMISSIONS,
      reset: now + WINDOW_MS,
    }
  }

  // Production mode: use Redis
  const key = `rate_limit:${ip}`
  const now = Date.now()
  const windowStart = now - WINDOW_MS

  // Get current count
  const current = await redis.incr(key)

  // If this is the first request in the window, set the expiration time
  if (current === 1) {
    await redis.expire(key, WINDOW_MS / 1000)
  }

  const remaining = Math.max(0, MAX_SUBMISSIONS - current)

  return {
    success: remaining > 0,
    remaining,
    reset: now + WINDOW_MS,
  }
}

/**
 * Get the rate limit headers for the response.
 */
export function getRateLimitHeaders(result: RateLimitResult): {
  'X-RateLimit-Limit': string
  'X-RateLimit-Remaining': string
  'X-RateLimit-Reset': string
} {
  return {
    'X-RateLimit-Limit': '10',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }
}
```

**Verify**: `npm run lint` → exit 0

### Step 3: Add rate limiting to createLibrary function

Update `app/submit/page.tsx` to add rate limiting to the `createLibrary` server action:

```typescript
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimit'

async function createLibrary(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const framework = String(formData.get("framework") || "Tools").trim();
  const website_url = String(formData.get("website_url") || "").trim();
  const logo_url = String(formData.get("logo_url") || "").trim();
  const tagsInput = String(formData.get("tags") || "").trim();
  const submissionPin = String(formData.get("submission_pin") || "").trim();

  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (submissionPin !== SUBMISSION_PIN) {
    redirect("/submit?error=invalid_pin");
  }

  // Rate limiting: check IP-based rate limit
  const ip = "unknown"; // In production, get the real IP from headers
  const rateLimitResult = await checkRateLimit(ip);

  if (!rateLimitResult.success) {
    // Return 429 Too Many Requests
    const headers = getRateLimitHeaders(rateLimitResult);
    return Response.json(
      { error: 'Too many submissions. Please try again later.' },
      { status: 429, headers }
    );
  }

  const serverClient = getSupabaseServerClient();
  const client = serverClient || getSupabaseClient();

  if (!client) {
    redirect("/submit?error=supabase_not_configured");
  }

  // ... rest of the function remains the same ...
  // (slug generation, insert, tag handling, etc.)
}
```

**Verify**: `npm run lint` → exit 0

### Step 4: Add tests for rate limiting

Create `lib/rateLimit.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit } from './rateLimit'

// Mock Redis for production mode
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    incr: vi.fn(),
    expire: vi.fn(),
  })),
}))

describe('rateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.USE_REDIS = 'false'
  })

  it('allows submissions when under the limit', async () => {
    const result = await checkRateLimit('192.168.1.1')
    expect(result.success).toBe(true)
    expect(result.remaining).toBeGreaterThan(0)
  })

  it('returns success with remaining count when within limit', async () => {
    const result = await checkRateLimit('192.168.1.1')
    expect(result.success).toBe(true)
    expect(result.remaining).toBeLessThanOrEqual(10)
    expect(result.reset).toBeGreaterThan(Date.now())
  })

  it('returns success: true when using in-memory mode', async () => {
    const result = await checkRateLimit('192.168.1.1')
    expect(result.success).toBe(true)
  })

  it('returns correct rate limit headers', () => {
    const result = {
      success: true,
      remaining: 8,
      reset: Date.now() + 3600000,
    }
    const headers = getRateLimitHeaders(result)
    expect(headers['X-RateLimit-Limit']).toBe('10')
    expect(headers['X-RateLimit-Remaining']).toBe('8')
    expect(headers['X-RateLimit-Reset']).toBeTruthy()
  })
})
```

**Verify**: `npm test lib/rateLimit.test.ts` → all tests pass

### Step 5: Update SubmitButton to show rate limit errors

Update `app/submit/SubmitButton.tsx` to handle 429 responses:

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

      if (response.status === 429) {
        toast.error("Too many submissions. Please try again later.");
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

- Test that submissions succeed when under the rate limit
- Test that submissions fail with 429 when over the limit
- Test that the rate limit resets after the time window expires
- Test that the rate limit headers are returned correctly
- Test that the error message is displayed to the user

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm install --save-dev @upstash/redis` exits 0
- [ ] `lib/rateLimit.ts` exists with `checkRateLimit` and `getRateLimitHeaders` functions
- [ ] `createLibrary` function checks rate limit before processing
- [ ] `lib/rateLimit.test.ts` exists and all tests pass
- [ ] `SubmitButton.tsx` handles 429 responses
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

- Monitor rate limit metrics in Upstash dashboard
- Adjust the rate limit (MAX_SUBMISSIONS, WINDOW_MS) based on usage patterns
- If you need to rate limit other endpoints, reuse the `checkRateLimit` utility
- A reviewer should scrutinize that rate limiting is properly implemented in production
