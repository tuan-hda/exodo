# Exodo project instructions

- Use `pnpm` for package installation, scripts, and dependency management. Do not use `npm` or `yarn`.
- Prefix shell commands with `rtk` when working in this repository.
- This is a Next.js App Router project written in TypeScript.
- Keep route files under `src/app` and reusable UI under `src/components`.
- Use Tailwind CSS v4 through `postcss.config.mjs`; keep visual changes in the existing black-and-white theme.
- Design and implement mobile-first: validate narrow viewports first, use `100dvh`/safe-area insets for full-height and fixed UI, and prevent horizontal overflow before adding desktop enhancements.
- Clerk is the authentication provider. Use `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` for the browser and never expose a Clerk secret key.
- Run `pnpm test` for allocation tests and `pnpm run build` for the production verification build.
