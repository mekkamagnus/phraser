import { NextRequest } from 'next/server';
import { db } from '@/db';
import { phrases, srsData } from '@/db/schema';
import { eq, lte } from 'drizzle-orm';
import { createErrorResponse } from '@/lib/errorHandler';

export async function GET(request: NextRequest) {
  try {
    const now = new Date(); // Use JavaScript Date object for comparison

    const dueCards = await db
      .select()
      .from(phrases)
      .innerJoin(srsData, eq(phrases.id, srsData.phraseId))
      .where(lte(srsData.nextReviewDate, now));

    return new Response(JSON.stringify(dueCards.map(row => row.phrases)), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error, { url: request.url });
    } else {
      const unknownError = new Error('Unknown error occurred while fetching due cards');
      return createErrorResponse(unknownError, { url: request.url });
    }
  }
}