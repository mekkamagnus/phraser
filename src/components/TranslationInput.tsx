'use client';

import { useState, useEffect } from 'react';
import { LANGUAGES, getLanguageCodes, type LanguageCode } from '@/lib/languages';

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
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phrase,
          sourceLanguage: LANGUAGES[sourceLanguage],
          targetLanguage: LANGUAGES[targetLanguage],
        }),
      });

      const data: TranslationResult = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed');
      }

      if (data.translation) {
        setTranslation(data.translation);

        // Add to history
        const newHistoryItem: HistoryItem = {
          id: Date.now(), // Simple ID generation
          sourcePhrase: phrase,
          translation: data.translation,
          sourceLanguage,
          targetLanguage,
          timestamp: new Date(),
        };

        setHistory(prev => [newHistoryItem, ...prev].slice(0, 5)); // Keep only last 5
      } else {
        throw new Error('No translation received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!phrase.trim() || !translation.trim()) {
      setError('Nothing to save');
      return;
    }

    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/phrases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourcePhrase: phrase,
          translation,
          sourceLanguage,
          targetLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError('This phrase is already saved with this language pair');
        } else {
          throw new Error(data.error || 'Failed to save phrase');
        }
        return;
      }

      setSaveSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPhrase(text);
    } catch (err) {
      setError('Unable to paste from clipboard');
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Optionally show a success message
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
        {/* Language Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="sourceLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From
            </label>
            <select
              id="sourceLanguage"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value as LanguageCode)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {getLanguageCodes().map((code) => (
                <option key={code} value={code}>
                  {LANGUAGES[code]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To
            </label>
            <select
              id="targetLanguage"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as LanguageCode)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
          <label htmlFor="phrase" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phrase to translate
          </label>
          <div className="relative">
            <textarea
              id="phrase"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Enter text to translate..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Paste
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleTranslate}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? 'Translating...' : 'Translate'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Translation Result */}
        {translation && !isLoading && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Translation:
            </h3>
            <p className="text-lg text-gray-900 dark:text-white font-medium">
              {translation}
            </p>

            {/* Save Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {isSaving ? 'Saving...' : 'Save Phrase'}
              </button>
            </div>
          </div>
        )}

        {/* Save Success Message */}
        {saveSuccess && (
          <div className="bg-green-100 dark:bg-green-800/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-2 rounded-md text-sm">
            Phrase saved successfully!
          </div>
        )}

        {/* Translation History */}
        {history.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Recent Translations
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 dark:text-gray-200 truncate">
                        <span className="font-medium">{item.sourcePhrase}</span> → {item.translation}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
