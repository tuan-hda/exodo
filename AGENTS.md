# Exodo project instructions

- Use `pnpm` for package installation, scripts, and dependency management. Do not use `npm` or `yarn`.
- Prefix shell commands with `rtk` when working in this repository.
- This is a Next.js App Router project written in TypeScript.
- Keep route files under `src/app`; route `page.tsx` files should stay small and compose a feature entry point.
- Put feature/business components and their feature-specific hooks, types, and logic under `src/features/<feature>`.
- Keep `src/components` for reusable/common UI only, including the shared `src/components/ui` primitives.
- Keep cross-feature infrastructure and generic utilities under `src/lib` and `src/hooks`.
- Use Tailwind CSS v4 through `postcss.config.mjs`; keep visual changes in the existing black-and-white theme.
- Prefer Tailwind utility classes for component styling whenever possible and appropriate; avoid `!important` for visual overrides.
- Follow the established design language: reuse shared UI primitives, centralize button shape, border, shadow, hover, and focus behavior, and avoid screen-specific button overrides unless they are intentional exceptions.
- Keep regular buttons as rounded rectangles; reserve full rounding for circular controls and semantically appropriate pills.
- Design and implement mobile-first: validate narrow viewports first, use `100dvh`/safe-area insets for full-height and fixed UI, and prevent horizontal overflow before adding desktop enhancements.
- Keep every text input at a minimum of 16px to prevent mobile browser zoom and preserve consistent touch-oriented form behavior.
- Clerk is the authentication provider. Use `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` for the browser and never expose a Clerk secret key.
- Run `pnpm test` for allocation tests and `pnpm run build` for the production verification build.
