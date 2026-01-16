# Chore: Fix Development Server Errors

## Chore Description
Fix the errors occurring in the development server, specifically the TypeError related to timestamp handling in Drizzle ORM and the ReferenceError for window object in the error handler. The errors are preventing the /api/review/due-cards and /api/stats/review endpoints from functioning properly.

## Relevant Files
Use these files to resolve the chore:

- `src/lib/errorHandler.ts` - Contains the error handler with the problematic window reference
- `src/app/api/review/due-cards/route.ts` - The API route causing the timestamp error
- `src/app/api/stats/review/route.ts` - Another API route experiencing the same issue
- `src/lib/db/schema.ts` - Database schema definitions that may have timestamp field issues
- `src/lib/db/index.ts` - Database connection and initialization
- `next.config.js` - Configuration file for cross-origin warnings

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Phase 1: Fix Server-Side Window Reference Issue
- Update the error handler to properly detect if running in browser vs server environment
- Modify the window reference check to be compatible with server-side rendering

### Phase 2: Address Timestamp Data Type Issues
- Investigate the database schema to identify timestamp fields causing issues
- Check how dates/times are being queried and processed in the affected API routes
- Fix any incorrect data type handling in the database queries

### Phase 3: Validate Fixes
- Restart the development server to confirm errors are resolved
- Test the previously failing API endpoints to ensure they return 200 status codes

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `bun run dev` - Start the development server and verify no errors occur
- `curl http://localhost:3001/api/review/due-cards` - Test the due cards endpoint
- `curl http://localhost:3001/api/stats/review` - Test the stats review endpoint

## Notes
The main issues are: 1) Server-side code trying to access browser-specific `window` object, and 2) Drizzle ORM expecting Date objects but receiving other types in timestamp fields. Both need to be fixed to resolve the 500 errors on the API endpoints.