# Exodo

Exodo is a mobile-first personal money tracker built with Next.js, Clerk, and Supabase.

## Development

```bash
pnpm install
pnpm dev
```

Useful checks:

```bash
pnpm format        # format source files
pnpm format:check  # verify formatting
pnpm typecheck     # run TypeScript checks
pnpm test          # run allocation tests
pnpm build         # verify the production build
```

## Structure

- `src/app` — Next.js routes, layouts, and route handlers
- `src/components` — reusable UI and feature components
- `src/hooks` — client-side state and browser behavior
- `src/lib` — integrations and shared application utilities
- `src/types` — shared domain types
- `src/allocation.ts` — daily income allocation rules and tests
- `docs` — database migration notes

Environment variables are documented in `.env.example`. Clerk handles authentication; Supabase is accessed with the authenticated Clerk token on the client and a server-only service role key for protected Gmail callbacks.
