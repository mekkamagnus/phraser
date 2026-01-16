import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NetworkErrorHandler, makeApiCall } from '@/lib/networkErrorHandler';

describe('NetworkErrorHandler', () => {
  beforeEach(() => {
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchWithRetry', () => {
    it('should return successful response without retries', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'success' }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const response = await NetworkErrorHandler.fetchWithRetry('/api/test');

      expect(response).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on network error and eventually succeed', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'success' }),
      };
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse);

      const response = await NetworkErrorHandler.fetchWithRetry('/api/test', {}, { maxRetries: 2 });

      expect(response).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on retryable status codes and eventually succeed', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'success' }),
      };
      const errorResponse = {
        ok: false,
        status: 503,
        json: vi.fn().mockResolvedValue({ error: 'Service unavailable' }),
      };
      (global.fetch as any)
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(mockResponse);

      const response = await NetworkErrorHandler.fetchWithRetry('/api/test', {}, { maxRetries: 3 });

      expect(response).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const errorResponse = {
        ok: false,
        status: 503,
        json: vi.fn().mockResolvedValue({ error: 'Service unavailable' }),
      };
      (global.fetch as any).mockResolvedValue(errorResponse);

      await expect(NetworkErrorHandler.fetchWithRetry('/api/test', {}, { maxRetries: 2 }))
        .rejects.toThrow();
        
      expect(global.fetch).toHaveBeenCalledTimes(3); // Original + 2 retries
    });

    it('should not retry on non-retryable status codes', async () => {
      const errorResponse = {
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ error: 'Bad request' }),
      };
      (global.fetch as any).mockResolvedValue(errorResponse);

      const response = await NetworkErrorHandler.fetchWithRetry('/api/test', {}, { maxRetries: 3 });

      expect(response).toEqual(errorResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchJsonWithRetry', () => {
    it('should return JSON data on success', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'success' }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await NetworkErrorHandler.fetchJsonWithRetry('/api/test');

      expect(result.data).toEqual({ data: 'success' });
      expect(result.status).toBe(200);
    });

    it('should handle JSON parsing error gracefully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(new Error('JSON parse error')),
        text: vi.fn().mockResolvedValue('raw text response'),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await NetworkErrorHandler.fetchJsonWithRetry('/api/test');

      expect(result.data).toBe('raw text response');
    });
  });
});

describe('makeApiCall', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return data on successful API call', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ message: 'success' }),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await makeApiCall('/api/test');

    expect(result.data).toEqual({ message: 'success' });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(200);
  });

  it('should return error on failed API call', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue('Internal Server Error'),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await makeApiCall('/api/test');

    expect(result.data).toBeUndefined();
    expect(result.error).toBe('Internal Server Error');
    expect(result.status).toBe(500);
  });

  it('should return error on network failure', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const result = await makeApiCall('/api/test');

    expect(result.data).toBeUndefined();
    expect(result.error).toBe('Network error');
  });
});