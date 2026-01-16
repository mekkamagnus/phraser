import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDueCards, updateCardRating } from '../review';

// Mock the database
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    from: vi.fn(),
    innerJoin: vi.fn(),
    where: vi.fn(),
    update: vi.fn(),
    limit: vi.fn(),
  }
}));

// Mock the schema
vi.mock('@/db/schema', () => ({
  phrases: {},
  srsData: {},
  eq: vi.fn(),
  lte: vi.fn(),
}));

describe('Review Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDueCards', () => {
    it('should return cards due for review', async () => {
      // Mock the database response
      const mockDb = await import('@/db');
      const mockSchema = await import('@/db/schema');
      
      const mockSelect = vi.fn();
      const mockFrom = vi.fn();
      const mockInnerJoin = vi.fn();
      const mockWhere = vi.fn();
      const mockLimit = vi.fn();
      
      mockSelect.mockReturnValue(mockFrom);
      mockFrom.mockReturnValue(mockInnerJoin);
      mockInnerJoin.mockReturnValue(mockWhere);
      mockWhere.mockReturnValue(Promise.resolve([
        { phrases: { id: 1, sourcePhrase: 'Hello', translation: 'Hola', sourceLanguage: 'en', targetLanguage: 'es', createdAt: 0, updatedAt: 0 } }
      ]));
      
      (mockDb.db.select as any).mockImplementation(mockSelect);
      (mockSchema.lte as any).mockReturnValue('lte_condition');
      (mockSchema.eq as any).mockReturnValue('eq_condition');
      
      const result = await getDueCards();
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        sourcePhrase: 'Hello',
        translation: 'Hola',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        createdAt: 0,
        updatedAt: 0
      });
    });
  });

  describe('updateCardRating', () => {
    it('should update card rating based on SM-2 algorithm', async () => {
      // Mock the database response
      const mockDb = await import('@/db');
      const mockSchema = await import('@/db/schema');
      
      const mockSelect = vi.fn();
      const mockFrom = vi.fn();
      const mockWhere = vi.fn();
      const mockUpdate = vi.fn();
      const mockSet = vi.fn();
      const mockLimit = vi.fn();
      
      // Mock getting current SRS data
      mockSelect.mockReturnValue(mockFrom);
      mockFrom.mockReturnValue(mockWhere);
      mockWhere.mockReturnValue(mockLimit);
      mockLimit.mockReturnValue(Promise.resolve([{
        id: 1,
        phraseId: 1,
        easeFactor: 250, // 2.5 * 100
        interval: 1,
        repetitions: 0,
        nextReviewDate: Math.floor(Date.now() / 1000) - 86400, // Yesterday
        lastReviewDate: null,
        createdAt: 0,
        updatedAt: 0
      }]));
      
      // Mock updating SRS data
      mockUpdate.mockReturnValue(mockSet);
      mockSet.mockReturnValue(Promise.resolve());
      
      (mockDb.db.select as any).mockImplementationOnce(mockSelect);
      (mockDb.db.update as any).mockImplementationOnce(mockUpdate);
      (mockSchema.eq as any).mockReturnValue('eq_condition');
      
      await updateCardRating(1, 'good');
      
      expect(mockUpdate).toHaveBeenCalledWith(expect.anything()); // srsData table
      expect(mockSet).toHaveBeenCalled();
    });
  });
});