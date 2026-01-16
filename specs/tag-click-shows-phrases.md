# Chore: Tag Click Shows Phrases

## Chore Description
On the tags page (`/tags`), clicking a tag should navigate to a new screen that displays all phrases/cards associated with that tag. Currently, tags are displayed as static divs. This feature will make tags clickable and create a new dynamic route to show filtered phrases by tag.

## Relevant Files
Use these files to resolve the chore:

- `src/app/tags/page.tsx` - The tags listing page. Needs to be updated to make tags clickable with navigation to the tag detail page.
- `src/app/api/phrases/list/route.ts` - The API route for fetching phrases. Needs to support filtering by tag name via query parameter.
- `src/components/PhraseList.tsx` - The phrase list component used on `/browse`. Can be reused or referenced for the tag detail page.

### New Files
- `src/app/tags/[tagName]/page.tsx` - New dynamic route page that displays all phrases for a specific tag.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Update API to Support Tag Filtering
- Modify `src/app/api/phrases/list/route.ts` to accept a `tag` query parameter
- Update the Zod schema to include optional `tag` parameter
- When `tag` is provided, filter the query to only return phrases that have that tag
- Add a WHERE clause that joins with `phraseTags` and `tags` tables to filter by tag name

### Step 2: Create Tag Detail Page
- Create new file `src/app/tags/[tagName]/page.tsx`
- This is a dynamic route that receives `tagName` as a URL parameter
- The page should:
  - Display a header showing the tag name
  - Fetch phrases filtered by the tag using the updated API endpoint
  - Display the phrases in a card layout similar to the browse page
  - Include a back button/link to return to the tags list
  - Handle loading and error states
  - Handle empty state when no phrases have that tag

### Step 3: Make Tags Clickable on Tags Page
- Update `src/app/tags/page.tsx` to wrap each tag in a Link component
- Import `Link` from `next/link`
- Change the tag `<div>` to a `<Link>` that navigates to `/tags/{tagName}`
- Ensure the tag name is URL-encoded for tags with special characters
- Add hover styles to indicate clickability (cursor-pointer, hover effect)

### Step 4: Run Validation Commands
- Run build to ensure no compilation errors
- Run type checking to ensure no TypeScript errors

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `cd /Users/mekael/Documents/programming/typescript/phraser && bun run build` - Run build to validate no compilation errors
- `cd /Users/mekael/Documents/programming/typescript/phraser && bunx tsc --noEmit` - Run TypeScript type checking to validate no type errors

## Notes
- The tag name in the URL should be URL-encoded using `encodeURIComponent()` when creating links and decoded using `decodeURIComponent()` when reading the parameter
- The tag detail page layout should be consistent with the browse page for a cohesive user experience
- Consider using the existing PhraseList component with a tag filter prop, or create a simplified version specific to this use case
- The API filtering should be case-sensitive to match exact tag names
