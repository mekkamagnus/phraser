'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tag {
  id: number;
  name: string;
}

export default function AllTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/phrases/tags');

      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      const data = await response.json();
      setTags(data.tags || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-6 text-center text-base">Loading tags...</div>; {/* Reduced padding and increased font size for mobile */}
  }

  if (error) {
    return <div className="container mx-auto px-4 py-6 text-center text-red-500 text-base">Error: {error}</div>; {/* Reduced padding and increased font size for mobile */}
  }

  return (
    <div className="container mx-auto px-4 py-6"> {/* Reduced padding for mobile */}
      <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6"> {/* Reduced font size and margin for mobile */}
        All Tags
      </h1>

      {tags.length === 0 ? (
        <div className="text-center py-8"> {/* Reduced padding */}
          <p className="text-gray-600 dark:text-gray-400 text-base">No tags found.</p> {/* Increased font size */}
          <p className="text-gray-500 dark:text-gray-500 mt-3"> {/* Increased margin */}
            Save some phrases with tags to see them listed here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3"> {/* Changed to 2 columns for mobile with adjusted gap */}
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${encodeURIComponent(tag.name)}`}
              className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-4 rounded-xl text-center shadow text-base hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}