import { Suspense } from 'react';
import PhraseList from '@/components/PhraseList';

export default function BrowsePhrasesPage() {
  return (
    <div className="container mx-auto px-4 py-6"> {/* Reduced padding for mobile */}
      <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6"> {/* Reduced font size and margin for mobile */}
        Saved Phrases
      </h1>

      <Suspense fallback={<div className="text-center py-8">Loading phrases...</div>}> {/* Added styling to loading fallback */}
        <PhraseList />
      </Suspense>
    </div>
  );
}