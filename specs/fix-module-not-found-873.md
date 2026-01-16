# Bug: Cannot find module ./873.js

## Bug Description
Runtime error occurs when accessing the application: "Error: Cannot find module './873.js'". The error originates from webpack-runtime.js in the .next/server directory and causes a 500 error on page load. This is a webpack chunk caching issue that occurs when the Next.js build cache becomes stale or corrupted.

**Symptoms:**
- Application crashes with 500 error
- Error message: `Cannot find module './873.js'`
- Error stack points to `.next/server/webpack-runtime.js`

**Expected behavior:** Application loads normally without module resolution errors.

**Actual behavior:** Application crashes with MODULE_NOT_FOUND error for a webpack chunk file.

## Problem Statement
The `.next` build cache contains stale webpack chunk references. This typically occurs when:
1. A build runs while the dev server is actively serving/hot-reloading
2. The build cache becomes corrupted due to interrupted builds
3. Chunk numbering changes between builds but old references remain

## Solution Statement
Clear the `.next` build cache directory and rebuild the application. This forces Next.js to regenerate all webpack chunks with consistent references.

## Steps to Reproduce
1. Run dev server: `bun run dev`
2. Make changes to the codebase while dev server is running
3. Run build in another terminal: `bun run build`
4. Access the application - error may occur intermittently

## Root Cause Analysis
The error `Cannot find module './873.js'` indicates that:
1. Webpack generates numbered chunk files (e.g., 873.js) for code splitting
2. During hot module replacement or concurrent builds, chunk numbers can change
3. The webpack-runtime.js maintains a mapping to these chunks
4. When the mapping references a chunk number that no longer exists (or was renamed), the MODULE_NOT_FOUND error occurs
5. This is a build artifact caching issue, not a source code issue

The error stack trace shows:
- `.next/server/webpack-runtime.js` tries to require `./873.js`
- The chunk either doesn't exist or was regenerated with a different number
- This causes a cascading failure in route loading

## Relevant Files
Use these files to fix the bug:

- `.next/` - The Next.js build cache directory containing stale chunks. Needs to be deleted.
- `package.json` - Contains build scripts. May optionally add a clean script for convenience.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Stop Running Dev Server
- Ensure no dev server is running that might interfere with the cache clear
- Kill any processes on port 3001 or 3500

### Step 2: Clear the .next Build Cache
- Delete the `.next` directory completely
- This removes all stale webpack chunks and build artifacts
- Command: `rm -rf .next`

### Step 3: Rebuild the Application
- Run a fresh build to regenerate all chunks
- Command: `bun run build`
- Verify build completes successfully with no errors

### Step 4: Run Validation Commands
- Start the application and verify it loads without errors
- Test that the translate page and API routes work correctly

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

- `rm -rf /Users/mekael/Documents/programming/typescript/phraser/.next` - Clear stale build cache
- `cd /Users/mekael/Documents/programming/typescript/phraser && bun run build` - Rebuild application
- `cd /Users/mekael/Documents/programming/typescript/phraser && bun run start &` - Start production server
- `curl -s http://localhost:3000 | head -5` - Verify home page loads without 500 error

## Notes
- This is a common Next.js development issue, not a bug in the source code
- Consider adding a `clean` script to package.json for convenience: `"clean": "rm -rf .next"`
- To prevent this issue: avoid running `bun run build` while the dev server is running
- The chunk number (873) is arbitrary and changes between builds - it's not significant
- If the issue recurs frequently, consider also clearing `node_modules/.cache` if it exists
