import { Phrase } from './types';
import { makeApiCall } from './networkErrorHandler';

/**
 * Get cards that are due for review (next_review_date <= now)
 */
export async function getDueCards(): Promise<Phrase[]> {
  const result = await makeApiCall<Phrase[]>('/api/review/due-cards', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, {
    maxRetries: 2,
    delay: 500,
    backoffMultiplier: 1.5,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  });

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data || [];
}

/**
 * Update card rating based on SM-2 algorithm
 */
export async function updateCardRating(phraseId: number, rating: 'again' | 'hard' | 'good' | 'easy'): Promise<void> {
  const result = await makeApiCall('/api/review/update-rating', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phraseId, rating }),
  }, {
    maxRetries: 2,
    delay: 500,
    backoffMultiplier: 1.5,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  });

  if (result.error) {
    throw new Error(result.error);
  }
}