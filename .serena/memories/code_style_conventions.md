# Code Style & Conventions

## TypeScript Configuration
- **Strict Mode**: Enabled with strict type checking
- **Target**: ES2017
- **Module**: ESNext with bundler resolution
- **Path Mapping**: `@/*` maps to `./src/*`
- **JSX**: preserve mode for Next.js processing

## Code Style
- **Components**: Functional React components with TypeScript
- **File Extensions**: `.tsx` for React components, `.ts` for utilities
- **Import Style**: ES6 imports with path aliases (`@/` for src)
- **Naming**: 
  - Components: PascalCase (e.g., `TodoApp`, `SortableTaskItem`)
  - Files: camelCase for utilities, PascalCase for components
  - Interfaces: PascalCase (e.g., `Task`, `UserProfile`, `TodoAppProps`)

## Component Architecture
- **shadcn/ui**: "new-york" style with Zinc base color
- **Component Structure**: 
  - UI components in `@/components/ui/`
  - Business logic components in `@/components/`
  - Server Actions in `@/lib/`
- **Styling**: Tailwind CSS with CSS variables for theming

## Database & API Patterns
- **Server Actions**: Used for all database operations
- **Optimistic Updates**: UI updates immediately, syncs with backend
- **Error Handling**: Rollback on server action failures
- **Type Safety**: Interfaces for all data structures (Task, UserProfile, etc.)

## File Organization
- **App Router**: Pages in `src/app/` following Next.js 15 conventions
- **Utilities**: `src/utils/` for Supabase clients and helpers
- **Components**: Organized by UI vs business logic
- **Lib**: Server actions and shared utilities