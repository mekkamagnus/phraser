import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorHandler, createErrorResponse } from '@/lib/errorHandler';

describe('ErrorHandler', () => {
  beforeEach(() => {
    // Mock console.error to suppress error logs during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logError', () => {
    it('should log an error with context information', () => {
      const error = new Error('Test error');
      const context = { url: '/test-url', userId: '123' };
      
      const result = ErrorHandler.logError(error, context);
      
      expect(result.name).toBe('Error');
      expect(result.message).toBe('Test error');
      expect(result.context.url).toBe('/test-url');
      expect(result.context.userId).toBe('123');
      expect(result.context.timestamp).toBeTypeOf('number');
    });

    it('should include stack trace in context', () => {
      const error = new Error('Test error');
      const result = ErrorHandler.logError(error);
      
      expect(result.context.stack).toContain('Test error');
    });
  });

  describe('createUserFriendlyMessage', () => {
    it('should return generic message for sensitive errors', () => {
      const sensitiveErrors = [
        'Database connection failed',
        'Invalid password',
        'Token expired',
        'SQL injection detected',
        'Internal server error'
      ];

      sensitiveErrors.forEach(msg => {
        const error = new Error(msg);
        const result = ErrorHandler.createUserFriendlyMessage(error);
        expect(result).toBe('An internal error occurred. Please try again later.');
      });
    });

    it('should return network error message for network-related errors', () => {
      const networkErrors = [
        'Network error occurred',
        'Failed to fetch resource',
        'Connection timeout',
        'Request failed with status 500'
      ];

      networkErrors.forEach(msg => {
        const error = new Error(msg);
        const result = ErrorHandler.createUserFriendlyMessage(error);
        expect(result).toBe('Network error. Please check your connection and try again.');
      });
    });

    it('should return validation error message for validation errors', () => {
      const validationErrors = [
        'Validation failed',
        'Invalid input provided',
        'Zod validation error'
      ];

      validationErrors.forEach(msg => {
        const error = new Error(msg);
        const result = ErrorHandler.createUserFriendlyMessage(error);
        expect(result).toBe('Invalid input provided. Please check your entries and try again.');
      });
    });

    it('should return generic message for other errors', () => {
      const error = new Error('Some other error');
      const result = ErrorHandler.createUserFriendlyMessage(error);
      expect(result).toBe('An error occurred. Please try again.');
    });
  });

  describe('handleError', () => {
    it('should handle error and return sanitized response', () => {
      const error = new Error('Test error');
      const context = { url: '/test-url' };
      
      const result = ErrorHandler.handleError(error, context);
      
      expect(result.error).toBe('An error occurred. Please try again.');
      expect(result.timestamp).toBeDefined();
    });

    it('should return original error and stack in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Test error');
      const result = ErrorHandler.handleError(error);
      
      expect(result.originalError).toBe('Test error');
      expect(result.stack).toContain('Test error');
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});

describe('createErrorResponse', () => {
  it('should create a response with error information', async () => {
    const error = new Error('Test error');
    const response = createErrorResponse(error, { url: '/test-url' }, 400);
    
    expect(response.status).toBe(400);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    
    const responseBody = await response.json();
    expect(responseBody.error).toBe('An error occurred. Please try again.');
    expect(responseBody.timestamp).toBeDefined();
  });
});