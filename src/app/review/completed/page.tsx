'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReviewCompletedPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
      <h1 className="text-3xl font-bold mb-6">Review Completed!</h1>
      <p className="text-xl mb-8">Great job! You have finished your review session.</p>
      
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="block mx-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Review
        </button>
        
        <Link 
          href="/"
          className="block mx-auto px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Translate More Phrases
        </Link>
        
        <Link 
          href="/browse"
          className="block mx-auto px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Browse Saved Phrases
        </Link>
      </div>
    </div>
  );
}