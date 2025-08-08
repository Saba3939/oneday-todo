# Codebase Structure

## Root Level
- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js configuration with PWA setup
- `tsconfig.json` - TypeScript configuration with strict mode
- `eslint.config.mjs` - ESLint configuration for Next.js
- `components.json` - shadcn/ui configuration (new-york style)
- `tailwind.config.js` / `postcss.config.mjs` - Styling configuration
- `wrangler.jsonc` - Cloudflare configuration
- `CLAUDE.md` - AI assistant guidance documentation

## Source Structure (`src/`)
```
src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with auth
│   ├── page.tsx             # Home page (main todo app)
│   ├── globals.css          # Global Tailwind styles
│   ├── auth/                # Authentication routes
│   │   ├── confirm/route.ts # Email confirmation
│   │   └── callback/route.ts# Auth callback
│   ├── login/               # Login page + server actions
│   ├── signup/              # Signup page + server actions
│   ├── profile-setup/       # User profile setup
│   ├── error/               # Error pages
│   └── api/                 # API routes
├── components/              # React components
│   ├── TodoApp.tsx          # Main todo application logic
│   ├── AuthSuccessNotification.tsx
│   └── ui/                  # shadcn/ui components
├── lib/                     # Utilities and server actions
│   ├── tasks.ts             # Task-related server actions
│   └── utils.ts             # Utility functions
├── utils/                   # Configuration utilities
│   └── supabase/            # Supabase client configurations
└── middleware.ts            # Auth middleware
```

## Database Schema (Supabase)
- **tasks**: id, user_id, order_index, content, is_completed, created_at
- **User profiles**: Extended user data beyond Supabase auth

## Key Files
- `src/components/TodoApp.tsx` - Central todo functionality
- `src/lib/tasks.ts` - All task-related database operations
- `src/utils/supabase/` - Database client configurations
- `src/middleware.ts` - Route protection and session management