import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorHandler } from '@/lib/errorHandler';

describe('Error Message Sanitization', () => {
  beforeEach(() => {
    // Mock console.error to suppress error logs during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should sanitize password-related error messages', () => {
    const sensitiveMessages = [
      'Password is incorrect',
      'Invalid password provided',
      'Password reset token expired',
      'Current password does not match'
    ];

    sensitiveMessages.forEach(msg => {
      const error = new Error(msg);
      const result = ErrorHandler.createUserFriendlyMessage(error);
      expect(result).toBe('An internal error occurred. Please try again later.');
    });
  });

  it('should sanitize token-related error messages', () => {
    const sensitiveMessages = [
      'JWT token invalid',
      'API token expired',
      'Invalid auth token',
      'Token verification failed'
    ];

    sensitiveMessages.forEach(msg => {
      const error = new Error(msg);
      const result = ErrorHandler.createUserFriendlyMessage(error);
      expect(result).toBe('An internal error occurred. Please try again later.');
    });
  });

  it('should sanitize secret-related error messages', () => {
    const sensitiveMessages = [
      'Secret key not found',
      'Invalid secret provided',
      'Secret verification failed',
      'Secrets configuration error'
    ];

    sensitiveMessages.forEach(msg => {
      const error = new Error(msg);
      const result = ErrorHandler.createUserFriendlyMessage(error);
      expect(result).toBe('An internal error occurred. Please try again later.');
    });
  });

  it('should sanitize database-related error messages', () => {
    const sensitiveMessages = [
      'Database connection failed',
      'SQL error occurred',
      'Database credentials invalid',
      'Connection pool exhausted'
    ];

    sensitiveMessages.forEach(msg => {
      const error = new Error(msg);
      const result = ErrorHandler.createUserFriendlyMessage(error);
      expect(result).toBe('An internal error occurred. Please try again later.');
    });
  });

  it('should sanitize internal error messages', () => {
    const sensitiveMessages = [
      'Internal server error',
      'Internal processing failed',
      'Internal configuration error',
      'Internal validation error'
    ];

    sensitiveMessages.forEach(msg => {
      const error = new Error(msg);
      const result = ErrorHandler.createUserFriendlyMessage(error);
      expect(result).toBe('An internal error occurred. Please try again later.');
    });
  });

  it('should allow non-sensitive error messages to be sanitized generically', () => {
    const normalErrors = [
      'File not found',
      'Permission denied',
      'Timeout exceeded',
      'Resource unavailable'
    ];

    normalErrors.forEach(msg => {
      const error = new Error(msg);
      const result = ErrorHandler.createUserFriendlyMessage(error);
      expect(result).toBe('An error occurred. Please try again.');
    });
  });

  it('should handle mixed-case sensitive terms', () => {
    const mixedCaseErrors = [
      'PASSWORD is wrong',
      'Database CONNECTION failed',
      'Invalid TOKEN provided',
      'SECRET key missing'
    ];

    mixedCaseErrors.forEach(msg => {
      const error = new Error(msg);
      const result = ErrorHandler.createUserFriendlyMessage(error);
      expect(result).toBe('An internal error occurred. Please try again later.');
    });
  });
});