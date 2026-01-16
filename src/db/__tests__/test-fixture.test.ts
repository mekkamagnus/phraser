import { describe, it, expect } from 'vitest';
import { testDb, setupTestDB, resetTestDB, schema } from '../test-fixture';

describe('Test Database Fixture', () => {
  it('should have a test database connection', () => {
    expect(testDb).toBeDefined();
  });

  it('should have all schema tables available', () => {
    expect(schema.phrases).toBeDefined();
    expect(schema.tags).toBeDefined();
    expect(schema.phraseTags).toBeDefined();
    expect(schema.srsData).toBeDefined();
  });

  it('should allow mocking database operations', async () => {
    // Test that the mock functions are available
    expect(testDb.select).toBeDefined();
    expect(testDb.insert).toBeDefined();
    expect(testDb.update).toBeDefined();
    expect(testDb.delete).toBeDefined();

    // Test that insert returns a chainable object
    const insertResult = testDb.insert(schema.phrases);
    expect(insertResult.values).toBeDefined();

    const valuesResult = insertResult.values({});
    expect(valuesResult.returning).toBeDefined();
  });

  it('should have setup and reset functions', async () => {
    expect(setupTestDB).toBeDefined();
    expect(resetTestDB).toBeDefined();
  });
});