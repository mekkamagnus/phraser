import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';

// Mock fetch globally
global.fetch = vi.fn();

describe('/api/translate', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.DEEPSEEK_API_KEY = 'test-api-key';
  });

  it('should return translation on successful API call', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: 'Hola',
          },
        },
      ],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const request = new Request('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({
        phrase: 'Hello',
        sourceLanguage: 'English',
        targetLanguage: 'Spanish',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ translation: 'Hola' });
  });

  it('should return 400 if missing required fields', async () => {
    const request = new Request('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({
        phrase: 'Hello',
        // missing sourceLanguage and targetLanguage
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields');
  });

  it('should return 500 if API key is not configured', async () => {
    delete process.env.DEEPSEEK_API_KEY;

    const request = new Request('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({
        phrase: 'Hello',
        sourceLanguage: 'English',
        targetLanguage: 'Spanish',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('DeepSeek API key not configured');
  });

  it('should return 503 on API failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      text: async () => 'API Error',
    });

    const request = new Request('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({
        phrase: 'Hello',
        sourceLanguage: 'English',
        targetLanguage: 'Spanish',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('Translation service unavailable');
  });

  it('should return 500 if no translation returned', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: null,
          },
        },
      ],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const request = new Request('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({
        phrase: 'Hello',
        sourceLanguage: 'English',
        targetLanguage: 'Spanish',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('No translation returned');
  });

  it('should call DeepSeek API with correct parameters', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Hola' } }],
      }),
    });

    const request = new Request('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({
        phrase: 'Hello',
        sourceLanguage: 'English',
        targetLanguage: 'Spanish',
      }),
    });

    await POST(request);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key',
        }),
        body: expect.stringContaining('Hello'),
      })
    );
  });

  it('should trim whitespace from translation', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: '  Hola  ',
          },
        },
      ],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const request = new Request('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({
        phrase: 'Hello',
        sourceLanguage: 'English',
        targetLanguage: 'Spanish',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.translation).toBe('Hola');
  });
});
