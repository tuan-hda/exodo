# Exodo

Exodo is a mobile-first personal money tracker built with Next.js, Clerk, and Supabase.

## Development

Use Bun 1.4.2 or newer. Next.js development, build, and start scripts use Bun's runtime.

```bash
bun install
bun run dev
```

Useful checks:

```bash
bun run format        # format source files
bun run format:check  # verify formatting
bun run typecheck     # run TypeScript checks
bun run test          # run the Vitest suite
bun run build         # verify the production build
```

Use `bun run test` to run the existing Vitest tests. `bun test` invokes a different test runner.
Use `bun install --frozen-lockfile` for reproducible installs. Commit `bun.lock` with dependency changes.

## Structure

- `src/app` — thin Next.js route pages, layouts, and route handlers
- `src/features` — business features, feature UI, hooks, types, and domain logic
- `src/components` — reusable/common UI, including shadcn primitives
- `src/hooks` — generic client-side state and browser behavior
- `src/lib` — cross-feature integrations and shared utilities
- `docs` — database migration notes

Environment variables are documented in `.env.example`. For LAN testing, set `NEXT_PUBLIC_CLERK_ALLOWED_REDIRECT_ORIGINS` to the full origin(s) that should receive Clerk redirects, separated by commas. This single setting configures both Clerk redirects and Next.js development-origin checks. Clerk handles authentication; Supabase is accessed with the authenticated Clerk token on the client and a server-only service role key for protected Gmail callbacks.

## Gmail reading

Enable Gmail API in Google Cloud and create a Web application OAuth client with
the exact callback URL from `GOOGLE_REDIRECT_URI`. Configure `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET` and `SUPABASE_SERVICE_ROLE_KEY`
on the server. Set `GOOGLE_TOKEN_ENCRYPTION_KEY` to a base64-encoded 32-byte random
key in each deployment's server environment. Keep it separate from Supabase;
never prefix it with `NEXT_PUBLIC_` or commit it. Apply `docs/supabase-google-connections-migration.sql` if it has not
already been applied, then choose **Connect Gmail** in Inbox.

Gmail requests use Google's official `@googleapis/gmail` and
`google-auth-library` packages. These package versions require Node.js 22 or
newer; use a compatible Node.js runtime on Vercel.

Signed-in users can read recent Inbox messages, load older pages, and open
email bodies as text. HTML images/scripts are not loaded. Refresh tokens remain
server-side, encrypted with AES-256-GCM and bound to the user and mailbox.
Existing plaintext connections must reconnect; there is no token migration.
Retain the key across
deployments: changing or losing it requires reconnecting existing accounts.
Access is renewed for each read request. Expired permission prompts
reconnection. Google External apps in Testing issue Gmail refresh tokens that
expire after seven days; see [Google's token rules](https://developers.google.com/identity/protocols/oauth2#expiration).
