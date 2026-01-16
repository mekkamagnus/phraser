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
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow"> {/* More rounded corners and adjusted padding */}
        <div className="grid grid-cols-1 gap-4"> {/* Changed to single column for mobile */}
          {/* Search Bar */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {/* Increased margin */}
              Search Phrases
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search source or translation..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-base" // Increased padding and font size for mobile
            />
          </div>

          {/* Language Pair Filter */}
          <div>
            <label htmlFor="languagePair" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {/* Increased margin */}
              Filter by Language Pair
            </label>
            <select
              id="languagePair"
              value={selectedLanguagePair}
              onChange={(e) => setSelectedLanguagePair(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-base" // Increased padding and font size for mobile
            >
              <option value="">All Language Pairs</option>
              {allLanguagePairs.map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {/* Increased margin */}
              Filter by Tags
            </label>
            <div className="flex flex-wrap gap-3 max-h-32 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"> {/* Increased gap and padding */}
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
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500" // Increased size for mobile
                  />
                  <span className="ml-2 text-base text-gray-700 dark:text-gray-300">{tag}</span> {/* Increased font size */}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Info and Export Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-base text-gray-600 dark:text-gray-400"> {/* Increased font size */}
          Showing {filteredPhrases.length} of {phrases.length} phrases
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedLanguagePair && ` in ${selectedLanguagePair}`}
          {selectedTags.length > 0 && ` with tags: ${selectedTags.join(', ')}`}
        </div>
        <button
          onClick={handleExportToAnki}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-base" // Increased padding and font size for mobile
        >
          Export to Anki
        </button>
      </div>

      {/* Card-based layout for phrases */}
      <div className="space-y-4"> {/* Changed from table to card layout */}
        {filteredPhrases.map((phrase) => (
          <div key={phrase.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm"> {/* Card styling */}
            <div className="flex justify-between items-start mb-3"> {/* Added margin */}
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1"> {/* Language label */}
                  {LANGUAGES[phrase.sourceLanguage as keyof typeof LANGUAGES]}
                </div>
                <div className="text-lg font-medium text-gray-800 dark:text-gray-200"> {/* Source phrase */}
                  {phrase.sourcePhrase}
                </div>
              </div>
              <button
                onClick={() => handleDelete(phrase.id)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium text-base p-2 min-w-[44px] min-h-[44px]" // Increased touch target size
              >
                Delete
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3"> {/* Separator with more spacing */}
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1"> {/* Language label */}
                {LANGUAGES[phrase.targetLanguage as keyof typeof LANGUAGES]}
              </div>
              <div className="text-lg font-medium text-gray-800 dark:text-gray-200"> {/* Translation */}
                {phrase.translation}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700"> {/* Tags section */}
              <div className="flex flex-wrap gap-2">
                {phrase.tags && phrase.tags.length > 0 ? (
                  phrase.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(phrase.id, tag)}
                        className="ml-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic text-sm">No tags</span>
                )}
              </div>

              {/* Tag input for this phrase */}
              <div className="mt-3 flex">
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={editingTags[phrase.id] || ''}
                  onChange={(e) => handleTagInputChange(phrase.id, e.target.value)}
                  onKeyDown={(e) => handleTagInputKeyDown(e, phrase.id)}
                  className="flex-1 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" // Increased padding and font size
                />
                <button
                  onClick={() => {
                    const tagValue = editingTags[phrase.id]?.trim();
                    if (tagValue) {
                      addTagToPhrase(phrase.id, tagValue);
                      setEditingTags(prev => ({
                        ...prev,
                        [phrase.id]: ''
                      }));
                    }
                  }}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-r-lg transition-colors text-base" // Increased padding and font size
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400"> {/* Date info */}
              {new Date(phrase.createdAt * 1000).toLocaleDateString()} • {phrase.languagePair}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-5 py-3 rounded-lg ${
              currentPage === 1
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } text-base`} // Increased padding and font size for mobile
          >
            Previous
          </button>

          <span className="text-gray-700 dark:text-gray-300 text-base"> {/* Increased font size */}
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-5 py-3 rounded-lg ${
              currentPage === totalPages
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } text-base`} // Increased padding and font size for mobile
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}