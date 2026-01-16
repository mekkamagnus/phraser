import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock better-sqlite3 (not supported in Bun)
vi.mock('better-sqlite3', () => ({
  default: vi.fn().mockImplementation(() => ({
    prepare: vi.fn(),
    exec: vi.fn(),
    close: vi.fn(),
  })),
}));

// Mock database
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({ returning: vi.fn() }),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      phrases: {},
      tags: {},
      phraseTags: {},
      srsData: {},
    },
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ ...props }: any) => <img {...props} />,
}));
