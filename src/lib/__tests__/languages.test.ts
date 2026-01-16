import { describe, it, expect } from 'vitest';
import { LANGUAGES, getLanguageName, getLanguageCodes, type LanguageCode } from '../languages';

describe('languages', () => {
  describe('LANGUAGES', () => {
    it('should have all required languages', () => {
      expect(LANGUAGES).toEqual({
        en: 'English',
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        it: 'Italian',
        pt: 'Portuguese',
        zh: 'Chinese',
        ja: 'Japanese',
        ko: 'Korean',
      });
    });

    it('should have 9 languages', () => {
      expect(Object.keys(LANGUAGES)).toHaveLength(9);
    });
  });

  describe('getLanguageName', () => {
    it('should return correct language name for valid code', () => {
      expect(getLanguageName('en')).toBe('English');
      expect(getLanguageName('es')).toBe('Spanish');
      expect(getLanguageName('fr')).toBe('French');
      expect(getLanguageName('de')).toBe('German');
      expect(getLanguageName('it')).toBe('Italian');
      expect(getLanguageName('pt')).toBe('Portuguese');
      expect(getLanguageName('zh')).toBe('Chinese');
      expect(getLanguageName('ja')).toBe('Japanese');
      expect(getLanguageName('ko')).toBe('Korean');
    });

    it('should return the code itself for invalid language code', () => {
      expect(getLanguageName('invalid')).toBe('invalid');
      expect(getLanguageName('xx')).toBe('xx');
    });
  });

  describe('getLanguageCodes', () => {
    it('should return all language codes', () => {
      const codes = getLanguageCodes();
      expect(codes).toEqual(['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko']);
    });

    it('should return LanguageCode type', () => {
      const codes = getLanguageCodes();
      codes.forEach((code) => {
        expect(['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko']).toContain(code);
      });
    });
  });
});
