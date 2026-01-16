import { NextRequest } from 'next/server';
import { db } from '@/db';
import { phrases, tags, phraseTags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { createErrorResponse } from '@/lib/errorHandler';

const savePhraseSchema = z.object({
  sourcePhrase: z.string().min(1),
  translation: z.string().min(1),
  sourceLanguage: z.string().min(1),
  targetLanguage: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourcePhrase, translation, sourceLanguage, targetLanguage } = savePhraseSchema.parse(body);

    // Check for duplicates (same source phrase + language pair)
    const existingPhrase = await db
      .select()
      .from(phrases)
      .where(
        and(
          eq(phrases.sourcePhrase, sourcePhrase),
          eq(phrases.sourceLanguage, sourceLanguage),
          eq(phrases.targetLanguage, targetLanguage)
        )
      )
      .limit(1);

    if (existingPhrase.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Phrase already saved with this language pair' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insert the new phrase
    const [newPhrase] = await db
      .insert(phrases)
      .values({
        sourcePhrase,
        translation,
        sourceLanguage,
        targetLanguage,
      })
      .returning();

    // Create or get the language pair tag (e.g., "en-es")
    const languagePairTag = `${sourceLanguage}-${targetLanguage}`;
    let languageTag = await db
      .select()
      .from(tags)
      .where(eq(tags.name, languagePairTag))
      .limit(1);

    if (languageTag.length === 0) {
      // Create the language pair tag if it doesn't exist
      const [newTag] = await db
        .insert(tags)
        .values({ name: languagePairTag })
        .returning();
      languageTag = [newTag];
    }

    // Associate the phrase with the language pair tag
    await db.insert(phraseTags).values({
      phraseId: newPhrase.id,
      tagId: languageTag[0].id,
    });

    // Process additional tags if provided
    if (body.tags && Array.isArray(body.tags) && body.tags.length > 0) {
      for (const tagName of body.tags) {
        if (typeof tagName === 'string' && tagName.trim() !== '') {
          let tagRecord = await db
            .select()
            .from(tags)
            .where(eq(tags.name, tagName.trim()))
            .limit(1);

          if (tagRecord.length === 0) {
            // Create the tag if it doesn't exist
            const [newTag] = await db
              .insert(tags)
              .values({ name: tagName.trim() })
              .returning();
            tagRecord = [newTag];
          }

          // Associate the phrase with the tag
          await db.insert(phraseTags).values({
            phraseId: newPhrase.id,
            tagId: tagRecord[0].id,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Phrase saved successfully',
        phraseId: newPhrase.id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input data', details: error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (error instanceof Error) {
      return createErrorResponse(error, { url: req.url });
    } else {
      const unknownError = new Error('Unknown error occurred while saving phrase');
      return createErrorResponse(unknownError, { url: req.url });
    }
  }
}