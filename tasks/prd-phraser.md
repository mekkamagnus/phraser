# Product Requirements Document: Phraser

**Project Name:** Phraser
**Type:** Language Learning Phrase Management Tool
**Version:** 1.0 (MVP)
**Date:** 2025-01-16

## Overview

Phraser is a language learning assistant that helps learners lookup, save, manage, and review phrases and vocabulary. The app focuses on quick translation lookup with seamless phrase saving, followed by flashcard-based review using spaced repetition.

### Target Audience
- Language learners who encounter unknown words/phrases while reading, studying, or communicating
- Users who want to build a personal vocabulary database
- Learners who use spaced repetition for long-term retention

### Core Value Proposition
- **Fast lookup**: Google Translate-style interface for quick translations
- **Effortless saving**: One-click save to build personal vocabulary database
- **Smart review**: Spaced repetition flashcard system optimized for retention
- **Clean organization**: Tags, search, and language pair categorization

## Tech Stack

### Frontend
- **Framework**: Next.js (App Router)
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Design**: Mobile-first responsive design

### Backend
- **API**: Next.js API routes
- **Database**: SQLite
- **ORM**: Drizzle ORM
- **Authentication**: None (single-user application)

### External Services
- **Translation**: DeepSeek API (API key from environment variables)

## User Stories (MVP)

### Epic 1: Phrase Translation & Lookup

**US-1.1: Quick Translation Input**
- As a language learner, I want to type or paste a phrase into a search box, so that I can quickly get the translation.
- Acceptance Criteria:
  - Primary input field on homepage
  - Support for paste action
  - Source language selector (dropdown)
  - Target language selector (dropdown)
  - Submit button to trigger translation
  - Loading state while fetching from DeepSeek API
  - Display translated phrase prominently

**US-1.2: Translation History**
- As a language learner, I want to see my recent translations, so that I can quickly revisit phrases I just looked up.
- Acceptance Criteria:
  - Display last 5 translations in session
  - Each entry shows: source phrase, translation, language pair, timestamp
  - Click to copy translation to clipboard

### Epic 2: Phrase Saving & Management

**US-2.1: Save Phrase to Database**
- As a language learner, I want to save translated phrases with one click, so that I can build my personal vocabulary database.
- Acceptance Criteria:
  - "Save" button appears after translation is displayed
  - On save: store source phrase, translation, source language, target language, timestamp
  - Success confirmation (toast notification)
  - Prevent duplicate saves of same phrase+language pair
  - Auto-tag with language pair category

**US-2.2: Browse Saved Phrases**
- As a language learner, I want to browse all my saved phrases, so that I can review my vocabulary collection.
- Acceptance Criteria:
  - Paginated list view of saved phrases
  - Each entry shows: source phrase, translation, language pair, save date
  - Edit button for each phrase
  - Delete button for each phrase
  - Empty state when no phrases saved

**US-2.3: Search & Filter Phrases**
- As a language learner, I want to search and filter my saved phrases, so that I can find specific words or phrases.
- Acceptance Criteria:
  - Search bar filters by source phrase OR translation
  - Filter by language pair (dropdown)
  - Filter by tags (multi-select)
  - Real-time filtering as user types/selects

**US-2.4: Manage Tags**
- As a language learner, I want to add custom tags to phrases, so that I can organize vocabulary by topic, difficulty, or context.
- Acceptance Criteria:
  - Add tags when saving a phrase (optional)
  - Add/edit tags on saved phrases
  - Tag input supports autocomplete from existing tags
  - Remove tags from phrases
  - View all tags used across all phrases

### Epic 3: Flashcard Review System

**US-3.1: Flashcard Review Mode**
- As a language learner, I want to review saved phrases as flashcards, so that I can memorize vocabulary through active recall.
- Acceptance Criteria:
  - "Start Review" button on main navigation
  - Flashcard displays source phrase OR translation (randomized)
  - Flip animation to reveal answer
  - Self-rating buttons: "Again", "Hard", "Good", "Easy"
  - Show next card after rating
  - Progress indicator (cards reviewed / total cards)

**US-3.2: Simple Spaced Repetition (SRS)**
- As a language learner, I want phrases I struggle with to appear more often, so that I focus on weak areas.
- Acceptance Criteria:
  - Store SRS data for each phrase: ease factor, interval, next review date
  - Calculate next review date based on user rating (Simplified SM-2 algorithm)
  - Only show cards due for review (next_review_date <= now)
  - If no cards due, show message "All cards reviewed for today!"

**US-3.3: Review Statistics**
- As a language learner, I want to see my review progress, so that I can track my learning consistency.
- Acceptance Criteria:
  - Dashboard showing: total cards, cards due today, cards reviewed today
  - Streak counter (consecutive days of review)
  - Last review date

### Epic 4: Anki Export

**US-4.1: Export to Anki Format**
- As a language learner, I want to export my phrases to Anki, so that I can use Anki's advanced SRS if desired.
- Acceptance Criteria:
  - Export button in phrase management view
  - Generate Anki-compatible CSV/UTF-8 file
  - Format: source phrase, translation, tags
  - File includes all fields needed for Anki import
  - Download dialog triggers automatically

### Epic 5: Database & Configuration

**US-5.1: SQLite Database Setup**
- As a developer, I need to set up the SQLite database with proper schema, so that the app can persist user data.
- Acceptance Criteria:
  - Initialize SQLite database with Drizzle ORM
  - Create tables: phrases, tags, phrase_tags, srs_data
  - Database file: `phraser.db` in project root
  - Run migrations on app startup

**US-5.2: Language Pair Configuration**
- As a developer, I need to define supported language pairs, so that users can select source and target languages.
- Acceptance Criteria:
  - Configuration object with common languages (English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean)
  - Language selector dropdowns use this config
  - Support for bidirectional translation (any pair)
  - Store language pair with each saved phrase

### Epic 6: Centralized Error Handling

**US-6.1: Centralized Error Handling**
- As a user, I want the application to handle errors gracefully, so that I receive meaningful feedback when something goes wrong.
- Acceptance Criteria:
  - Global error boundary component to catch unexpected React errors
  - Custom error page for displaying errors to users
  - Consistent error response format across all API routes
  - Error logging utility with context information
  - Network error handling with retry mechanism for API calls
  - Database error handling with appropriate fallbacks
  - User-friendly error messages that don't expose sensitive information
  - Toast notifications for displaying errors to users
  - Error reporting for analytics/debugging

## Non-Functional Requirements

### Performance
- Translation API call should complete within 3 seconds
- Flashcard flip animation should be smooth (60fps)
- Search/filter should respond within 500ms

### Accessibility
- All interactive elements keyboard accessible
- Proper ARIA labels on buttons and inputs
- Sufficient color contrast for text
- Support for screen readers

### Data Privacy
- All data stored locally in SQLite database
- No cloud sync or external analytics
- API key stored in environment variables only
- No user tracking or telemetry

### Error Handling
- Global error boundaries to catch unexpected React errors
- Consistent error response format across all API routes
- Client-side error logging with stack traces
- Server-side error logging with context information
- Graceful degradation when services are unavailable
- User-friendly error messages that don't expose sensitive information
- Error recovery mechanisms where appropriate
- Network error handling with retry logic for API calls
- Database error handling with appropriate fallbacks
- Validation error handling with clear feedback to users

## Out of Scope (Future Features)

The following features are explicitly NOT part of the MVP:
- User accounts/authentication
- Cloud sync across devices
- Voice input/output
- Image/text OCR
- Document translation
- Real-time translation
- Social features (sharing, public decks)
- Advanced analytics/learning insights
- Multiple SRS algorithms selection
- Custom flashcard layouts
- Spoken pronunciation audio

## Technical Implementation Notes

### Database Schema (Drizzle ORM)

```typescript
// phrases table
- id: integer (primary key)
- source_phrase: text
- translation: text
- source_language: text
- target_language: text
- created_at: timestamp
- updated_at: timestamp

// tags table
- id: integer (primary key)
- name: text (unique)
- created_at: timestamp

// phrase_tags table (junction)
- phrase_id: integer (foreign key)
- tag_id: integer (foreign key)

// srs_data table
- phrase_id: integer (foreign key, unique)
- ease_factor: number (default 2.5)
- interval: number (default 0)
- next_review_date: timestamp
- last_review_date: timestamp
```

### Simplified SM-2 Algorithm (MVP)

```
Ease Factor:
- "Again": ease_factor = max(1.3, ease_factor - 0.2)
- "Hard": ease_factor = ease_factor - 0.15
- "Good": ease_factor (unchanged)
- "Easy": ease_factor = ease_factor + 0.1

Interval (days):
- "Again": interval = 1
- "Hard": interval = max(1, interval * 1.2)
- "Good": interval = interval * ease_factor
- "Easy": interval = interval * ease_factor * 1.3
```

### DeepSeek API Integration

```typescript
// Environment variable: DEEPSEEK_API_KEY
// Endpoint: https://api.deepseek.com/v1/chat/completions
// Model: deepseek-chat
// Prompt engineering for translation tasks
```

## Success Metrics

- User can translate and save a phrase in under 10 seconds
- Flashcard review session flows smoothly without page reloads
- All data persists correctly across app restarts
- Anki export produces valid import file
- Mobile responsive design works on phones and tablets

## Open Questions

1. Should we add a "bulk import" feature for existing vocabulary lists? (Deferred)
2. Do we need a "backup/restore database" feature? (Deferred)
3. Should phrases be editable after saving, or create-only? (Answered: Yes, editable)
4. Do we need to track lookup history separate from saved phrases? (Answered: Yes, session-only)
