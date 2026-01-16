import { NextRequest } from 'next/server';
import { db } from '@/db';
import { phrases, phraseTags, tags } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { createErrorResponse } from '@/lib/errorHandler';

export async function GET(req: NextRequest) {
  try {
    // Fetch all phrases with their associated tags
    const phraseRecords = await db
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
      .leftJoin(tags, eq(phraseTags.tagId, tags.id))
      .orderBy(desc(phrases.createdAt), asc(phrases.id), asc(tags.name));

    // Group records by phrase ID to collect all tags for each phrase
    const groupedPhrases = new Map<number, {
      id: number;
      sourcePhrase: string;
      translation: string;
      sourceLanguage: string;
      targetLanguage: string;
      createdAt: number;  // The schema defines this as integer with timestamp mode
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

    // Format as CSV content
    const csvRows = Array.from(groupedPhrases.values()).map(phrase => {
      // Escape quotes and wrap in quotes for CSV
      const sourcePhrase = `"${phrase.sourcePhrase.replace(/"/g, '""')}"`;
      const translation = `"${phrase.translation.replace(/"/g, '""')}"`;
      const tags = `"${phrase.tags.join(',')}"`; // Join tags with commas

      return `${sourcePhrase},${translation},${tags}`;
    });

    // Add CSV header
    const csvContent = 'Source Phrase,Translation,Tags\n' + csvRows.join('\n');

    // Create response with proper CSV headers
    const response = new Response(`\uFEFF${csvContent}`, { // Add BOM for UTF-8
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': 'attachment; filename="phrases_anki_export.csv"',
      },
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error, { url: req.url });
    } else {
      const unknownError = new Error('Unknown error occurred while exporting to Anki format');
      return createErrorResponse(unknownError, { url: req.url });
    }
  }
}