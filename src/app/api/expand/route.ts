import { NextRequest } from 'next/server';
import { createErrorResponse } from '@/lib/errorHandler';

export async function POST(request: NextRequest) {
  try {
    const { phrase, language, targetLanguage } = await request.json();

    if (!phrase || !language || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get DeepSeek API key from environment
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Expansion service unavailable' }),
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
            content: `You are a language learning assistant. Your task is to "expand" a given input text.
1. Analyze the input text.
2. If the input is a single word or a short phrase, generate a natural, common sentence using it in the input language (${language}).
3. If the input is already a full sentence, generate a natural variation of it with the same meaning in the input language (${language}).
4. Translate the generated sentence/variation into the target language (${targetLanguage}).

Return ONLY a valid JSON object with the following structure:
{
  "expandedPhrase": "The generated sentence or variation in ${language}",
  "translation": "The translation in ${targetLanguage}"
}`,
          },
          {
            role: 'user',
            content: phrase,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
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
    let content = data.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      const error = new Error('No content returned from API');
      return createErrorResponse(error, { url: request.url }, 500);
    }

    let result;
    try {
        result = JSON.parse(content);
    } catch (e) {
        // Fallback if JSON parsing fails (sometimes models add markdown code blocks)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                result = JSON.parse(jsonMatch[0]);
            } catch (e2) {
                 throw new Error('Failed to parse API response');
            }
        } else {
            throw new Error('Invalid JSON response from API');
        }
    }

    if (!result.expandedPhrase || !result.translation) {
      const error = new Error('Incomplete data returned from API');
      return createErrorResponse(error, { url: request.url }, 500);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error, { url: request.url });
    } else {
      const unknownError = new Error('Unknown error occurred during expansion');
      return createErrorResponse(unknownError, { url: request.url });
    }
  }
}
