# Plan 001: Add Test Coverage for Critical Paths

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

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `b7c5e35`, 2026-07-24
- **Issue**:

## Why this matters

The codebase has no tests, making it impossible to detect regressions as features grow. Critical paths like search, tag filtering, and submission flow are untested and could break silently when changes are made. Tests provide safety for refactoring and confidence when adding new features.

## Current state

- The repo has zero test files (no *.test.ts, *.spec.ts, or test directories found during recon).
- Key files with complex logic that needs tests:
  - `app/page.tsx` — complex Supabase fallback logic for tag filtering (lines 63-173)
  - `app/submit/page.tsx` — createLibrary server action with slug uniqueness checks (lines 12-96)
  - `lib/highlights.ts` — nested query fetching for highlights (lines 5-32)
  - `lib/utils.ts` — slugify utility (need to read this file first)
- No test framework is configured in package.json.
- Conventions: Use React Testing Library for UI tests, Vitest or Jest for utilities. Match existing code style and import patterns.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event` | exit 0 |
| Typecheck | `npm run lint` | exit 0 |
| Tests     | `npm test` | all tests pass |

## Suggested executor toolkit

- Use Vitest (lightweight, modern) as the test runner
- Use React Testing Library for component tests
- Use `@testing-library/user-event` for user interactions
- Follow the pattern in `lib/sampleData.ts` for test fixtures

## Scope

**In scope** (the only files you should modify):
- `lib/utils.ts` — read this file to understand the slugify function
- `app/page.tsx` — add integration tests for search, tag filtering, and Supabase fallback
- `app/submit/page.tsx` — add tests for createLibrary server action
- `lib/highlights.ts` — add tests for getHighlights function
- `lib/sampleData.ts` — add more sample data for edge cases
- `lib/useSavedTools.tsx` — add tests for SavedToolsProvider
- `tests/` directory (create this directory)
- `vitest.config.ts` (create this file)
- `package.json` (add test scripts)

**Out of scope** (do NOT touch, even though they look related):
- Component implementation files (LibraryCard.tsx, LibraryGrid.tsx, etc.) — only test their behavior
- Other utility functions not in scope
- Styling or design system files

## Git workflow

- Branch: `advisor/001-add-test-coverage`
- Commit per step: "add: test setup", "test: add integration tests for search", etc.
- Message style: conventional commits (feat: add tests, fix: test bug, etc.)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Set up test framework

Install Vitest, React Testing Library, and related dependencies:

**Verify**: `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @testing-library/react-hooks` → exit 0

### Step 2: Create test configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

Create `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

Create `tests/utils.ts` — helper to create mock Supabase client:

```typescript
import { createClient } from '@supabase/supabase-js'

export function createMockSupabaseClient() {
  return {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'test-id' } }),
      count: jest.fn().mockResolvedValue(10),
      head: jest.fn().mockResolvedValue({ count: 10 }),
    }),
  } as any
}
```

**Verify**: `npm run lint` → exit 0

### Step 3: Add tests for lib/utils.ts

Read `lib/utils.ts` to understand the slugify function.

Create `lib/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { slugify } from './utils'

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('My Library')).toBe('my-library')
  })

  it('converts multiple spaces to single hyphens', () => {
    expect(slugify('My   Library')).toBe('my-library')
  })

  it('removes special characters', () => {
    expect(slugify('My Library!')).toBe('my-library')
  })

  it('lowercases the result', () => {
    expect(slugify('MY LIBRARY')).toBe('my-library')
  })

  it('handles empty strings', () => {
    expect(slugify('')).toBe('')
  })

  it('handles strings with only spaces', () => {
    expect(slugify('   ')).toBe('')
  })
})
```

**Verify**: `npm test lib/utils.test.ts` → all tests pass

### Step 4: Add tests for lib/useSavedTools.tsx

Create `lib/useSavedTools.test.tsx`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { SavedToolsProvider, useSavedTools } from './useSavedTools'

const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useSavedTools', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with empty array', () => {
    const { result } = renderHook(() => useSavedTools(), {
      wrapper: SavedToolsProvider,
    })
    expect(result.current.saved).toEqual([])
  })

  it('loads saved tools from localStorage', () => {
    localStorage.setItem('saved-tools', JSON.stringify(['lib-1', 'lib-2']))
    const { result } = renderHook(() => useSavedTools(), {
      wrapper: SavedToolsProvider,
    })
    expect(result.current.saved).toEqual(['lib-1', 'lib-2'])
  })

  it('toggles a tool in the saved list', () => {
    const { result } = renderHook(() => useSavedTools(), {
      wrapper: SavedToolsProvider,
    })

    act(() => {
      result.current.toggle('lib-1')
    })

    expect(result.current.saved).toEqual(['lib-1'])

    act(() => {
      result.current.toggle('lib-1')
    })

    expect(result.current.saved).toEqual([])
  })

  it('adds multiple tools', () => {
    const { result } = renderHook(() => useSavedTools(), {
      wrapper: SavedToolsProvider,
    })

    act(() => {
      result.current.toggle('lib-1')
      result.current.toggle('lib-2')
    })

    expect(result.current.saved).toEqual(['lib-1', 'lib-2'])
  })

  it('checks if a tool is saved', () => {
    const { result } = renderHook(() => useSavedTools(), {
      wrapper: SavedToolsProvider,
    })

    act(() => {
      result.current.toggle('lib-1')
    })

    expect(result.current.isSaved('lib-1')).toBe(true)
    expect(result.current.isSaved('lib-2')).toBe(false)
  })
})
```

**Verify**: `npm test lib/useSavedTools.test.tsx` → all tests pass

### Step 5: Add tests for lib/highlights.ts

Create `lib/highlights.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { getHighlights } from './highlights'
import { createMockSupabaseClient } from './tests/utils'

// Mock the supabaseClient module
vi.mock('./supabaseClient', () => ({
  getSupabaseClient: vi.fn(),
}))

describe('getHighlights', () => {
  it('returns sample highlights when Supabase is not configured', () => {
    const { getSupabaseClient } = require('./supabaseClient')
    getSupabaseClient.mockReturnValue(null)

    const result = getHighlights()
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
  })

  it('fetches highlights from Supabase when configured', async () => {
    const { getSupabaseClient } = require('./supabaseClient')
    const mockClient = createMockSupabaseClient()
    getSupabaseClient.mockReturnValue(mockClient)

    // Mock the nested query
    mockClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: [{ id: 'h1' }] }),
    })

    const result = await getHighlights()
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns sample highlights when fetch fails', async () => {
    const { getSupabaseClient } = require('./supabaseClient')
    getSupabaseClient.mockReturnValue(null)

    const result = await getHighlights()
    expect(result).toBeDefined()
  })
})
```

**Verify**: `npm test lib/highlights.test.ts` → all tests pass

### Step 6: Add integration tests for app/page.tsx

Create `app/page.test.tsx` (this will be a server-side integration test):

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMockSupabaseClient } from '../tests/utils'
import Home from './page'

// Mock dependencies
vi.mock('./components/LibraryGrid')
vi.mock('./components/HighlightSection')
vi.mock('@/lib/highlights', () => ({
  getHighlights: vi.fn(() => Promise.resolve([])),
}))
vi.mock('@/lib/supabaseClient', () => ({
  getSupabaseClient: vi.fn(),
}))

describe('Home page integration tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default filters when no search params', async () => {
    const { getSupabaseClient } = require('@/lib/supabaseClient')
    getSupabaseClient.mockReturnValue(null)

    render(<Home searchParams={Promise.resolve({})} />)

    await waitFor(() => {
      expect(screen.getByText(/libraries.*tools/i)).toBeInTheDocument()
    })
  })

  it('renders with search query when q parameter is present', async () => {
    const { getSupabaseClient } = require('@/lib/supabaseClient')
    getSupabaseClient.mockReturnValue(null)

    render(<Home searchParams={Promise.resolve({ q: 'react' })} />)

    await waitFor(() => {
      expect(screen.getByText(/libraries.*tools/i)).toBeInTheDocument()
    })
  })

  it('handles tag filtering on client-side', async () => {
    const { getSupabaseClient } = require('@/lib/supabaseClient')
    getSupabaseClient.mockReturnValue(null)

    render(<Home searchParams={Promise.resolve({ tag: 'react' })} />)

    await waitFor(() => {
      expect(screen.getByText(/libraries.*tools/i)).toBeInTheDocument()
    })
  })

  it('displays saved tools when saved=1', async () => {
    const { getSupabaseClient } = require('@/lib/supabaseClient')
    getSupabaseClient.mockReturnValue(null)

    render(<Home searchParams={Promise.resolve({ saved: '1' })} />)

    await waitFor(() => {
      expect(screen.getByText(/saved tools/i)).toBeInTheDocument()
    })
  })
})
```

**Verify**: `npm test app/page.test.tsx` → all tests pass

### Step 7: Add tests for app/submit/page.tsx

Create `app/submit/page.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { redirect } from 'next/navigation'
import SubmitPage from './page'

// Mock dependencies
vi.mock('./components/Header')
vi.mock('./NameSlugFields')
vi.mock('./AddTags')
vi.mock('./SubmitButton')
vi.mock('@/lib/utils', () => ({
  slugify: vi.fn((str: string) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')),
}))
vi.mock('@/lib/supabaseClient', () => ({
  getSupabaseClient: vi.fn(),
  getSupabaseServerClient: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('Submit page tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the submit form when Supabase is configured', async () => {
    const { getSupabaseServerClient, getSupabaseClient } = require('@/lib/supabaseClient')
    getSupabaseServerClient.mockReturnValue(createMockSupabaseClient())
    getSupabaseClient.mockReturnValue(createMockSupabaseClient())

    render(<SubmitPage searchParams={Promise.resolve({})} />)

    await waitFor(() => {
      expect(screen.getByText(/submit library/i)).toBeInTheDocument()
    })
  })

  it('renders error message when Supabase is not configured', async () => {
    const { getSupabaseServerClient } = require('@/lib/supabaseClient')
    getSupabaseServerClient.mockReturnValue(null)
    getSupabaseClient.mockReturnValue(null)

    render(<SubmitPage searchParams={Promise.resolve({})} />)

    await waitFor(() => {
      expect(screen.getByText(/supabase.*not configured/i)).toBeInTheDocument()
    })
  })

  it('displays error when invalid PIN is submitted', async () => {
    const { getSupabaseServerClient, getSupabaseClient } = require('@/lib/supabaseClient')
    getSupabaseServerClient.mockReturnValue(createMockSupabaseClient())
    getSupabaseClient.mockReturnValue(createMockSupabaseClient())

    render(<SubmitPage searchParams={Promise.resolve({ error: 'invalid_pin' })} />)

    await waitFor(() => {
      expect(screen.getByText(/invalid pin/i)).toBeInTheDocument()
    })
  })
})
```

**Verify**: `npm test app/submit/page.test.tsx` → all tests pass

## Test plan

- **New tests to write**:
  - `lib/utils.test.ts` — 6 tests for slugify function (happy path, edge cases)
  - `lib/useSavedTools.test.tsx` — 6 tests for SavedToolsProvider (init, load, toggle, add, check)
  - `lib/highlights.test.ts` — 3 tests for getHighlights (null client, fetch success, fetch failure)
  - `app/page.test.tsx` — 4 tests for Home page (default, search query, tag filter, saved view)
  - `app/submit/page.test.tsx` — 3 tests for Submit page (configured, not configured, invalid PIN)

- **Existing test to use as structural pattern**: None (this is the first test file)

- **Verification**: `npm test` → all tests pass, exit 0

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0; all 18 new tests pass
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

- When adding new features to the Home page, add corresponding integration tests
- When adding new server actions, add unit tests for their logic
- When changing the slugify utility, update its tests
- When adding new Supabase queries, update the highlights tests with proper mocks
- A reviewer should scrutinize test coverage of edge cases (empty strings, special characters, null data)
