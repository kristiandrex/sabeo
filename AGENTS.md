# Repository Guidelines

## Project Structure & Module Organization

Sabeo is a Next.js App Router workspace. `src/app` hosts route groups and server components, while reusable UI lives under `src/components` and logic under `src/lib`, `src/hooks`, and `src/queries`. Path aliases in `tsconfig.json` expose these modules under `#/...`. Static assets sit in `public/`, and `supabase/` contains migrations and config.

## Build, Test, and Development Commands

- `bun install` — install dependencies; Bun is the canonical package manager here.
- `bun run dev` — start `next dev --experimental-https`; remember to run `mkcert -install` beforehand so localhost certificates work.
- `bun run build` / `bun run start` — create and serve the production bundle.
- `bun run lint` — run Oxlint (type-aware via tsgolint); PRs must pass this.
- `bun run lint:fix` — apply safe autofixes from Oxlint.
- `bun run fmt` / `bun run fmt:check` — format or check formatting with oxfmt.
- `bun run typecheck` — run `tsgo --noEmit` (TypeScript Go) for typechecking.
- `bun run process-dictionary` — regenerate the Hunspell-based word list before changing dictionary logic.

## Coding Style & Naming Conventions

Code is TypeScript-first with 2-space indentation. Use `PascalCase` for components, `camelCase` for hooks/utilities, and `UPPER_SNAKE_CASE` for constants defined in `src/constants.ts`. Run Oxlint before pushing; if needed, use `bun run lint:fix` for safe auto-corrections.

Treat “AI slop” as a regression that must be reverted. Do not add filler comments that a maintainer wouldn’t write, defensive checks on already validated codepaths, casts to `any`, or any other one-off style that clashes with the surrounding file.

## React Patterns & Smells

Stick to functional React components, Next Server Actions, and Tailwind utility classes combined with `class-variance-authority`. The following expectations are non-negotiable:

- Prefer descriptive inline callbacks (`onClick={() => { trackShare(); openModal(); }}`) to unnamed handlers that hide intent, and avoid `<div onClick>` patterns—use semantic buttons or links so keyboard and screen-reader support stays intact.
- Reserve `useMemo` only for props flowing into expensive children; leaf components can re-render freely and memoization is never a bandaid for logic issues.
- Treat `useEffect` as glue to external systems (DOM APIs, timers, network/cache clients) rather than a default problem-solver. If a value can be derived during render or via an action, do it there.
- Keep state minimal, normalized, and structured to match how the UI renders. If two pieces of data can be derived from one source, store the source and calculate the rest. Group related fields, but split unrelated concerns so only the relevant leaf rerenders.
- Prefer stable identifiers over copying the same data into multiple states. Normalize responses inside `src/lib` helpers and pass only the shape a component actually needs.
- When an effect is justified, make it laser-focused: read the inputs at the top, handle exactly one concern, and use cleanups instead of extra booleans to manage lifecycle phases.

## Commit & Pull Request Guidelines

Follow conventional commits (`refactor:`, `feat:`, `fix:`) as seen in the existing log. Each commit should focus on one concern and include any schema or Supabase changes under `supabase/migrations`. Always use the Supabase CLI to create and manage migrations (for example, `supabase migration new`, `supabase db diff`, and `supabase db push`) rather than editing migration history by hand. Pull requests need a concise summary, linked issues when available, screenshots or terminal output for UI/data changes, environmental notes (new env keys like `QSTASH_TOKEN`), and the QA steps you ran. Ensure CI-equivalent commands (`bun run lint`, `bun run build`) were executed locally before requesting review.

## Security & Configuration Tips

Secrets live in `.env.local` and mirror Supabase and Vercel settings. Keep VAPID keys, QStash tokens, and server-only Supabase keys aligned across environments. Never commit generated credentials; instead update `.env.example` if new variables become mandatory.
