# Chore: Add Language Swap Button

## Chore Description
Add a reverse/swap icon button between the "From" and "To" language dropdowns in the TranslationInput component. When clicked, this button will swap the source and target languages, similar to Google Translate's swap functionality. This provides a convenient way for users to quickly reverse their translation direction without manually changing both dropdowns.

## Relevant Files
Use these files to resolve the chore:

- `src/components/TranslationInput.tsx` - The main translation input component containing the language selector dropdowns. This is where the swap button needs to be added between the From and To selectors, and the swap handler function needs to be implemented.
- `mockup.html` - The HTML mockup file containing the Home Screen (sc01) which should be updated to include the swap button for design consistency.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add Swap Handler Function
- Open `src/components/TranslationInput.tsx`
- Add a new `handleSwapLanguages` function that swaps the `sourceLanguage` and `targetLanguage` state values
- The function should:
  - Store the current sourceLanguage in a temp variable
  - Set sourceLanguage to current targetLanguage
  - Set targetLanguage to the temp variable (original sourceLanguage)

### Step 2: Update Language Selector Layout
- Modify the language selectors grid from `grid-cols-2` to a flexbox layout or 3-column grid to accommodate the swap button
- The layout should be: [From dropdown] [Swap button] [To dropdown]
- Ensure the swap button is vertically centered between the two dropdowns
- The button should be positioned at the bottom of the labels (aligned with the select elements)

### Step 3: Add Swap Button Component
- Add a button element between the two language selector divs
- Use a swap/reverse icon (⇄ or similar arrows icon)
- Style the button to:
  - Be circular or rounded
  - Have a hover state
  - Be accessible (add aria-label)
  - Match the existing design system (colors, sizing)
- Wire up the `onClick` to call `handleSwapLanguages`

### Step 4: Update Mockup HTML
- Open `mockup.html`
- Locate the Home Screen (sc01) language selectors section
- Update the layout to include a swap button between the From and To selectors
- Style the button to match the mockup design aesthetic

### Step 5: Run Validation Commands
- Run the build to ensure no compilation errors
- Run type checking to ensure no TypeScript errors

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `cd /Users/mekael/Documents/programming/typescript/phraser && bun run build` - Run build to validate no compilation errors
- `cd /Users/mekael/Documents/programming/typescript/phraser && bunx tsc --noEmit` - Run TypeScript type checking to validate no type errors

## Notes
- The swap button should use a recognizable icon like ⇄ (U+21C4) or ⇆ (U+21C6) or an SVG arrow icon
- Consider using a simple Unicode character first for simplicity, can upgrade to SVG later if needed
- The button should have clear visual feedback on hover/click
- Accessibility: Include `aria-label="Swap languages"` for screen readers
- The swap functionality should work regardless of whether there's text in the input or a translation result
