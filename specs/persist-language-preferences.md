# Chore: Persist Language Preferences

## Chore Description
Add localStorage persistence for the last selected language pairs (source and target languages) on the translate screen. When the user selects a source or target language, the selection should be saved to localStorage. When the page loads, the component should check localStorage for previously saved language preferences and use them as the initial values instead of the hardcoded defaults (en → es). This improves user experience by eliminating the need to reselect languages on every page visit.

## Relevant Files
Use these files to resolve the chore:

- `src/components/TranslationInput.tsx` - The main translation input component containing the language selector state (`sourceLanguage` and `targetLanguage`). This is where localStorage read/write logic needs to be added to persist and restore language preferences.
- `src/lib/languages.ts` - Contains the `LanguageCode` type and `LANGUAGES` constant. Needed to validate that any stored language code is a valid language code before using it.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Define localStorage Keys
- In `src/components/TranslationInput.tsx`, define constants for the localStorage keys at the top of the file (after imports, before the component)
- Use descriptive key names:
  - `const SOURCE_LANGUAGE_KEY = 'phraser_source_language';`
  - `const TARGET_LANGUAGE_KEY = 'phraser_target_language';`

### Step 2: Create Helper Functions for localStorage
- Add a helper function to safely get a language from localStorage with validation:
  ```typescript
  function getStoredLanguage(key: string, defaultValue: LanguageCode): LanguageCode {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    if (stored && stored in LANGUAGES) {
      return stored as LanguageCode;
    }
    return defaultValue;
  }
  ```
- This function:
  - Handles SSR case (window undefined)
  - Validates that stored value is a valid LanguageCode
  - Falls back to default if invalid or missing

### Step 3: Initialize State from localStorage
- Modify the useState initializers for `sourceLanguage` and `targetLanguage` to use lazy initialization
- Use callback functions that read from localStorage on first render:
  ```typescript
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>(() =>
    getStoredLanguage(SOURCE_LANGUAGE_KEY, 'en')
  );
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>(() =>
    getStoredLanguage(TARGET_LANGUAGE_KEY, 'es')
  );
  ```

### Step 4: Add useEffect to Persist Language Changes
- Add a useEffect hook that saves to localStorage whenever `sourceLanguage` changes:
  ```typescript
  useEffect(() => {
    localStorage.setItem(SOURCE_LANGUAGE_KEY, sourceLanguage);
  }, [sourceLanguage]);
  ```
- Add a useEffect hook that saves to localStorage whenever `targetLanguage` changes:
  ```typescript
  useEffect(() => {
    localStorage.setItem(TARGET_LANGUAGE_KEY, targetLanguage);
  }, [targetLanguage]);
  ```

### Step 5: Run Validation Commands
- Run the build to ensure no compilation errors
- Run type checking to ensure no TypeScript errors

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `cd /Users/mekael/Documents/programming/typescript/phraser && bun run build` - Run build to validate no compilation errors
- `cd /Users/mekael/Documents/programming/typescript/phraser && bunx tsc --noEmit` - Run TypeScript type checking to validate no type errors

## Notes
- Using lazy initialization (`useState(() => ...)`) prevents unnecessary localStorage reads on subsequent renders
- The `typeof window === 'undefined'` check handles Next.js server-side rendering where localStorage is not available
- Validating the stored value against `LANGUAGES` prevents errors if the user manually edits localStorage with an invalid value or if we remove/rename language codes in the future
- The prefix `phraser_` is used for the localStorage keys to namespace them and avoid conflicts with other apps
- The swap languages functionality (`handleSwapLanguages`) will automatically trigger both useEffect hooks, updating both localStorage values
