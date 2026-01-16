import { NextRequest } from 'next/server';
import { db } from '@/db';
import { phrases, tags, phraseTags, srsData } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createErrorResponse } from '@/lib/errorHandler';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: phraseIdStr } = await params;
    const phraseId = parseInt(phraseIdStr, 10);

    if (isNaN(phraseId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phrase ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch phrase
    const phraseResult = await db
      .select()
      .from(phrases)
      .where(eq(phrases.id, phraseId))
      .limit(1);

    if (phraseResult.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Phrase not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const phrase = phraseResult[0];

    // Fetch tags
    const tagsResult = await db
      .select({ name: tags.name })
      .from(tags)
      .innerJoin(phraseTags, eq(tags.id, phraseTags.tagId))
      .where(eq(phraseTags.phraseId, phraseId));

    const phraseTagsList = tagsResult.map(t => t.name);

    // Fetch SRS data
    const srsResult = await db
      .select()
      .from(srsData)
      .where(eq(srsData.phraseId, phraseId))
      .limit(1);
    
    const srs = srsResult.length > 0 ? srsResult[0] : null;

    // Combine data
    const phraseDetails = {
      id: phrase.id,
      sourcePhrase: phrase.sourcePhrase,
      translation: phrase.translation,
      sourceLanguage: phrase.sourceLanguage,
      targetLanguage: phrase.targetLanguage,
      languagePair: `${phrase.sourceLanguage}-${phrase.targetLanguage}`,
      createdAt: typeof phrase.createdAt === 'number'
        ? phrase.createdAt
        : Math.floor(phrase.createdAt.getTime() / 1000),
      tags: phraseTagsList,
      srs: srs ? {
        nextReviewDate: typeof srs.nextReviewDate === 'number' ? srs.nextReviewDate : Math.floor(srs.nextReviewDate.getTime() / 1000),
        interval: srs.interval,
        easeFactor: srs.easeFactor / 100, // Convert back to decimal
        repetitions: srs.repetitions
      } : null
    };

    return new Response(
      JSON.stringify({ phrase: phraseDetails }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error, { url: req.url });
    } else {
      const unknownError = new Error('Unknown error occurred while fetching phrase details');
      return createErrorResponse(unknownError, { url: req.url });
    }
  }
}
