'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
            Phraser
          </Link>
          
          <div className="flex space-x-6">
            <Link 
              href="/"
              className={`font-medium ${
                pathname === '/' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Translate
            </Link>
            <Link
              href="/browse"
              className={`font-medium ${
                pathname === '/browse'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Browse
            </Link>
            <Link
              href="/review"
              className={`font-medium ${
                pathname === '/review'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Review
            </Link>
            <Link
              href="/dashboard"
              className={`font-medium ${
                pathname === '/dashboard'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Stats
            </Link>
            <Link
              href="/tags"
              className={`font-medium ${
                pathname === '/tags'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Tags
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}