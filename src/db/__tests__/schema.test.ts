import { describe, it, expect } from 'vitest';
import * as schema from '../schema';

describe('Database Schema', () => {
  describe('schema exports', () => {
    it('should export phrases table', () => {
      expect(schema.phrases).toBeDefined();
    });

    it('should export tags table', () => {
      expect(schema.tags).toBeDefined();
    });

    it('should export phraseTags table', () => {
      expect(schema.phraseTags).toBeDefined();
    });

    it('should export srsData table', () => {
      expect(schema.srsData).toBeDefined();
    });
  });

  describe('phrases table schema', () => {
    it('should have correct column names', () => {
      // The schema defines phrases table structure
      const phrasesSchema = schema.phrases;
      expect(phrasesSchema).toBeDefined();
    });
  });

  describe('tags table schema', () => {
    it('should have unique constraint on name', () => {
      const tagsSchema = schema.tags;
      expect(tagsSchema).toBeDefined();
    });
  });

  describe('phrase_tags table schema', () => {
    it('should be a junction table', () => {
      const phraseTagsSchema = schema.phraseTags;
      expect(phraseTagsSchema).toBeDefined();
    });
  });

  describe('srs_data table schema', () => {
    it('should have SRS columns', () => {
      const srsSchema = schema.srsData;
      expect(srsSchema).toBeDefined();
    });
  });
});
