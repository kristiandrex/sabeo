# Sabeo

A word-guessing game inspired by Wordle with BeReal-style random notifications. Players get six attempts to guess a five or six-letter word and receive color-coded feedback after every guess.

- 🟩 Green: correct letter, correct slot
- 🟨 Yellow: correct letter, wrong slot
- ⬜ Gray: letter not in the word

## Features

- ✅ Random notifications (PWA)
- ✅ Global and daily rankings
- ✅ Daily challenges
- ✅ Social authentication
- ✅ Mobile-first design
- ✅ Real-time updates
- ✅ Push notifications
- ✅ Daily streak tracking

## Architecture

```mermaid
graph TD
  App[Next.js] --> Supabase[(Supabase)]
  App --> API[/Next.js API/]
  App --> PWA[Service Worker]
  API --> Supabase
  PWA --> App
  Cron[(pg_cron)] --> EdgeFn[Edge Function]
  EdgeFn --> API
```

## Local requirements

- Bun
- Supabase CLI + Docker Engine/Desktop
- Deno (for Supabase Edge Functions)
- mkcert (`mkcert -install` once for local HTTPS); on macOS it may not be needed, install only if dev HTTPS fails.
- hunspell (only needed if you re-run `process-dictionary`)

## Development setup

- Install dependencies: `bun install`.
- Run the app: `bun run dev` (HTTPS; reinstall certs with `mkcert -install` if needed).
- Dictionary: edit `data/dictionary-es.txt` and run `bun run process-dictionary` to regenerate the word list (requires hunspell).

## Supabase setup

- Authenticate and link once: `supabase login` then `supabase link --project-ref <project_ref>`. After linking, omit `--project-ref` in the remaining commands.
- Start local stack: `supabase start`.
- Local migrations: after creating files under `supabase/migrations`, apply locally with `supabase db reset` (recreates local state).
- Remote migrations: `supabase db up` (uses the linked project).
- Edge Function `schedule-daily-challenge`: serve locally with `supabase functions serve schedule-daily-challenge --env-file .env`; deploy with `supabase functions deploy schedule-daily-challenge --import-map supabase/functions/schedule-daily-challenge/deno.json --env-file .env.production`.
- Cron definition lives in `supabase/migrations/20251118214523_schedule_daily_challenge_cron.sql` and invokes the Edge Function via pg\_cron/pg\_net.

### Supabase secrets

- Supabase Vault (for pg\_cron): exact names `EDGE_FUNCTION_URL` and `SERVICE_ROLE_KEY` (used by `run_schedule_daily_challenge`), plus VAPID keys if needed by other functions.
- Edge Function env (for `schedule-daily-challenge`): `START_CHALLENGE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_URL`. Authorization headers use `SUPABASE_SERVICE_ROLE_KEY`, so keep casing/names consistent with Vault.
- Google auth: set up Google in the Supabase dashboard following https://supabase.com/docs/guides/auth/social-login/auth-google and provide `SUPABASE_AUTH_GOOGLE_CLIENT_ID` / `SUPABASE_AUTH_GOOGLE_SECRET` (Google Cloud Console) in Supabase and your local `.env`.

## Push notifications

Generate VAPID keys with `bunx web-push generate-vapid-keys --json` and copy the values into your environment before hitting `/api/subscribe` or `/api/notify`.

## Environment variables

| Variable |
| --- |
| NEXT_PUBLIC_SUPABASE_URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY |
| NEXT_PUBLIC_VAPID_PUBLIC_KEY |
| SUPABASE_URL |
| SUPABASE_SERVICE_ROLE_KEY |
| START_CHALLENGE_URL |
| VAPID_PRIVATE_KEY |
| SUPABASE_AUTH_GOOGLE_CLIENT_ID |
| SUPABASE_AUTH_GOOGLE_SECRET |

## Ranking rules

Ranking behavior is defined in `supabase/migrations/20251116055924_change_ranking_system.sql` and consumed by `src/domain/ranking/queries.ts`.

- Base scoring: each completed daily challenge grants 1 point; `award_season_points_trigger` on `challenges_completed` updates `season_scores`.
- Fast bonus: +1 if the challenge is finished within 60 seconds of first opening it (tracked in `challenge_sessions` via `register_challenge_open`).
- Streak bonus: consecutive daily completions increment `current_streak`; when the streak grows and that streak day hasn’t been rewarded yet, +1 is added. Missing a day breaks the streak and restarts it on the next play (no points are subtracted when the streak breaks).
- Inactivity penalty: `apply_inactivity_penalties` increments `missed_in_a_row` for days without play and, starting on the 4th consecutive miss, subtracts 1 point per check (floored at 0) and clears fast bonus flags.
- Ranking query: `get_active_season_ranking` orders by `season_points` desc, then `current_streak` desc, then `updated_at` asc. Keep migrations and query logic aligned whenever the formula changes.
