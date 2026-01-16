// Since better-sqlite3 is not supported in Bun, we'll create a mock for testing purposes
// This is just for the test infrastructure setup
import { vi } from 'vitest';

export const testDb = {
  select: vi.fn(),
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn().mockResolvedValue([{}])
    }))
  })),
  update: vi.fn(),
  delete: vi.fn(() => ({
    where: vi.fn()
  })),
  query: {
    phrases: {},
    tags: {},
    phraseTags: {},
    srsData: {}
  }
};

// Run migrations for the test database
export async function setupTestDB() {
  console.log('✓ Test database setup completed (mock)');
}

// Helper to reset the test database
export async function resetTestDB() {
  // Clear mock calls
  if (typeof testDb.select === 'function') {
    vi.clearAllMocks?.();
  }
}

// Export individual tables for easy access in tests
export const schema = {
  phrases: { id: { eq: vi.fn() } },
  tags: {},
  phraseTags: {},
  srsData: {}
};