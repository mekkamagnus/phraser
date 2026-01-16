'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LANGUAGES } from '@/lib/languages';
import { useToast } from '@/components/Toast';

interface Phrase {
  id: number;
  sourcePhrase: string;
  translation: string;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: number; // Unix timestamp
  languagePair: string;
  tags?: string[];
}

export default function PhraseList() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguagePair, setSelectedLanguagePair] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingTags, setEditingTags] = useState<{[key: number]: string}>({});
  const router = useRouter();

  const { addToast } = useToast();

  // Get all unique language pairs and tags from phrases
  const allLanguagePairs = useMemo(() => {
    const pairs = new Set<string>();
    phrases.forEach(phrase => {
      pairs.add(phrase.languagePair);
    });
    return Array.from(pairs).sort();
  }, [phrases]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    phrases.forEach(phrase => {
      if (phrase.tags) {
        phrase.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [phrases]);

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
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhrases(currentPage);
  }, [currentPage]);

  // Filter phrases based on search query, language pair, and tags
  const filteredPhrases = useMemo(() => {
    return phrases.filter(phrase => {
      // Search filter - check both source phrase and translation
      const matchesSearch = !searchQuery ||
        phrase.sourcePhrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phrase.translation.toLowerCase().includes(searchQuery.toLowerCase());

      // Language pair filter
      const matchesLanguage = !selectedLanguagePair ||
        phrase.languagePair === selectedLanguagePair;

      // Tags filter - all selected tags must be present in the phrase
      const matchesTags = selectedTags.length === 0 ||
        (phrase.tags && selectedTags.every(tag => phrase.tags?.includes(tag)));

      return matchesSearch && matchesLanguage && matchesTags;
    });
  }, [phrases, searchQuery, selectedLanguagePair, selectedTags]);

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
      addToast('Phrase deleted successfully!', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting';
      addToast(errorMessage, 'error');
    }
  };

  const handleTagInputChange = (phraseId: number, value: string) => {
    setEditingTags(prev => ({
      ...prev,
      [phraseId]: value
    }));
  };

  const handleTagInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, phraseId: number) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      const tagValue = editingTags[phraseId]?.trim();
      if (tagValue) {
        await addTagToPhrase(phraseId, tagValue);
        setEditingTags(prev => ({
          ...prev,
          [phraseId]: ''
        }));
      }
    }
  };

  const addTagToPhrase = async (phraseId: number, tag: string) => {
    try {
      // Get current tags for the phrase
      const phrase = phrases.find(p => p.id === phraseId);
      if (!phrase) return;

      const currentTags = phrase.tags || [];
      const newTags = [...currentTags, tag];

      const response = await fetch('/api/phrases/tags', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phraseId,
          tags: newTags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add tag to phrase');
      }

      // Refresh the list
      fetchPhrases(currentPage);
      addToast('Tag added successfully!', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while adding tag';
      addToast(errorMessage, 'error');
    }
  };

  const handleRemoveTag = async (phraseId: number, tagToRemove: string) => {
    try {
      // Get current tags for the phrase
      const phrase = phrases.find(p => p.id === phraseId);
      if (!phrase) return;

      const currentTags = phrase.tags || [];
      const newTags = currentTags.filter(tag => tag !== tagToRemove);

      const response = await fetch('/api/phrases/tags', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phraseId,
          tags: newTags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove tag from phrase');
      }

      // Refresh the list
      fetchPhrases(currentPage);
      addToast('Tag removed successfully!', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while removing tag';
      addToast(errorMessage, 'error');
    }
  };

  const handleExportToAnki = async () => {
    try {
      // Fetch the CSV export from the API
      const response = await fetch('/api/export/anki');

      if (!response.ok) {
        throw new Error('Failed to export phrases to Anki format');
      }

      // Create a download link
      const url = window.URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'phrases_anki_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      addToast('Phrases exported to Anki successfully!', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while exporting to Anki';
      addToast(errorMessage, 'error');
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
      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Phrases
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search source or translation..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Language Pair Filter */}
          <div>
            <label htmlFor="languagePair" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Language Pair
            </label>
            <select
              id="languagePair"
              value={selectedLanguagePair}
              onChange={(e) => setSelectedLanguagePair(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Language Pairs</option>
              {allLanguagePairs.map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Tags
            </label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
              {allTags.map(tag => (
                <label key={tag} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags([...selectedTags, tag]);
                      } else {
                        setSelectedTags(selectedTags.filter(t => t !== tag));
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Info and Export Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredPhrases.length} of {phrases.length} phrases
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedLanguagePair && ` in ${selectedLanguagePair}`}
          {selectedTags.length > 0 && ` with tags: ${selectedTags.join(', ')}`}
        </div>
        <button
          onClick={handleExportToAnki}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm"
        >
          Export to Anki
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Source Phrase</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Translation</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Language Pair</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Tags</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date Saved</th>
              <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPhrases.map((phrase) => (
              <tr key={phrase.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{phrase.sourcePhrase}</td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{phrase.translation}</td>
                <td className="py-3 px-4">
                  <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                    {phrase.languagePair}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {phrase.tags && phrase.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {phrase.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(phrase.id, tag)}
                            className="ml-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">No tags</span>
                  )}
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={editingTags[phrase.id] || ''}
                      onChange={(e) => handleTagInputChange(phrase.id, e.target.value)}
                      onKeyDown={(e) => handleTagInputKeyDown(e, phrase.id)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
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