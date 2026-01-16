import { NextRequest } from 'next/server';
import { db } from '@/db';
import { phrases, tags, phraseTags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const savePhraseSchema = z.object({
  sourcePhrase: z.string().min(1),
  translation: z.string().min(1),
  sourceLanguage: z.string().min(1),
  targetLanguage: z.string().min(1),
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
      return Response.json(
        { error: 'Phrase already saved with this language pair' },
        { status: 409 }
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
    let tag = await db
      .select()
      .from(tags)
      .where(eq(tags.name, languagePairTag))
      .limit(1);

    if (tag.length === 0) {
      // Create the tag if it doesn't exist
      const [newTag] = await db
        .insert(tags)
        .values({ name: languagePairTag })
        .returning();
      tag = [newTag];
    }

    // Associate the phrase with the language pair tag
    await db.insert(phraseTags).values({
      phraseId: newPhrase.id,
      tagId: tag[0].id,
    });

    return Response.json({
      message: 'Phrase saved successfully',
      phraseId: newPhrase.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error saving phrase:', error);
    return Response.json(
      { error: 'Failed to save phrase' },
      { status: 500 }
    );
  }
}