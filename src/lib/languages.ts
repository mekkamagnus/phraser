export const LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

export function getLanguageName(code: string): string {
  return LANGUAGES[code as LanguageCode] || code;
}

export function getLanguageCodes(): LanguageCode[] {
  return Object.keys(LANGUAGES) as LanguageCode[];
}
