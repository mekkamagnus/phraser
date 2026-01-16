import { NextRequest } from 'next/server';
import { db } from '@/db';
import { phrases, srsData } from '@/db/schema';
import { lte, gte, eq, desc, isNotNull } from 'drizzle-orm';
import { createErrorResponse } from '@/lib/errorHandler';

export async function GET(req: NextRequest) {
  try {
    const now = new Date(); // Use JavaScript Date object for comparison
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Total cards in the system
    const totalCardsResult = await db
      .select({ count: phrases.id })
      .from(phrases);
    const totalCards = totalCardsResult.length;

    // Cards due for review today (next_review_date <= now)
    const dueCardsResult = await db
      .select({ count: phrases.id })
      .from(phrases)
      .innerJoin(srsData, eq(phrases.id, srsData.phraseId))
      .where(lte(srsData.nextReviewDate, now));
    const cardsDueToday = dueCardsResult.length;

    // Cards reviewed today (last_review_date >= start of today)
    const reviewedTodayResult = await db
      .select({ count: phrases.id })
      .from(phrases)
      .innerJoin(srsData, eq(phrases.id, srsData.phraseId))
      .where(gte(srsData.lastReviewDate, startOfToday));
    const cardsReviewedToday = reviewedTodayResult.length;

    // Get the last review date for streak calculation
    const lastReviewResult = await db
      .select({ lastReviewDate: srsData.lastReviewDate })
      .from(srsData)
      .where(isNotNull(srsData.lastReviewDate))
      .orderBy(desc(srsData.lastReviewDate))
      .limit(1);

    const lastReviewDate = lastReviewResult.length > 0 ? lastReviewResult[0].lastReviewDate : null;

    // Calculate streak (consecutive days of review)
    let streak = 0;
    if (lastReviewDate) {
      // Get all unique review dates
      const reviewDatesResult = await db
        .select({ lastReviewDate: srsData.lastReviewDate })
        .from(srsData)
        .where(isNotNull(srsData.lastReviewDate))
        .orderBy(desc(srsData.lastReviewDate));

      // Convert timestamps to dates and get unique days
      const reviewDays = new Set<number>();
      reviewDatesResult.forEach(record => {
        if (record.lastReviewDate) {
          const date = new Date(record.lastReviewDate); // Already a Date object
          date.setHours(0, 0, 0, 0);
          reviewDays.add(date.getTime());
        }
      });

      // Calculate streak by counting consecutive days backwards from today
      streak = calculateStreak(Array.from(reviewDays).sort((a, b) => b - a));
    }

    return new Response(JSON.stringify({
      totalCards,
      cardsDueToday,
      cardsReviewedToday,
      streak,
      lastReviewDate: lastReviewDate ? lastReviewDate.toISOString() : null,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error, { url: req.url });
    } else {
      const unknownError = new Error('Unknown error occurred while fetching review statistics');
      return createErrorResponse(unknownError, { url: req.url });
    }
  }
}

// Helper function to calculate streak
function calculateStreak(sortedReviewDayTimestamps: number[]): number {
  if (sortedReviewDayTimestamps.length === 0) return 0;

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if today was already reviewed
  const todayTimestamp = currentDate.getTime();
  const todayAlreadyReviewed = sortedReviewDayTimestamps.some(ts => ts === todayTimestamp);

  if (todayAlreadyReviewed) {
    streak = 1;
  }

  // Count consecutive days backwards
  let expectedDate = new Date(currentDate);
  if (!todayAlreadyReviewed) {
    // If today wasn't reviewed, start from yesterday
    expectedDate.setDate(expectedDate.getDate() - 1);
  }

  for (let i = todayAlreadyReviewed ? 0 : 1; i < sortedReviewDayTimestamps.length; i++) {
    const reviewDate = new Date(sortedReviewDayTimestamps[i]);
    reviewDate.setHours(0, 0, 0, 0);

    if (reviewDate.getTime() === expectedDate.getTime()) {
      // This day was reviewed, continue
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      // Gap in reviews, streak ends
      break;
    }
  }

  return streak;
}