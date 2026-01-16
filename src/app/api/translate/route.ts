import { NextRequest } from 'next/server';
import { ErrorHandler, createErrorResponse } from '@/lib/errorHandler';

export async function POST(request: NextRequest) {
  try {
    const { phrase, sourceLanguage, targetLanguage } = await request.json();

    if (!phrase || !sourceLanguage || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get DeepSeek API key from environment
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Translation service unavailable' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the given phrase from ${sourceLanguage} to ${targetLanguage}. Provide only the translation, no explanations or additional text.`,
          },
          {
            role: 'user',
            content: phrase,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(`DeepSeek API error: ${response.status}`);

      return createErrorResponse(error, {
        url: request.url,
        additionalInfo: {
          deepSeekStatus: response.status,
          deepSeekError: errorText
        }
      }, 503);
    }

    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content?.trim();

    if (!translation) {
      const error = new Error('No translation returned from API');
      return createErrorResponse(error, { url: request.url }, 500);
    }

    return new Response(JSON.stringify({ translation }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error, { url: request.url });
    } else {
      const unknownError = new Error('Unknown error occurred during translation');
      return createErrorResponse(unknownError, { url: request.url });
    }
  }
}
