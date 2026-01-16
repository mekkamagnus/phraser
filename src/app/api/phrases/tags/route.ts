import { NextRequest } from 'next/server';
import { db } from '@/db';
import { phrases, tags, phraseTags } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { createErrorResponse } from '@/lib/errorHandler';

// Schema for updating tags on a phrase
const updateTagsSchema = z.object({
  phraseId: z.number(),
  tagNames: z.array(z.string()), // Renamed to avoid conflict with the tags schema
});

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { phraseId, tagNames: tagNames } = updateTagsSchema.parse(body);

    // Verify the phrase exists
    const phrase = await db
      .select()
      .from(phrases)
      .where(eq(phrases.id, phraseId))
      .limit(1);

    if (phrase.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Phrase not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all current tags for this phrase
    const currentPhraseTags = await db
      .select({ tagId: phraseTags.tagId, tagName: tags.name })
      .from(phraseTags)
      .innerJoin(tags, eq(phraseTags.tagId, tags.id))
      .where(eq(phraseTags.phraseId, phraseId));

    // Determine which tags to add and which to remove
    const currentTagNames = currentPhraseTags.map(t => t.tagName);
    const tagsToAdd = tagNames.filter(tag => !currentTagNames.includes(tag));
    const tagsToRemove = currentTagNames.filter(tag => !tagNames.includes(tag));

    // Add new tags
    for (const tagName of tagsToAdd) {
      if (tagName.trim() !== '') {
        // Find or create the tag
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
          phraseId,
          tagId: tagRecord[0].id,
        });
      }
    }

    // Remove tags that are no longer needed
    if (tagsToRemove.length > 0) {
      // Get the tag IDs to remove
      const tagsToRemoveRecords = await db
        .select({ id: tags.id })
        .from(tags)
        .where(inArray(tags.name, tagsToRemove));

      const tagIdsToRemove = tagsToRemoveRecords.map(t => t.id);

      if (tagIdsToRemove.length > 0) {
        await db
          .delete(phraseTags)
          .where(
            and(
              eq(phraseTags.phraseId, phraseId),
              inArray(phraseTags.tagId, tagIdsToRemove)
            )
          );
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Tags updated successfully',
        phraseId,
        tags: tagNames,
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
      const unknownError = new Error('Unknown error occurred while updating tags');
      return createErrorResponse(unknownError, { url: req.url });
    }
  }
}

// Schema for removing a specific tag from a phrase
const removeTagSchema = z.object({
  phraseId: z.number(),
  tagId: z.number(),
});

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const phraseIdStr = pathParts[pathParts.length - 2]; // Second to last part
    const tagIdStr = pathParts[pathParts.length - 1];   // Last part

    if (!phraseIdStr || !tagIdStr) {
      return new Response(
        JSON.stringify({ error: 'Phrase ID and Tag ID are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const phraseId = parseInt(phraseIdStr, 10);
    const tagId = parseInt(tagIdStr, 10);

    if (isNaN(phraseId) || isNaN(tagId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phrase ID or tag ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the phrase and tag exist and are associated
    const association = await db
      .select()
      .from(phraseTags)
      .where(
        and(
          eq(phraseTags.phraseId, phraseId),
          eq(phraseTags.tagId, tagId)
        )
      )
      .limit(1);

    if (association.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Phrase and tag association not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Remove the association
    await db
      .delete(phraseTags)
      .where(
        and(
          eq(phraseTags.phraseId, phraseId),
          eq(phraseTags.tagId, tagId)
        )
      );

    return new Response(
      JSON.stringify({
        message: 'Tag removed from phrase successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error, { url: req.url });
    } else {
      const unknownError = new Error('Unknown error occurred while removing tag from phrase');
      return createErrorResponse(unknownError, { url: req.url });
    }
  }
}

// GET endpoint to retrieve all unique tags in the system
export async function GET() {
  try {
    const allTags = await db
      .select({ id: tags.id, name: tags.name })
      .from(tags)
      .orderBy(tags.name);

    return new Response(
      JSON.stringify({
        tags: allTags,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error);
    } else {
      const unknownError = new Error('Unknown error occurred while fetching tags');
      return createErrorResponse(unknownError);
    }
  }
}