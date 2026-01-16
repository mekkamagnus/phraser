import { Suspense } from 'react';
import PhraseList from '@/components/PhraseList';

export default function BrowsePhrasesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
        Saved Phrases
      </h1>
      
      <Suspense fallback={<div>Loading phrases...</div>}>
        <PhraseList />
      </Suspense>
    </div>
  );
}