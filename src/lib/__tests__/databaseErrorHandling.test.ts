import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorHandler } from '@/lib/errorHandler';

describe('Database Error Handling', () => {
  beforeEach(() => {
    // Mock console.error to suppress error logs during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should sanitize database-related error messages', () => {
    const dbErrors = [
      'SQLITE_ERROR: database is locked',
      'Connection to database failed',
      'SQL syntax error near WHERE',
      'Database connection timeout',
      'FOREIGN KEY constraint failed'
    ];

    dbErrors.forEach(dbErrorMsg => {
      const error = new Error(dbErrorMsg);
      const result = ErrorHandler.createUserFriendlyMessage(error);
      expect(result).toBe('An internal error occurred. Please try again later.');
    });
  });

  it('should handle database operation errors gracefully', () => {
    const error = new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed: phrases.source_phrase');
    const result = ErrorHandler.createUserFriendlyMessage(error);
    expect(result).toBe('An internal error occurred. Please try again later.');
  });

  it('should handle connection errors', () => {
    const error = new Error('Connection to SQLite database failed');
    const result = ErrorHandler.createUserFriendlyMessage(error);
    expect(result).toBe('An internal error occurred. Please try again later.');
  });
});