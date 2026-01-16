import TranslationInput from '@/components/TranslationInput';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-2">
          Phraser
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Language learning with spaced repetition
        </p>
        <TranslationInput />
      </div>
    </main>
  );
}
