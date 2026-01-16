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
      <div className="container mx-auto px-4 py-6"> {/* Reduced padding for mobile */}
        <h1 className="text-xl font-bold mb-4 text-center"> {/* Reduced font size and margin for mobile */}
          Flashcard Review
        </h1>
        <div className="flex justify-center items-center py-8">
          <p>Loading cards...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6"> {/* Reduced padding for mobile */}
        <h1 className="text-xl font-bold mb-4 text-center"> {/* Reduced font size and margin for mobile */}
          Flashcard Review
        </h1>
        <div className="text-center py-8">
          <p className="text-base mb-4">No cards due for review today!</p> {/* Reduced font size */}
          <button
            onClick={() => router.push('/')}
            className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base" // Increased padding and font size for mobile
          >
            Translate More Phrases
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl"> {/* Reduced padding for mobile */}
      <div className="mb-4 flex justify-between items-center"> {/* Reduced margin */}
        <h1 className="text-xl font-bold">Flashcard Review</h1> {/* Reduced font size */}
        <span className="text-gray-600 text-base"> {/* Increased font size */}
          {currentCardIndex + 1} / {cards.length}
        </span>
      </div>

      <div
        className="relative h-56 flex items-center justify-center cursor-pointer perspective-1000" // Reduced height for mobile
        onClick={handleFlip}
      >
        <div
          className={`absolute w-full h-full flex items-center justify-center rounded-xl shadow-lg p-6 bg-white dark:bg-gray-800 transition-transform duration-500 transform-style-preserve-3d ${ // Reduced padding
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          <p className="text-xl text-center backface-hidden"> {/* Reduced font size */}
            {showSource ? currentCard.sourcePhrase : currentCard.translation}
          </p>
        </div>

        <div
          className={`absolute w-full h-full flex items-center justify-center rounded-xl shadow-lg p-6 bg-white dark:bg-gray-800 transition-transform duration-500 transform-style-preserve-3d rotate-y-180 ${ // Reduced padding
            isFlipped ? 'rotate-y-0' : ''
          }`}
        >
          <p className="text-xl text-center backface-hidden"> {/* Reduced font size */}
            {showSource ? currentCard.translation : currentCard.sourcePhrase}
          </p>
        </div>
      </div>

      <div className="mt-6"> {/* Reduced margin */}
        <p className="text-center mb-3 text-gray-600 dark:text-gray-300 text-base"> {/* Reduced margin and increased font size */}
          Tap card to flip
        </p>

        {isFlipped && (
          <div className="grid grid-cols-1 gap-3 mt-4"> {/* Changed to single column for mobile with adjusted gap */}
            <button
              onClick={() => handleRating('again')}
              className="px-4 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-base" // Increased padding and font size for mobile
            >
              Again
            </button>
            <button
              onClick={() => handleRating('hard')}
              className="px-4 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-base" // Increased padding and font size for mobile
            >
              Hard
            </button>
            <button
              onClick={() => handleRating('good')}
              className="px-4 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-base" // Increased padding and font size for mobile
            >
              Good
            </button>
            <button
              onClick={() => handleRating('easy')}
              className="px-4 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-base" // Increased padding and font size for mobile
            >
              Easy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}