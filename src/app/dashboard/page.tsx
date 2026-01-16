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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">Review Statistics</h1>
        <div className="text-center">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">Review Statistics</h1>
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">Review Statistics</h1>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Total Cards</h2>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCards}</p>
          </div>

          {/* Cards Due Today */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Due Today</h2>
            <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{stats.cardsDueToday}</p>
          </div>

          {/* Cards Reviewed Today */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Reviewed Today</h2>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.cardsReviewedToday}</p>
          </div>

          {/* Streak */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Current Streak</h2>
            <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{stats.streak} days</p>
          </div>
        </div>
      ) : (
        <div className="text-center">No statistics available</div>
      )}

      {/* Last Review Date */}
      {stats?.lastReviewDate && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Last Review</h2>
          <p className="text-xl text-gray-800 dark:text-gray-200">
            {new Date(stats.lastReviewDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <a 
          href="/review"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          Start Review Session
        </a>
      </div>
    </div>
  );
}