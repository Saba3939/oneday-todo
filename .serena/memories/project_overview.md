# OneDay Todo - Project Overview

## Purpose
OneDay Todo (一日に集中できるタスク管理アプリ) is a Japanese todo application designed as a Progressive Web App (PWA) focused on daily task management. The app emphasizes single-day focus with features like drag-and-drop task reordering, importing incomplete tasks from previous days, and Pomodoro timer integration.

## Target Deployment
- Primary: Cloudflare deployment using OpenNext
- PWA capabilities for mobile-first experience
- Japanese timezone (JST) support for date handling

## Key Features
- Daily task management with drag-and-drop reordering using @dnd-kit
- Task import from previous days for incomplete tasks
- Pomodoro timer integration
- Authentication with Supabase Auth
- Optimistic UI updates with rollback on errors
- Mobile-responsive design with glassmorphism effects
- Japanese language interface

## Architecture Highlights
- Next.js 15 App Router with React 19
- Server Actions for backend operations
- Supabase for authentication and PostgreSQL database
- TypeScript strict mode with path mapping (@/* aliases)
- Tailwind CSS with shadcn/ui component library