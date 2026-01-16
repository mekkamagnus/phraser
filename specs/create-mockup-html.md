# Chore: Create mockup.html with iPhone-sized UI mockups

## Chore Description
Create a mockup.html file that contains UI mockups of all screens of the Phraser app. The screen sizes and frames should be designed for iPhone devices to provide a mobile-first preview of the application. This is purely for visual representation and does not require any functionality. The mockup should include all major screens of the application: home page, browse phrases, dashboard, review, tags, and any other key screens.

## Relevant Files
Use these files to resolve the chore:

- `src/app/page.tsx` - Contains the home page layout and UI elements that need to be mocked up
- `src/app/browse/page.tsx` - Contains the browse phrases page that needs to be included in the mockup  
- `src/app/dashboard/page.tsx` - Contains the dashboard page with statistics that needs to be mocked
- `src/app/review/page.tsx` - Contains the flashcard review interface that needs to be included in the mockup
- `src/app/tags/page.tsx` - Contains the tags page that needs to be included in the mockup
- `src/app/layout.tsx` - Contains the header and overall layout structure that should be consistent across mockups
- `src/components/TranslationInput.tsx` - Contains the complex translation input form that needs to be represented in the mockup
- `src/components/Header.tsx` - Contains the navigation header that appears on all screens

## Step by Step Tasks
### 1. Set up the HTML structure for iPhone mockup frames
- Create a responsive HTML document with CSS that simulates iPhone screen dimensions (375x812px for iPhone 12/13 Pro)
- Add a container that holds multiple iPhone frames side by side for different app screens
- Include basic styling to make the iPhone frames look realistic with a notch and rounded corners

### 2. Create mockup for the home page screen
- Replicate the layout from src/app/page.tsx in static HTML/CSS
- Include the "Phraser" title, subtitle, "Browse Saved Phrases" button, and the TranslationInput component
- Use placeholder content that mimics the actual UI without functionality

### 3. Create mockup for the browse phrases screen
- Replicate the layout from src/app/browse/page.tsx in static HTML/CSS
- Include the "Saved Phrases" heading and the PhraseList component with placeholder content
- Show how the phrase list would appear in the mobile view

### 4. Create mockup for the dashboard screen
- Replicate the layout from src/app/dashboard/page.tsx in static HTML/CSS
- Include the "Review Statistics" heading and the four statistic cards (Total Cards, Due Today, Reviewed Today, Current Streak)
- Add the "Start Review Session" button at the bottom
- Use placeholder values for the statistics

### 5. Create mockup for the review screen
- Replicate the layout from src/app/review/page.tsx in static HTML/CSS
- Include the flashcard with "Click card to flip" functionality shown visually
- Add the rating buttons (Again, Hard, Good, Easy) at the bottom
- Show the progress indicator at the top

### 6. Create mockup for the tags screen
- Replicate the layout from src/app/tags/page.tsx in static HTML/CSS
- Include the "All Tags" heading and the grid of tag elements
- Show how tags would be displayed in a grid layout on mobile

### 7. Add consistent header and navigation
- Include the header from src/app/layout.tsx/src/components/Header.tsx in each mockup screen
- Ensure consistent navigation elements across all screens
- Add placeholder navigation items that would appear in the header

### 8. Apply consistent styling and design system
- Use the same color scheme as the actual application (blues, grays, etc.)
- Apply similar typography and spacing as seen in the real app
- Ensure the mockup accurately represents the Tailwind CSS classes used in the actual app

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `open specs/mockup.html` - Open the mockup file in a browser to visually validate all screens are properly displayed
- `npx html-validate specs/mockup.html` - Validate the HTML markup is correct and follows standards
- `npx stylelint specs/mockup.html` - Check that CSS styling follows best practices

## Notes
- The mockup should be a single HTML file with multiple iPhone-sized containers showing different screens
- Use semantic HTML and proper accessibility attributes even though it's a mockup
- Consider using CSS media queries to ensure the mockup looks good on different screen sizes
- The mockup should represent the dark/light mode styling that exists in the actual application
- Include visual indicators for interactive elements like buttons and cards to show their hover/click states