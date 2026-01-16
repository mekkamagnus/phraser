'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalCards: number;
  cardsDueToday: number;
  cardsReviewedToday: number;
  streak: number;
  lastReviewDate: string | null;
}

export default function ReviewStatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stats/review');

      if (!response.ok) {
        throw new Error('Failed to fetch review statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6"> {/* Reduced padding for mobile */}
      <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6"> {/* Reduced font size and margin for mobile */}
        Review Statistics
      </h1>
        <div className="text-center py-8">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6"> {/* Reduced padding for mobile */}
      <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6"> {/* Reduced font size and margin for mobile */}
        Review Statistics
      </h1>
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6"> {/* Reduced padding for mobile */}
      <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6"> {/* Reduced font size and margin for mobile */}
        Review Statistics
      </h1>

      {stats ? (
        <div className="grid grid-cols-1 gap-4"> {/* Changed to single column for mobile with adjusted gap */}
          {/* Total Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 text-center"> {/* More rounded corners and adjusted padding */}
            <h2 className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-2"> {/* Reduced font size */}
              Total Cards
            </h2>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCards}</p> {/* Reduced font size */}
          </div>

          {/* Cards Due Today */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 text-center"> {/* More rounded corners and adjusted padding */}
            <h2 className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-2"> {/* Reduced font size */}
              Due Today
            </h2>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.cardsDueToday}</p> {/* Reduced font size */}
          </div>

          {/* Cards Reviewed Today */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 text-center"> {/* More rounded corners and adjusted padding */}
            <h2 className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-2"> {/* Reduced font size */}
              Reviewed Today
            </h2>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.cardsReviewedToday}</p> {/* Reduced font size */}
          </div>

          {/* Streak */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 text-center"> {/* More rounded corners and adjusted padding */}
            <h2 className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-2"> {/* Reduced font size */}
              Current Streak
            </h2>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.streak} days</p> {/* Reduced font size */}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">No statistics available</div>
      )}

      {/* Last Review Date */}
      {stats?.lastReviewDate && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow p-5 text-center"> {/* More rounded corners and adjusted padding */}
          <h2 className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-2"> {/* Reduced font size */}
            Last Review
          </h2>
          <p className="text-lg text-gray-800 dark:text-gray-200"> {/* Reduced font size */}
            {new Date(stats.lastReviewDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-8 text-center"> {/* Reduced margin */}
        <a
          href="/review"
          className="inline-block px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-base" // Increased padding and font size for mobile
        >
          Start Review Session
        </a>
      </div>
    </div>
  );
}