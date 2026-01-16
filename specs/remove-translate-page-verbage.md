# Chore: Remove Translate Page Header and Browse Button

## Chore Description
Remove the "Phraser" title, "Language learning with spaced repetition" subtitle, and the "Browse Saved Phrases" button from the translate page (home page). These elements should be removed from both the Next.js application code and the HTML mockup file to keep them in sync.

## Relevant Files
Use these files to resolve the chore:

- `src/app/page.tsx` - The main translate/home page component that contains the h1 title, subtitle paragraph, and Browse Saved Phrases button that need to be removed
- `mockup.html` - The HTML mockup file containing the Home Screen (sc01) which has the same elements that need to be removed to maintain consistency

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Update the Next.js Translate Page
- Open `src/app/page.tsx`
- Remove the h1 element containing "Phraser" (line 8-10)
- Remove the p element containing "Language learning with spaced repetition" (line 11-13)
- Remove the div containing the "Browse Saved Phrases" Link button (lines 15-22)
- Ensure the TranslationInput component remains and the page structure is still valid

### Step 2: Update the Mockup HTML
- Open `mockup.html`
- Locate the Home Screen section (sc01 - Home Screen) starting around line 732
- Remove the h1 with class "home-title" containing "Phraser" (line 766)
- Remove the p with class "home-subtitle" containing "Language learning with spaced repetition" (line 767)
- Remove the div containing the "Browse Saved Phrases" button (lines 769-771)
- Ensure the translation-input div remains intact

### Step 3: Run Validation Commands
- Run the build to ensure no compilation errors
- Run type checking to ensure no TypeScript errors

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `cd /Users/mekael/Documents/programming/typescript/phraser && bun run build` - Run build to validate no compilation errors
- `cd /Users/mekael/Documents/programming/typescript/phraser && bunx tsc --noEmit` - Run TypeScript type checking to validate no type errors

## Notes
- The header navigation still contains a link to Browse, so users can still access the browse page
- The TranslationInput component should remain as the main focus of the translate page
- The mockup.html is used as a design reference, so it should stay in sync with the actual app
