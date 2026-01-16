import { NextRequest } from 'next/server';
import { db } from '@/db';
import { phrases, phraseTags, tags } from '@/db/schema';
import { eq, desc, and, asc } from 'drizzle-orm';
import { z } from 'zod';

const getPhrasesSchema = z.object({
  page: z.string().transform(Number).optional().default(1),
  limit: z.string().transform(Number).optional().default(10),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = getPhrasesSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Fetch phrases with associated tags
    const phraseRecords = await db
      .select({
        id: phrases.id,
        sourcePhrase: phrases.sourcePhrase,
        translation: phrases.translation,
        sourceLanguage: phrases.sourceLanguage,
        targetLanguage: phrases.targetLanguage,
        createdAt: phrases.createdAt,
      })
      .from(phrases)
      .orderBy(desc(phrases.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination info
    const totalCountResult = await db
      .select({ count: phrases.id })
      .from(phrases);
    const totalCount = totalCountResult.length;

    // Format the response
    const formattedPhrases = phraseRecords.map(record => ({
      id: record.id,
      sourcePhrase: record.sourcePhrase,
      translation: record.translation,
      sourceLanguage: record.sourceLanguage,
      targetLanguage: record.targetLanguage,
      createdAt: record.createdAt,
      languagePair: `${record.sourceLanguage}-${record.targetLanguage}`,
    }));

    return Response.json({
      phrases: formattedPhrases,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching phrases:', error);
    return Response.json(
      { error: 'Failed to fetch phrases' },
      { status: 500 }
    );
  }
}

// Handle DELETE for deleting a phrase
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const phraseIdStr = url.pathname.split('/').pop(); // Get the last part of the path
    
    if (!phraseIdStr) {
      return Response.json(
        { error: 'Phrase ID is required' },
        { status: 400 }
      );
    }

    const phraseId = parseInt(phraseIdStr, 10);
    
    if (isNaN(phraseId)) {
      return Response.json(
        { error: 'Invalid phrase ID' },
        { status: 400 }
      );
    }

    // Delete the phrase (and related records due to cascade)
    const deletedRecords = await db
      .delete(phrases)
      .where(eq(phrases.id, phraseId));

    if (deletedRecords.rowsAffected === 0) {
      return Response.json(
        { error: 'Phrase not found' },
        { status: 404 }
      );
    }

    return Response.json({
      message: 'Phrase deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting phrase:', error);
    return Response.json(
      { error: 'Failed to delete phrase' },
      { status: 500 }
    );
  }
}