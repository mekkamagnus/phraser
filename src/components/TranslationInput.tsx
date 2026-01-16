'use client';

import { useState, useEffect } from 'react';
import { LANGUAGES, getLanguageCodes, type LanguageCode } from '@/lib/languages';
import { makeApiCall, NetworkErrorHandler } from '@/lib/networkErrorHandler';
import { useToast } from '@/components/Toast';

interface TranslationResult {
  translation?: string;
  error?: string;
}

interface HistoryItem {
  id: number;
  sourcePhrase: string;
  translation: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  timestamp: Date;
}

export default function TranslationInput() {
  const [phrase, setPhrase] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>('en');
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('es');
  const [translation, setTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const { addToast } = useToast();

  const handleTranslate = async () => {
    if (!phrase.trim()) {
      setError('Please enter a phrase to translate');
      return;
    }

    setIsLoading(true);
    setError('');
    setTranslation('');
    setSaveSuccess(false);

    try {
      const result = await makeApiCall<TranslationResult>('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phrase,
          sourceLanguage: LANGUAGES[sourceLanguage],
          targetLanguage: LANGUAGES[targetLanguage],
        }),
      }, {
        maxRetries: 2,
        delay: 500,
        backoffMultiplier: 1.5,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      });

      if (result.error) {
        addToast(result.error, 'error');
        throw new Error(result.error);
      }

      if (result.data?.translation) {
        setTranslation(result.data.translation);

        // Add to history
        const newHistoryItem: HistoryItem = {
          id: Date.now(), // Simple ID generation
          sourcePhrase: phrase,
          translation: result.data.translation,
          sourceLanguage,
          targetLanguage,
          timestamp: new Date(),
        };

        setHistory(prev => [newHistoryItem, ...prev].slice(0, 5)); // Keep only last 5
      } else {
        throw new Error('No translation received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!phrase.trim() || !translation.trim()) {
      const errorMsg = 'Nothing to save';
      setError(errorMsg);
      addToast(errorMsg, 'error');
      return;
    }

    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const result = await makeApiCall('/api/phrases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourcePhrase: phrase,
          translation,
          sourceLanguage,
          targetLanguage,
          tags: [...tags], // Send the tags array
        }),
      }, {
        maxRetries: 2,
        delay: 500,
        backoffMultiplier: 1.5,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      });

      if (result.error) {
        if (result.status === 409) {
          const errorMsg = 'This phrase is already saved with this language pair';
          setError(errorMsg);
          addToast(errorMsg, 'error');
        } else {
          addToast(result.error, 'error');
          throw new Error(result.error);
        }
        return;
      }

      setSaveSuccess(true);
      addToast('Phrase saved successfully!', 'success');
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      // Reset tags after successful save
      setTags([]);
      setTagsInput('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPhrase(text);
    } catch (err) {
      const errorMsg = 'Unable to paste from clipboard';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    }
  };

  const handleAddTag = () => {
    if (tagsInput.trim() && !tags.includes(tagsInput.trim())) {
      setTags([...tags, tagsInput.trim()]);
      setTagsInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast('Copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy: ', err);
      const errorMsg = 'Failed to copy to clipboard';
      addToast(errorMsg, 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 space-y-4"> {/* More rounded corners and adjusted padding */}
        {/* Language Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="sourceLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {/* Increased margin */}
              From
            </label>
            <select
              id="sourceLanguage"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value as LanguageCode)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-base" // Increased padding and font size for mobile
            >
              {getLanguageCodes().map((code) => (
                <option key={code} value={code}>
                  {LANGUAGES[code]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {/* Increased margin */}
              To
            </label>
            <select
              id="targetLanguage"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as LanguageCode)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-base" // Increased padding and font size for mobile
            >
              {getLanguageCodes().map((code) => (
                <option key={code} value={code}>
                  {LANGUAGES[code]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Area */}
        <div>
          <label htmlFor="phrase" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {/* Increased margin */}
            Phrase to translate
          </label>
          <div className="relative">
            <textarea
              id="phrase"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Enter text to translate..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none text-base" // Increased padding and font size for mobile
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute top-3 right-3 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors" // Increased size for mobile
            >
              Paste
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleTranslate}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-base" // Increased padding and font size for mobile
        >
          {isLoading ? 'Translating...' : 'Translate'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm"> {/* More rounded corners */}
            {error}
          </div>
        )}

        {/* Translation Result */}
        {translation && !isLoading && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5"> {/* More rounded corners and adjusted padding */}
            <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3"> {/* Increased font size and margin */}
              Translation:
            </h3>
            <p className="text-xl text-gray-900 dark:text-white font-medium"> {/* Increased font size */}
              {translation}
            </p>

            {/* Tags Input */}
            <div className="mt-5"> {/* Increased margin */}
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {/* Increased margin */}
                Add Tags (optional)
              </label>
              <div className="flex">
                <input
                  id="tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a tag and press Enter..."
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-base" // Increased padding and font size for mobile
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-3 rounded-r-lg transition-colors text-base" // Increased padding and font size for mobile
                >
                  Add
                </button>
              </div>

              {/* Display current tags */}
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2.5"> {/* Increased gap */}
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" // Increased padding and font size
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1.5 inline-flex items-center text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 text-lg" // Increased size
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="mt-5 flex justify-end"> {/* Increased margin */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-base" // Increased padding and font size for mobile
              >
                {isSaving ? 'Saving...' : 'Save Phrase'}
              </button>
            </div>
          </div>
        )}

        {/* Save Success Message */}
        {saveSuccess && (
          <div className="bg-green-100 dark:bg-green-800/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm"> {/* More rounded corners */}
            Phrase saved successfully!
          </div>
        )}

        {/* Translation History */}
        {history.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-5"> {/* Increased padding */}
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4"> {/* Increased margin */}
              Recent Translations
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600" // More rounded corners and adjusted padding
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 dark:text-gray-200 truncate">
                        <span className="font-medium">{item.sourcePhrase}</span> → {item.translation}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5"> {/* Increased margin */}
                        {LANGUAGES[item.sourceLanguage]} → {LANGUAGES[item.targetLanguage]} •{' '}
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(item.translation)}
                      className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
