import { NextRequest } from 'next/server';
import { db } from '@/db';
import { phrases, phraseTags, tags } from '@/db/schema';
import { eq, desc, and, asc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { createErrorResponse } from '@/lib/errorHandler';

const getPhrasesSchema = z.object({
  page: z.string().transform(Number).optional().default(1),
  limit: z.string().transform(Number).optional().default(10),
  tag: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, tag } = getPhrasesSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      tag: searchParams.get('tag') || undefined,
    });

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // If tag filter is provided, first get the phrase IDs that have that tag
    let phraseIdsWithTag: number[] | null = null;
    if (tag) {
      const taggedPhrases = await db
        .select({ phraseId: phraseTags.phraseId })
        .from(phraseTags)
        .innerJoin(tags, eq(phraseTags.tagId, tags.id))
        .where(eq(tags.name, tag));
      phraseIdsWithTag = taggedPhrases.map(r => r.phraseId);
    }

    // Fetch phrases with associated tags
    let query = db
      .select({
        id: phrases.id,
        sourcePhrase: phrases.sourcePhrase,
        translation: phrases.translation,
        sourceLanguage: phrases.sourceLanguage,
        targetLanguage: phrases.targetLanguage,
        createdAt: phrases.createdAt,
        tagName: tags.name,
      })
      .from(phrases)
      .leftJoin(phraseTags, eq(phrases.id, phraseTags.phraseId))
      .leftJoin(tags, eq(phraseTags.tagId, tags.id));

    // Apply tag filter if provided
    const phraseRecords = phraseIdsWithTag !== null
      ? await query
          .where(phraseIdsWithTag.length > 0
            ? sql`${phrases.id} IN (${sql.join(phraseIdsWithTag.map(id => sql`${id}`), sql`, `)})`
            : sql`1 = 0`)
          .orderBy(desc(phrases.createdAt), asc(phrases.id), asc(tags.name))
          .limit(limit)
          .offset(offset)
      : await query
          .orderBy(desc(phrases.createdAt), asc(phrases.id), asc(tags.name))
          .limit(limit)
          .offset(offset);

    // Get total count for pagination info
    const totalCount = phraseIdsWithTag !== null
      ? phraseIdsWithTag.length
      : (await db.select({ count: phrases.id }).from(phrases)).length;

    // Group records by phrase ID to collect all tags for each phrase
    const groupedPhrases = new Map<number, {
      id: number;
      sourcePhrase: string;
      translation: string;
      sourceLanguage: string;
      targetLanguage: string;
      createdAt: number | Date;  // Allow both types since DB returns Date but we might convert to number
      tags: string[];
    }>();

    phraseRecords.forEach(record => {
      if (!groupedPhrases.has(record.id)) {
        groupedPhrases.set(record.id, {
          id: record.id,
          sourcePhrase: record.sourcePhrase,
          translation: record.translation,
          sourceLanguage: record.sourceLanguage,
          targetLanguage: record.targetLanguage,
          createdAt: typeof record.createdAt === 'number'
            ? record.createdAt
            : Math.floor(record.createdAt.getTime() / 1000), // Convert Date to Unix timestamp if needed
          tags: record.tagName ? [record.tagName] : [],
        });
      } else {
        const existing = groupedPhrases.get(record.id)!;
        if (record.tagName && !existing.tags.includes(record.tagName)) {
          existing.tags.push(record.tagName);
        }
      }
    });

    // Format the response
    const formattedPhrases = Array.from(groupedPhrases.values()).map(phrase => ({
      id: phrase.id,
      sourcePhrase: phrase.sourcePhrase,
      translation: phrase.translation,
      sourceLanguage: phrase.sourceLanguage,
      targetLanguage: phrase.targetLanguage,
      createdAt: phrase.createdAt,
      languagePair: `${phrase.sourceLanguage}-${phrase.targetLanguage}`,
      tags: phrase.tags,
    }));

    return new Response(
      JSON.stringify({
        phrases: formattedPhrases,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid query parameters', details: error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (error instanceof Error) {
      return createErrorResponse(error, { url: req.url });
    } else {
      const unknownError = new Error('Unknown error occurred while fetching phrases');
      return createErrorResponse(unknownError, { url: req.url });
    }
  }
}

// Handle DELETE for deleting a phrase
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const phraseIdStr = url.pathname.split('/').pop(); // Get the last part of the path

    if (!phraseIdStr) {
      return new Response(
        JSON.stringify({ error: 'Phrase ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const phraseId = parseInt(phraseIdStr, 10);

    if (isNaN(phraseId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phrase ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete the phrase (and related records due to cascade)
    const deletedRecords = await db
      .delete(phrases)
      .where(eq(phrases.id, phraseId));

    // Check if any records were affected by the deletion
    if ('changes' in deletedRecords && deletedRecords.changes === 0) {
      return new Response(
        JSON.stringify({ error: 'Phrase not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Phrase deleted successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error, { url: req.url });
    } else {
      const unknownError = new Error('Unknown error occurred while deleting phrase');
      return createErrorResponse(unknownError, { url: req.url });
    }
  }
}