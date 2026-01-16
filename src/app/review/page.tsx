'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDueCards, updateCardRating } from '@/lib/review';
import { Phrase } from '@/lib/types';

export default function ReviewPage() {
  const router = useRouter();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cards, setCards] = useState<Phrase[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSource, setShowSource] = useState<boolean>(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setIsLoading(true);
      const dueCards = await getDueCards();
      setCards(dueCards);
      // Randomize whether to show source or translation first
      if (dueCards.length > 0) {
        setShowSource(Math.random() > 0.5);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRating = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (currentCardIndex >= cards.length) return;

    try {
      // Update the card rating in the database
      await updateCardRating(cards[currentCardIndex].id, rating);

      // Move to next card or finish review
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
        // Randomize whether to show source or translation for the next card
        setShowSource(Math.random() > 0.5);
      } else {
        // Review completed
        router.push('/review/completed');
      }
    } catch (error) {
      console.error('Error updating card rating:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Flashcard Review</h1>
        <div className="flex justify-center items-center">
          <p>Loading cards...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Flashcard Review</h1>
        <div className="text-center">
          <p className="text-lg mb-4">No cards due for review today!</p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Translate More Phrases
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Flashcard Review</h1>
        <span className="text-gray-600">
          {currentCardIndex + 1} / {cards.length}
        </span>
      </div>

      <div
        className="relative h-64 flex items-center justify-center cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`absolute w-full h-full flex items-center justify-center rounded-xl shadow-lg p-8 bg-white dark:bg-gray-800 transition-transform duration-500 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          <p className="text-2xl text-center backface-hidden">
            {showSource ? currentCard.sourcePhrase : currentCard.translation}
          </p>
        </div>

        <div
          className={`absolute w-full h-full flex items-center justify-center rounded-xl shadow-lg p-8 bg-white dark:bg-gray-800 transition-transform duration-500 transform-style-preserve-3d rotate-y-180 ${
            isFlipped ? 'rotate-y-0' : ''
          }`}
        >
          <p className="text-2xl text-center backface-hidden">
            {showSource ? currentCard.translation : currentCard.sourcePhrase}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-center mb-4 text-gray-600 dark:text-gray-300">
          Click card to flip
        </p>

        {isFlipped && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <button
              onClick={() => handleRating('again')}
              className="px-4 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Again
            </button>
            <button
              onClick={() => handleRating('hard')}
              className="px-4 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Hard
            </button>
            <button
              onClick={() => handleRating('good')}
              className="px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Good
            </button>
            <button
              onClick={() => handleRating('easy')}
              className="px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Easy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}