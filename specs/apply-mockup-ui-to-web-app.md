# Chore: Apply mockup.html UI to web application

## Chore Description
Apply the UI design from mockup.html to the actual web application. This involves updating the existing Next.js components and pages to match the mobile-friendly design, typography, navigation patterns, and visual elements implemented in the mockup.html file. The goal is to make the web application have the same mobile-optimized UI as shown in the mockup.

## Relevant Files
Use these files to resolve the chore:

- `mockup.html` - The reference mockup file with the desired UI design
- `src/app/layout.tsx` - The main layout file that needs updated header/navigation
- `src/components/Header.tsx` - The header component that needs to be updated with hamburger menu
- `src/app/page.tsx` - The home page that needs updated UI to match mockup
- `src/components/TranslationInput.tsx` - The translation input component that needs styling updates
- `src/app/browse/page.tsx` - The browse page that needs updated UI to match mockup
- `src/components/PhraseList.tsx` - The phrase list component that needs card-based layout
- `src/app/dashboard/page.tsx` - The dashboard page that needs updated UI to match mockup
- `src/app/review/page.tsx` - The review page that needs updated UI to match mockup
- `src/app/tags/page.tsx` - The tags page that needs updated UI to match mockup
- `src/app/globals.css` - The global CSS file that may need additional styles

## Step by Step Tasks
### 1. Update Header component with hamburger menu
- Modify Header.tsx to include hamburger menu icon for mobile screens
- Implement mobile menu that appears when hamburger is clicked
- Add CSS media query to show/hide hamburger menu based on screen size
- Ensure navigation links work properly in both desktop and mobile views

### 2. Update home page UI to match mockup
- Update src/app/page.tsx to match the styling from mockup.html home screen
- Adjust the layout, colors, and spacing to match the mockup
- Update the "Browse Saved Phrases" button styling
- Ensure the TranslationInput component integrates well with the new design

### 3. Update TranslationInput component styling
- Modify TranslationInput.tsx to match the styling from mockup.html
- Update language selectors, input areas, and buttons to match mockup design
- Ensure form elements have proper touch targets for mobile
- Update tag input and display to match mockup styling

### 4. Update browse page UI to match mockup
- Update src/app/browse/page.tsx to match the styling from mockup.html browse screen
- Adjust the layout, colors, and spacing to match the mockup
- Ensure the page integrates well with the updated header

### 5. Update PhraseList component with card-based layout
- Modify PhraseList.tsx to implement the card-based layout from mockup.html
- Replace the table-based layout with individual phrase cards
- Update the styling for each phrase card to match the mockup
- Ensure proper spacing and touch targets for mobile

### 6. Update dashboard page UI to match mockup
- Update src/app/dashboard/page.tsx to match the styling from mockup.html dashboard screen
- Adjust the stats grid layout to match the mockup
- Update the styling of statistic cards to match the mockup
- Ensure proper mobile responsiveness

### 7. Update review page UI to match mockup
- Update src/app/review/page.tsx to match the styling from mockup.html review screen
- Adjust the flashcard layout and rating buttons to match the mockup
- Update the styling for the flip animation and rating buttons
- Ensure proper mobile touch targets for the rating buttons

### 8. Update tags page UI to match mockup
- Update src/app/tags/page.tsx to match the styling from mockup.html tags screen
- Adjust the tag grid layout to match the mockup
- Update the styling of individual tags to match the mockup
- Ensure proper mobile responsiveness

### 9. Add necessary CSS styles to globals.css
- Add any missing CSS classes or styles needed to match the mockup design
- Ensure the new styles work with Tailwind CSS classes
- Add media queries for responsive behavior

### 10. Test and validate UI changes
- Verify all pages display correctly with the new UI
- Test mobile responsiveness on different screen sizes
- Ensure all interactive elements work properly
- Validate that the hamburger menu functions correctly

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `npm run dev` - Start the development server to visually validate UI changes
- `npm run build` - Build the application to ensure no build errors
- `npm run lint` - Run linting to ensure code quality
- `npm test` - Run tests to validate the chore is complete with zero regressions

## Notes
- Pay attention to mobile-first design principles when implementing the changes
- Ensure all interactive elements have appropriate touch targets (minimum 44px)
- Maintain accessibility standards with proper contrast ratios and semantic HTML
- Use Tailwind CSS classes where possible to maintain consistency with the existing codebase
- Test the hamburger menu functionality across different screen sizes
- Ensure the card-based layout for phrases is responsive and works well on mobile