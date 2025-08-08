# Suggested Commands for OneDay Todo

## Development Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start production server locally
- `npm run lint` - Run ESLint linting
- `npm run preview` - Build and preview with OpenNext for Cloudflare
- `npm run deploy` - Build and deploy to Cloudflare
- `npm run upload` - Build and upload to Cloudflare
- `npm run cf-typegen` - Generate Cloudflare types

## System Commands (macOS/Darwin)
- `ls` - List directory contents
- `cd` - Change directory
- `grep` - Search text in files (or use `rg` for ripgrep if available)
- `find` - Find files and directories
- `git` - Git version control operations
- `open` - Open files/directories in default application
- `pbcopy` / `pbpaste` - Copy/paste to clipboard

## Testing & Quality Assurance
Currently no dedicated test runner is configured - the project relies on:
- TypeScript compiler for type checking
- ESLint for code quality
- Next.js built-in error reporting

## Database & Supabase
- Access Supabase dashboard for database management
- Edge Functions located in `/supabase/functions/`
- Database schema managed through Supabase dashboard