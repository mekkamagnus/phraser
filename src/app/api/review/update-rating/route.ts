import { NextRequest } from 'next/server';
import { db } from '@/db';
import { srsData } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createErrorResponse } from '@/lib/errorHandler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phraseId, rating } = body;

    if (!phraseId || !rating) {
      return new Response(JSON.stringify({ error: 'Missing phraseId or rating' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const now = Math.floor(Date.now() / 1000); // Convert to Unix timestamp

    // Get current SRS data
    const currentSrsData = await db
      .select()
      .from(srsData)
      .where(eq(srsData.phraseId, phraseId))
      .limit(1);

    if (currentSrsData.length === 0) {
      return new Response(JSON.stringify({ error: `No SRS data found for phrase ID ${phraseId}` }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const current = currentSrsData[0];

    // SM-2 Algorithm implementation
    let { easeFactor, interval, repetitions } = current;

    // Convert ease factor from integer (stored as 2.5 * 100 = 250) back to float
    let ef = easeFactor / 100;

    switch (rating) {
      case 'again':
        repetitions = 0;
        ef = Math.max(1.3, ef - 0.2);
        interval = 1; // Review again tomorrow
        break;
      case 'hard':
        repetitions = repetitions === 0 ? 1 : repetitions;
        ef = Math.max(1.3, ef - 0.15);
        interval = Math.max(1, Math.round(interval * 1.2));
        break;
      case 'good':
        repetitions = repetitions + 1;
        // EF stays roughly the same
        interval = repetitions === 1
          ? 1
          : repetitions === 2
            ? 6
            : Math.round(interval * ef);
        break;
      case 'easy':
        repetitions = repetitions + 1;
        ef = ef + 0.1;
        interval = Math.round(interval * ef * 1.3);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid rating' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
    }

    // Calculate next review date (in seconds since epoch)
    const nextReviewDate = now + (interval * 24 * 60 * 60); // Convert days to seconds

    // Update the SRS data
    await db
      .update(srsData)
      .set({
        easeFactor: Math.round(ef * 100), // Convert back to integer
        interval,
        repetitions,
        nextReviewDate: new Date(nextReviewDate * 1000), // Convert Unix timestamp to Date object
        lastReviewDate: new Date(now * 1000), // Convert Unix timestamp to Date object
        updatedAt: new Date(now * 1000) // Convert Unix timestamp to Date object
      })
      .where(eq(srsData.phraseId, phraseId));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error, { url: request.url });
    } else {
      const unknownError = new Error('Unknown error occurred while updating card rating');
      return createErrorResponse(unknownError, { url: request.url });
    }
  }
}