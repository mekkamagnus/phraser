# Bug: fix-tag-phrases-fetch

## Bug Description
The `/tags/introduction` page (and other tag pages) displays an "Error: Failed to fetch phrases" message instead of listing phrases associated with the tag. This prevents users from viewing phrases filtered by tags.

## Problem Statement
The API endpoint `/api/phrases/list` fails to validate query parameters when `page` or `limit` are omitted from the request URL. The server responds with a 400 Bad Request error due to strict Zod schema validation that rejects `null` values returned by `URLSearchParams.get()`.

## Solution Statement
Modify the query parameter handling in `src/app/api/phrases/list/route.ts` to strictly pass `undefined` instead of `null` when parameters are missing. This will ensure the Zod schema's `.optional().default(...)` logic triggers correctly.

## Steps to Reproduce
1. Start the development server (`bun run dev`).
2. Navigate to `http://localhost:3500/tags/introduction`.
3. Observe the error message "Error: Failed to fetch phrases" on the page.
4. Open the browser's developer tools Network tab and verify that the request to `/api/phrases/list?tag=introduction` (without `page` and `limit`) returns a 400 status code.

## Root Cause Analysis
The `GET` handler in `src/app/api/phrases/list/route.ts` parses query parameters using `searchParams.get('param')`. If a parameter is missing, `get()` returns `null`.
The Zod schema defines these fields as `z.string().transform(Number).optional()`.
While `.optional()` allows `undefined`, it does **not** allow `null`.
Passing `{ page: null, limit: null }` to `schema.parse()` throws a "invalid_type" error ("expected string, received null").
This causes the API to catch the error and return a 400 Bad Request response.

## Relevant Files
Use these files to fix the bug:

- `src/app/api/phrases/list/route.ts`: The API route handler that needs modification.
- `src/app/api/phrases/list/__tests__/route.test.ts`: New test file to be created to verify the fix and prevent regressions.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create API Integration Test
- Create a new directory `src/app/api/phrases/list/__tests__`.
- Create `src/app/api/phrases/list/__tests__/route.test.ts`.
- Add a test case that sends a GET request to `/api/phrases/list` with only the `tag` parameter (omitting `page` and `limit`).
- Assert that the response status is 200 (ok) and not 400.

### 2. Fix Parameter Handling in API Route
- Edit `src/app/api/phrases/list/route.ts`.
- Update the `GET` function to treat `searchParams.get()` results as `undefined` if they are `null` (using `|| undefined`).
- Apply this fix to `page` and `limit` extraction.

### 3. Verify Fix with Tests
- Run the newly created test to ensure it passes.
- Run `src/app/tags/[tagName]/page.tsx` related tests if any exist (e.g., UI tests), or manually verify.

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

- `bun test src/app/api/phrases/list/__tests__/route.test.ts` - Verify the API accepts missing parameters.
