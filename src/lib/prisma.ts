/**
 * DEPRECATED: Prisma is no longer used in the frontend.
 * 
 * The application has migrated to backend-driven architecture.
 * All database operations are now performed through the Express backend API.
 * 
 * Frontend only handles:
 * - User authentication via JWT
 * - Client-side state management
 * - API calls to backend
 * 
 * Backend (muzlib-api) handles:
 * - Database queries (Prisma ORM)
 * - User management
 * - Book management
 * - Bookmark operations
 */

// This file is kept for reference but is no longer used.
// Remove @prisma/client from package.json if not needed elsewhere.