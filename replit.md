# Quietly - Daily Journaling App

## Overview
Quietly is a private daily journaling application with structured reflection prompts, mood tracking, AI-powered insights, voice dictation, and push notification support. The app was migrated from Lovable/Supabase to a fullstack Replit environment.

## Project State
**Status**: Migration complete - Ready for production

The application has been fully migrated from Lovable/Supabase to Replit fullstack environment. All hooks and components now use the REST API backend instead of Supabase client.

## Architecture

### Backend Stack
- **Runtime**: Node.js with Express 5
- **Database**: PostgreSQL (Supabase, EU region) with Drizzle ORM
- **Authentication**: Passport.js with local strategy (email/password)
- **Session**: express-session with PostgreSQL session store

### Frontend Stack
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State**: TanStack Query (React Query)
- **Routing**: React Router v6

### Key Features
- Daily journal entries with 7 reflection prompts
- 5-point mood rating system
- AI-powered journal analysis and insights (requires API key)
- Voice dictation for entries (requires API key)
- Push notifications for journaling reminders (requires VAPID keys)
- Data export/import functionality
- Dark/light theme support
- PWA support with offline fallback and installability

## Project Structure
```
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── auth.ts       # Passport authentication setup
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database storage interface
│   └── vite.ts       # Vite middleware for development
├── shared/           # Shared types and schemas
│   └── schema.ts     # Drizzle database schema
├── src/              # React frontend
│   ├── components/   # UI components
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   └── lib/          # Utility functions
└── public/           # Static assets
```

## Database Schema

### Tables
- `users` - User accounts (email, hashed password)
- `journal_entries` - Daily journal entries with prompts and mood
- `user_settings` - User preferences (theme, notifications)
- `push_subscriptions` - Web push notification subscriptions

## API Routes

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout current session
- `GET /api/auth/user` - Get current authenticated user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Journal Entries
- `GET /api/entries` - Get all entries (with optional date filter)
- `GET /api/entries/dates` - Get list of entry dates
- `GET /api/entries/:date` - Get entry for specific date
- `POST /api/entries` - Create new entry
- `PATCH /api/entries/:date` - Update existing entry

### Settings
- `GET /api/settings` - Get user settings
- `PATCH /api/settings` - Update user settings

### AI Features (requires API keys)
- `POST /api/transcribe` - Transcribe audio to text
- `POST /api/analyze` - AI analysis of journal entries
- `GET /api/vapid-key` - Get VAPID public key for push notifications

### Push Notifications
- `POST /api/push-subscription` - Subscribe to push notifications
- `DELETE /api/push-subscription` - Unsubscribe from push notifications

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `SESSION_SECRET` - Session encryption secret

### Optional (for AI features)
- `INFOMANIAK_API_KEY` - API key for transcription service
- `INFOMANIAK_PRODUCT_ID` - Product ID for transcription service
- `VAPID_PUBLIC_KEY` - VAPID public key for push notifications
- `VAPID_PRIVATE_KEY` - VAPID private key for push notifications

## Recent Changes (Migration from Supabase)

### Completed
1. Replaced Supabase client with custom API client (`src/lib/api.ts`)
2. Migrated all hooks to use REST API instead of Supabase client:
   - useAuth, useJournalEntry, useUserSettings
   - useMoodData, useEntriesWithDates
   - useVoiceDictation, usePushSubscription
3. Updated all components using Supabase to use API routes
4. Set up Express 5 with Passport.js authentication
5. Configured PostgreSQL database with Drizzle ORM
6. Fixed Express 5 path-to-regexp syntax (`/{*path}` instead of `*`)

7. Fixed field name mismatch (snake_case → camelCase) in JournalEntryForm for proper data persistence
8. Added full PWA support: manifest.webmanifest, unified service worker (sw.js) with offline caching + push notifications, offline fallback page, service worker registration

### Legacy Code (can be removed)
- `src/integrations/supabase/` - Old Supabase client code
- `supabase/` - Supabase edge functions (replaced by server routes)
- `public/sw-push.js` - Old push-only service worker (replaced by unified sw.js)

## Development

### Running Locally
The application runs with `npm run dev` which starts both the Express server and Vite development server on port 5000.

### Database
- Push schema changes: `npm run db:push`
- View database: Use the SQL tool or Drizzle Studio

## User Preferences
- Theme: Light/Dark mode support
- Notifications: Configurable reminder time
