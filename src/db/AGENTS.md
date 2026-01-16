# Database Development Guide - Phraser

## Schema Overview

This database supports a spaced repetition language learning app with four main tables:

1. **phrases** - Core table for translated phrases
2. **tags** - Tags for organizing phrases
3. **phrase_tags** - Many-to-many relationship between phrases and tags
4. **srs_data** - Spaced repetition algorithm data for each phrase

## Key Patterns

### Foreign Key References
Always use proper foreign key references with cascade deletes:
```typescript
phraseId: integer('phrase_id').notNull().references(() => phrases.id, { onDelete: 'cascade' })
```

### Timestamps
Use Unix epoch in integer mode for SQLite compatibility:
```typescript
createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull()
```

### SRS Data Storage
- Store ease_factor as integer (2.5 * 100 = 250) to avoid floating point precision issues
- Interval is stored in days
- Next review date is calculated based on simplified SM-2 algorithm

## Schema Definitions

### phrases table
- id: auto-increment primary key
- sourcePhrase: text, not null
- translation: text, not null
- sourceLanguage: text, not null
- targetLanguage: text, not null
- createdAt: timestamp, defaults to now
- updatedAt: timestamp, defaults to now

### tags table
- id: auto-increment primary key
- name: text, unique, not null
- createdAt: timestamp, defaults to now

### phrase_tags table
- id: auto-increment primary key
- phraseId: foreign key to phrases (cascade delete)
- tagId: foreign key to tags (cascade delete)
- createdAt: timestamp, defaults to now

### srs_data table
- id: auto-increment primary key
- phraseId: foreign key to phrases (cascade delete), unique
- easeFactor: integer, default 250 (represents 2.5)
- interval: integer, default 0 (days)
- repetitions: integer, default 0
- nextReviewDate: timestamp, not null
- lastReviewDate: timestamp, nullable
- createdAt: timestamp, defaults to now
- updatedAt: timestamp, defaults to now

## Common Operations

### Querying phrases with tags
Use Drizzle's relation queries to join phrases with tags via phrase_tags.

### Checking for duplicates
Before saving a phrase, check if the same source_phrase + source_language + target_language combination already exists.

### SRS calculations
When updating SRS data:
1. Get user rating (Again=1, Hard=2, Good=3, Easy=4)
2. Update ease_factor based on rating
3. Calculate new interval in days
4. Set next_review_date to now + interval

## Database File
- Location: `phraser.db` in project root
- Migrations stored in `drizzle/` directory
- Auto-run migrations on app startup via `src/db/migrate.ts`
