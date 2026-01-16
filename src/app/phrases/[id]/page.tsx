'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LANGUAGES } from '@/lib/languages';
import { useToast } from '@/components/Toast';

interface PhraseDetails {
  id: number;
  sourcePhrase: string;
  translation: string;
  sourceLanguage: string;
  targetLanguage: string;
  languagePair: string;
  createdAt: number;
  tags: string[];
  srs: {
    nextReviewDate: number;
    interval: number;
    easeFactor: number;
    repetitions: number;
  } | null;
}

export default function PhraseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  
  const [phrase, setPhrase] = useState<PhraseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhraseDetails = async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/phrases/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Phrase not found');
          }
          throw new Error('Failed to fetch phrase details');
        }

        const data = await response.json();
        setPhrase(data.phrase);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        addToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPhraseDetails(params.id as string);
    }
  }, [params.id, addToast]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8">Loading phrase details...</div>
      </div>
    );
  }

  if (error || !phrase) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8 text-red-500">
          {error || 'Phrase not found'}
        </div>
        <div className="text-center">
          <button
            onClick={() => router.push('/browse')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <button
        onClick={handleBack}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header with Languages */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-300">
            <span className="font-medium">{LANGUAGES[phrase.sourceLanguage as keyof typeof LANGUAGES]}</span>
            <span>→</span>
            <span className="font-medium">{LANGUAGES[phrase.targetLanguage as keyof typeof LANGUAGES]}</span>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
             Added {new Date(phrase.createdAt * 1000).toLocaleDateString()}
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Source Phrase */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Source Phrase</h2>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {phrase.sourcePhrase}
            </div>
          </div>

          {/* Translation */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Translation</h2>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {phrase.translation}
            </div>
          </div>

          {/* Tags */}
          {phrase.tags && phrase.tags.length > 0 && (
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {phrase.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SRS Stats */}
          {phrase.srs && (
             <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Review Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Repetitions</div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">{phrase.srs.repetitions}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-center">
                   <div className="text-xs text-gray-500 dark:text-gray-400">Interval</div>
                   <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">{phrase.srs.interval} days</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-center">
                   <div className="text-xs text-gray-500 dark:text-gray-400">Ease Factor</div>
                   <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">{phrase.srs.easeFactor.toFixed(2)}</div>
                </div>
                 <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-center">
                   <div className="text-xs text-gray-500 dark:text-gray-400">Next Review</div>
                   <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                     {new Date(phrase.srs.nextReviewDate * 1000).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
