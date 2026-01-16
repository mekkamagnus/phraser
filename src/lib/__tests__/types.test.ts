import { describe, it, expect } from 'vitest';
import { Phrase } from '../types';

describe('Types', () => {
  it('should define Phrase interface correctly', () => {
    // This test verifies that the Phrase interface is properly defined
    const samplePhrase: Phrase = {
      id: 1,
      sourcePhrase: 'Hello',
      translation: 'Hola',
      sourceLanguage: 'en',
      targetLanguage: 'es',
      createdAt: 1234567890,
      updatedAt: 1234567890
    };
    
    expect(samplePhrase).toHaveProperty('id');
    expect(samplePhrase).toHaveProperty('sourcePhrase');
    expect(samplePhrase).toHaveProperty('translation');
    expect(samplePhrase).toHaveProperty('sourceLanguage');
    expect(samplePhrase).toHaveProperty('targetLanguage');
    expect(samplePhrase).toHaveProperty('createdAt');
    expect(samplePhrase).toHaveProperty('updatedAt');
  });
});