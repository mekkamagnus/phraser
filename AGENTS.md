# Phraser - Development Guide for AI Agents

## Project Overview
Phraser is a language learning app built with Next.js 15, TypeScript, Tailwind CSS, Drizzle ORM, and SQLite. The app helps users translate, save, and review phrases using spaced repetition.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS (mobile-first)
- **Database**: SQLite with Drizzle ORM
- **Translation API**: DeepSeek API

## Key Conventions

### Component Structure
- Client components use 'use client' directive at the top
- Components stored in `src/components/`
- Use TypeScript interfaces for props (e.g., `TranslationResult`)
- Language codes are defined in `src/lib/languages.ts` as const object

### Database Patterns
- All database operations use Drizzle ORM from `src/db/`
- Schema is defined in `src/db/schema.ts`
- Tables use cascade deletes for referential integrity
- Timestamps use Unix epoch in integer mode for SQLite
- For SRS ease_factor, store as integer (2.5 * 100 = 250) to avoid floating point issues

### API Routes
- API routes follow App Router pattern: `src/app/api/[route]/route.ts`
- Use NextResponse for JSON responses
- Always validate request body
- Return proper HTTP status codes (400, 500, 503, etc.)

### Environment Variables
- API keys stored in `.env` file (not committed to git)
- Reference in code via `process.env.VARIABLE_NAME`
- Example: `DEEPSEEK_API_KEY` for DeepSeek API

### Language Configuration
- Languages defined as const object in `src/lib/languages.ts`
- Use language codes internally (en, es, fr, etc.)
- Convert to full names when sending to DeepSeek API
- Supported languages: English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean

## Common Gotchas

- **Translation API**: DeepSeek requires system prompt with context about source/target languages
- **Database migrations**: Run automatically on app startup via `src/db/migrate.ts`
- **Mobile responsiveness**: Always use Tailwind's responsive utilities (mobile-first approach)
- **State management**: Client components use useState for local state
- **API errors**: Always handle errors gracefully with user-friendly messages

## File Organization

```
src/
├── app/              # Next.js App Router pages and API routes
│   ├── api/         # API endpoints
│   ├── layout.tsx   # Root layout
│   └── page.tsx     # Homepage
├── components/      # React components
├── db/             # Database schema and connection
├── lib/            # Utility functions and configs
└── ...
```

## Testing the App
- Dev server: `npm run dev` (runs on port 3000 or 3001)
- Database operations: Check `phraser.db` in project root
- Translation endpoint: POST to `/api/translate`
