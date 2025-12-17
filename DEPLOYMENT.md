# Deployment & Monitoring

## Environments
- **Required env vars**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (for source map upload).
- Keep `.env` out of VCS; use platform secrets.

## Build pipeline
1. Install dependencies (`npm ci`).
2. Lint + tests: `npm run lint && npm run test`.
3. Build artefact: `npm run build`.
4. Upload source maps to Sentry (only when `SENTRY_AUTH_TOKEN` is present).
5. Deploy static assets to Vercel/Netlify (output `dist/`).

## Sentry setup
- Configure Sentry project `fitflow/web`.
- Set `VITE_SENTRY_DSN` for runtime reporting.
- Provide `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` in CI to enable the Vite plugin.
- Releases are derived from CI commit SHA.

## Smoke tests after deploy
Run these quickly in production/staging:
- Open `/` and ensure landing renders without console errors.
- Sign up/login, complete onboarding, and reach `/app/dashboard`.
- Start a workout session from `/app/workouts/plan` and mark a set.
- Add a calorie entry and confirm it appears in history.
- Verify PWA install prompt in Chrome (Application tab > Manifest shows valid data).
