'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LANGUAGES } from '@/lib/languages';

interface Phrase {
  id: number;
  sourcePhrase: string;
  translation: string;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: number;
  languagePair: string;
  tags?: string[];
}

export default function TagDetailPage() {
  const params = useParams();
  const tagName = decodeURIComponent(params.tagName as string);

  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPhrasesByTag();
  }, [tagName]);

  const fetchPhrasesByTag = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/phrases/list?tag=${encodeURIComponent(tagName)}&limit=100`);

      if (!response.ok) {
        throw new Error('Failed to fetch phrases');
      }

      const data = await response.json();
      setPhrases(data.phrases || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-base">Loading phrases...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-red-500 text-base">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        href="/tags"
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 text-base"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tags
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Tag: <span className="text-blue-600 dark:text-blue-400">{tagName}</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {phrases.length} {phrases.length === 1 ? 'phrase' : 'phrases'} with this tag
        </p>
      </div>

      {/* Phrases list */}
      {phrases.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow">
          <p className="text-gray-600 dark:text-gray-400 text-base">No phrases found with this tag.</p>
          <Link
            href="/"
            className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Add some phrases
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {phrases.map((phrase) => (
            <div
              key={phrase.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {LANGUAGES[phrase.sourceLanguage as keyof typeof LANGUAGES] || phrase.sourceLanguage}
                  </div>
                  <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    {phrase.sourcePhrase}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {LANGUAGES[phrase.targetLanguage as keyof typeof LANGUAGES] || phrase.targetLanguage}
                </div>
                <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {phrase.translation}
                </div>
              </div>

              {/* Tags */}
              {phrase.tags && phrase.tags.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {phrase.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center px-3 py-1.5 text-sm rounded-full ${
                          tag === tagName
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {new Date(phrase.createdAt * 1000).toLocaleDateString()} • {phrase.languagePair}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
