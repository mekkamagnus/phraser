# Agent Notes for Phraser Project

## Architecture Patterns
- **Next.js App Router**: Uses src/app directory structure with route handlers in route.ts files
- **Database**: Drizzle ORM with SQLite, schema defined in src/db/schema.ts
- **API Routes**: Next.js route handlers with proper error handling and validation
- **Client Components**: Use 'use client' directive for interactive components
- **Environment Variables**: Stored in .env file, accessed via process.env

## Database Patterns
- **Schema Definition**: Use drizzle-orm/sqlite-core for table definitions
- **Foreign Keys**: Use references() for relationships with proper onDelete options
- **Timestamps**: Use integer with mode: 'timestamp' and sql`(unixepoch())` for SQLite compatibility
- **Uniqueness**: Use .unique() constraint for preventing duplicates

## API Development
- **Validation**: Use Zod for request body validation
- **Error Handling**: Return appropriate HTTP status codes (400, 409, 500)
- **Response Format**: Consistent JSON responses with error/success messages
- **Duplicate Prevention**: Check for existing records before insertion

## UI/UX Patterns
- **Loading States**: Show appropriate loading indicators during async operations
- **Success Feedback**: Provide clear success notifications to users
- **Error Messages**: Display user-friendly error messages for different scenarios
- **Form Validation**: Validate inputs before submitting to backend

## Testing Approach
- **API Route Tests**: Mock database operations and test request/response flows
- **Component Tests**: Use @testing-library/react for UI interaction testing
- **Integration Tests**: Test complete workflows from UI to API to database
- **Error Case Tests**: Verify proper error handling for various failure scenarios

## Key Learnings
- When adding new API endpoints, ensure proper validation and error handling
- Database transactions should be handled carefully to maintain data integrity
- UI components should provide clear feedback for all user actions
- Testing with Bun has limitations with certain native modules like better-sqlite3