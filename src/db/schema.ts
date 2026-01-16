import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const phrases = sqliteTable('phrases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourcePhrase: text('source_phrase').notNull(),
  translation: text('translation').notNull(),
  sourceLanguage: text('source_language').notNull(),
  targetLanguage: text('target_language').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export const phraseTags = sqliteTable('phrase_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phraseId: integer('phrase_id').notNull().references(() => phrases.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export const srsData = sqliteTable('srs_data', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phraseId: integer('phrase_id').notNull().references(() => phrases.id, { onDelete: 'cascade' }),
  easeFactor: integer('ease_factor').notNull().default(250), // 2.5 * 100
  interval: integer('interval').notNull().default(0), // days until next review
  repetitions: integer('repetitions').notNull().default(0),
  nextReviewDate: integer('next_review_date', { mode: 'timestamp' }).notNull(),
  lastReviewDate: integer('last_review_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});
