# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Japanese todo application called "OneDay Todo" (一日に集中できるタスク管理アプリ) built with Next.js 15, TypeScript, and Supabase. It's designed as a PWA with Cloudflare deployment support. The app focuses on daily task management with drag-and-drop reordering, task import from previous days, and Pomodoro timer integration.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run preview` - Build and preview with OpenNext for Cloudflare
- `npm run deploy` - Build and deploy to Cloudflare
- `npm run upload` - Build and upload to Cloudflare
- `npm run cf-typegen` - Generate Cloudflare types

## Architecture

### Frontend Architecture
- **Framework**: Next.js 15 App Router with React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React useState/useEffect with optimistic updates
- **Drag & Drop**: @dnd-kit for task reordering
- **PWA**: next-pwa for Progressive Web App functionality

### Backend & Database
- **Authentication**: Supabase Auth with middleware protection
- **Database**: Supabase PostgreSQL
- **Server Actions**: Next.js Server Actions in `/src/lib/tasks.ts`
- **Edge Functions**: Supabase Edge Functions for task reset (`/supabase/functions/reset-tasks/`)

### Key Components Structure
- **Main App**: `src/components/TodoApp.tsx` - Central component handling all todo functionality
- **UI Components**: `src/components/ui/` - shadcn/ui components (Button, Card, Dialog, etc.)
- **Authentication**: 
  - `src/utils/supabase/` - Supabase client configurations (client, server, middleware)
  - `src/app/auth/` - Auth callback and confirmation routes
  - `src/app/login/`, `src/app/signup/` - Auth pages with server actions

### Database Schema (inferred)
- **tasks table**: id, user_id, order_index, content, is_completed, created_at
- **User profiles**: Stored in Supabase auth with custom profile data

## Key Features Implementation

### Task Management
- **Optimistic Updates**: UI updates immediately, then syncs with backend
- **Drag & Drop Reordering**: Uses @dnd-kit with order_index field
- **Daily Task Import**: Shows dialog to import incomplete tasks from previous days
- **Task State Tracking**: Prevents duplicate operations during async calls

### Authentication Flow
- Middleware protects all routes except static assets
- Server actions handle login/signup with Supabase
- Profile setup page for additional user data
- Auto-redirect based on auth state

### Date Handling
- JST timezone conversion for Japanese users
- Date-based task filtering and previous day detection
- Clean date display with Japanese day names

## Development Notes

### Supabase Integration
- Server Actions use `createClient()` from `@/utils/supabase/server`
- Client components use `createClient()` from `@/utils/supabase/client`
- Middleware handles session updates automatically
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Deployment
- Configured for Cloudflare deployment via OpenNext
- PWA manifest and service worker in `/public/`
- Static asset optimization for CDN delivery

### UI/UX Patterns
- Responsive design with mobile-first approach
- Glassmorphism effects with backdrop-blur
- Smooth transitions and loading states
- Japanese language interface with English technical terms

## Testing & Quality
- TypeScript strict mode enabled
- ESLint configuration for Next.js
- Error boundaries and user feedback on failures
- Optimistic updates with rollback on errors