# Task Completion Checklist

## After Code Changes
1. **Lint Check**: Run `npm run lint` to check ESLint compliance
2. **TypeScript Check**: Ensure no TypeScript errors (strict mode enabled)
3. **Build Test**: Run `npm run build` to verify production build works
4. **Manual Testing**: Test in development with `npm run dev`

## Before Committing
1. **Code Review**: Ensure code follows project conventions
2. **Import Organization**: Verify correct use of path aliases (`@/*`)
3. **Type Safety**: All interfaces and types properly defined
4. **Error Handling**: Proper error boundaries and user feedback
5. **Responsive Design**: Mobile-first approach maintained
6. **Japanese Localization**: UI text in Japanese where appropriate

## Deployment Considerations
1. **Cloudflare Compatibility**: Test with `npm run preview` before deploy
2. **PWA Functionality**: Verify service worker updates
3. **Supabase Integration**: Check database connections and auth flows
4. **Environment Variables**: Ensure all required env vars are set

## Performance Checks
1. **Optimistic Updates**: UI responsiveness maintained
2. **Bundle Size**: Monitor for unnecessary dependencies
3. **Core Web Vitals**: Maintain performance standards
4. **PWA Metrics**: Service worker caching effectiveness

## No Dedicated Tests
Note: This project currently relies on TypeScript compilation and ESLint for quality assurance rather than dedicated test suites.