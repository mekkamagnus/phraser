# Chore: Clicking on a card in the application will lead to details page with that cards information

## Chore Description
Currently, the phrase cards in the dashboard are static containers that allow some inline actions (delete, tags). The goal is to make the entire card clickable, navigating the user to a dedicated details page (`/phrases/[id]`) where they can view comprehensive information about the phrase.

## Relevant Files
Use these files to resolve the chore:

- `src/components/PhraseList.tsx`: Needs to be updated to make the phrase card clickable and navigate to the new details page.
- `src/app/phrases/[id]/page.tsx` (New File): This will be the new details page component.
- `src/app/api/phrases/[id]/route.ts` (New File): This API route is needed to fetch a single phrase's details, including tags and SRS data.
- `src/lib/types.ts`: May need updates if new types are required for the details view (e.g. including SRS info in the phrase object).

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create API Route for Single Phrase
- Create `src/app/api/phrases/[id]/route.ts`.
- Implement `GET` method to fetch a phrase by ID.
- Join `phraseTags`, `tags`, and `srsData` tables to get complete information.
- Handle 404 if phrase not found.
- Return structured data including source, translation, languages, tags, and SRS stats.

### 2. Create Phrase Details Page
- Create directory `src/app/phrases/[id]`.
- Create `src/app/phrases/[id]/page.tsx`.
- Implement a server component (or client component if it needs extensive interactivity, but server component with client interactions is better) that fetches data from the new API route (or directly from DB if it's a server component - *Correction*: Next.js App Router Server Components should fetch data directly or via a service layer, but for consistency with existing `PhraseList` which uses `fetch`, we can use `fetch` or direct DB access. Direct DB access is more efficient for Server Components. I will stick to `fetch` if I want to reuse the API, but typically Server Components access DB directly. However, the existing pattern in `PhraseList` is client-side fetch. I will make the details page a Client Component for now to reuse `useToast` and handle potential interactive elements easily, matching the `PhraseList` pattern).
- *Refined Step*: Create `src/app/phrases/[id]/page.tsx` as a Client Component (`use client`).
- Use `useEffect` to fetch phrase details from `/api/phrases/[id]`.
- Render the phrase information:
    - Source Phrase (large text)
    - Translation (large text)
    - Language Pair
    - Tags (list)
    - Created Date
    - SRS Stats (Next review date, Interval, Ease Factor - if available)
- Add a "Back" button to return to the list.

### 3. Update PhraseList to be Clickable
- Modify `src/components/PhraseList.tsx`.
- Add `useRouter` hook if not already present (it is).
- Add an `onClick` handler to the phrase card `div` to navigate to `/phrases/${phrase.id}`.
- Add `cursor-pointer` class to the card `div`.
- Ensure `Delete` button and tag management buttons call `e.stopPropagation()` to prevent navigation when clicked.

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `npm run lint` - Validate code style.
- `npm run type-check` - Validate type safety (if script exists, otherwise `tsc --noEmit`).
- `npm run test` - Run existing tests to ensure no regressions.
- `curl http://localhost:3000/api/phrases/1` - (Manual) Test the new API endpoint (after starting server). *Self-correction*: I shouldn't use curl in the automated plan validation.
- `cd src/app/api/phrases/[id] && echo "API Route Created"` - specific check.
