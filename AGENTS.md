# Repository Guidelines

## Project Structure & Module Organization
Sabeo is a Next.js App Router workspace. `src/app` hosts route groups and server components, while reusable UI lives under `src/components` and logic under `src/lib`, `src/hooks`, and `src/queries`. Path aliases in `tsconfig.json` expose these modules under `#/...`. Static assets sit in `public/`, and `supabase/` contains edge functions, migrations, and config (see `supabase/functions/schedule-daily-challenge`).

## Build, Test, and Development Commands
- `bun install` — install dependencies; Bun is the canonical package manager here.
- `bun run dev` — start `next dev --experimental-https`; remember to run `mkcert -install` beforehand so localhost certificates work.
- `bun run build` / `bun run start` — create and serve the production bundle.
- `bun run lint` — run `eslint.config.mjs` against the whole tree; PRs must pass this.
- `bun run process-dictionary` — regenerate the Hunspell-based word list before changing dictionary logic.
- `supabase functions serve schedule-daily-challenge` (from `supabase/`) — iterate on the cron function locally before deploying with `supabase functions deploy`.

## Coding Style & Naming Conventions
Code is TypeScript-first with 2-space indentation. Use `PascalCase` for React components, `camelCase` for hooks/utilities, and `UPPER_SNAKE_CASE` for constants defined in `src/constants.ts`. Stick to functional React components, Next Server Actions, and Tailwind utility classes combined with `class-variance-authority`. Run ESLint before pushing; if needed, use `bun run lint -- --fix` for safe auto-corrections.

Treat “AI slop” as a regression that must be reverted. Do not add filler comments that a maintainer wouldn’t write, defensive checks on already validated codepaths, casts to `any`, or any other one-off style that clashes with the surrounding file. Prefer descriptive inline callbacks (`onClick={() => { trackShare(); openModal(); }}`) to unnamed handlers that hide intent. Avoid `<div onClick>` patterns—use semantic buttons or links so keyboard and screen-reader support stays intact. Reserve `useMemo` and similar memoization only for props passed into expensive children; leaf components can re-render freely, and memoization should never be used as a bandaid for bugs.

## Commit & Pull Request Guidelines
Follow conventional commits (`refactor:`, `feat:`, `fix:`) as seen in the existing log. Each commit should focus on one concern and include any schema or Supabase changes under `supabase/migrations`. Pull requests need a concise summary, linked issues when available, screenshots or terminal output for UI/data changes, environmental notes (new env keys like `QSTASH_TOKEN`), and the QA steps you ran. Ensure CI-equivalent commands (`bun run lint`, `bun run build`) were executed locally before requesting review.

## Security & Configuration Tips
Secrets live in `.env.local` and mirror Supabase and Vercel settings. Keep VAPID keys, QStash tokens, and `START_CHALLENGE_INTERNAL_KEY` aligned across environments. Never commit generated credentials; instead update `.env.example` if new variables become mandatory.
