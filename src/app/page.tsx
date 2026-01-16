import Link from 'next/link';
import TranslationInput from '@/components/TranslationInput';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6"> {/* Reduced padding for mobile */}
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2"> {/* Reduced font size for mobile */}
          Phraser
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6"> {/* Reduced margin for mobile */}
          Language learning with spaced repetition
        </p>

        <div className="mb-6 text-center">
          <Link
            href="/browse"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-base" // Increased button size for mobile
          >
            Browse Saved Phrases
          </Link>
        </div>

        <TranslationInput />
      </div>
    </main>
  );
}
