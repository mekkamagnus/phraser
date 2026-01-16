'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm relative">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
            Phraser
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex space-x-6">
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

          {/* Hamburger Menu - Visible on mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <div className="space-y-1">
                <span className={`block w-6 h-0.5 bg-current transform transition duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-current transition duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block w-6 h-0.5 bg-current transform transition duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </div>
            </button>
          </div>
        </nav>

        {/* Mobile Menu - Hidden by default, shown when isMenuOpen is true */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-b-lg py-4 z-10">
            <div className="flex flex-col space-y-3 px-4">
              <Link
                href="/"
                className={`font-medium py-2 px-3 rounded-md ${
                  pathname === '/'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={closeMenu}
              >
                Translate
              </Link>
              <Link
                href="/browse"
                className={`font-medium py-2 px-3 rounded-md ${
                  pathname === '/browse'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={closeMenu}
              >
                Browse
              </Link>
              <Link
                href="/review"
                className={`font-medium py-2 px-3 rounded-md ${
                  pathname === '/review'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={closeMenu}
              >
                Review
              </Link>
              <Link
                href="/dashboard"
                className={`font-medium py-2 px-3 rounded-md ${
                  pathname === '/dashboard'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={closeMenu}
              >
                Stats
              </Link>
              <Link
                href="/tags"
                className={`font-medium py-2 px-3 rounded-md ${
                  pathname === '/tags'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={closeMenu}
              >
                Tags
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}