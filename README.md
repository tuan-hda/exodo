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

- `src/app` — thin Next.js route pages, layouts, and route handlers
- `src/features` — business features, feature UI, hooks, types, and domain logic
- `src/components` — reusable/common UI, including shadcn primitives
- `src/hooks` — generic client-side state and browser behavior
- `src/lib` — cross-feature integrations and shared utilities
- `docs` — database migration notes

Environment variables are documented in `.env.example`. For LAN testing, set `NEXT_PUBLIC_CLERK_ALLOWED_REDIRECT_ORIGINS` to the full origin(s) that should receive Clerk redirects, separated by commas. This single setting configures both Clerk redirects and Next.js development-origin checks. Clerk handles authentication; Supabase is accessed with the authenticated Clerk token on the client and a server-only service role key for protected Gmail callbacks.
