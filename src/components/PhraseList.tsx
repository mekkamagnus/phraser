'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Phrase {
  id: number;
  sourcePhrase: string;
  translation: string;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: number; // Unix timestamp
  languagePair: string;
}

export default function PhraseList() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchPhrases = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/phrases/list?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch phrases');
      }
      
      const data = await response.json();
      
      setPhrases(data.phrases || []);
      setCurrentPage(data.pagination?.currentPage || 1);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhrases(currentPage);
  }, [currentPage]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this phrase?')) {
      return;
    }

    try {
      const response = await fetch(`/api/phrases/list/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete phrase');
      }

      // Refresh the list
      fetchPhrases(currentPage);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred while deleting');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading phrases...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (phrases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No saved phrases yet.</p>
        <p className="text-gray-500 dark:text-gray-500 mt-2">
          Translate and save some phrases to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Source Phrase</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Translation</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Language Pair</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date Saved</th>
              <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {phrases.map((phrase) => (
              <tr key={phrase.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{phrase.sourcePhrase}</td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{phrase.translation}</td>
                <td className="py-3 px-4">
                  <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                    {phrase.languagePair}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                  {new Date(phrase.createdAt * 1000).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(phrase.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Previous
          </button>
          
          <span className="text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}