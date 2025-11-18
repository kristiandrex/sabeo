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
  App[Next.js App Router\nUI + Server Actions] -->|Auth & data queries| Supabase[(Supabase\nAuth · DB · Storage)]
  App -->|REST + webhooks| API[/Next.js API Routes/]
  App -->|Push opt-in & caching| PWA[Service Worker · Manifest]
  API -->|Persist game state & rankings| Supabase
  PWA -->|Triggers notification prompts| App
  EdgeFn[Supabase Edge Function\nschedule-daily-challenge] -->|Create daily job| QStash[(Upstash QStash\ncron delivery)]
  QStash -->|POST /api/qstash/start-challenge| API
  API -->|Start daily challenge| App
```

## Structure

```
sabeo/
├── src/app              # App Router routes, layouts, API routes, server actions
├── src/components       # UI modules and primitives under ui/
├── src/domain           # mecánicas del juego y contratos del dominio
│   ├── challenge/       # colores, queries del reto, start-challenge
│   └── ranking/         # tipos + queries del ranking
├── src/lib              # integraciones (Supabase, auth, env, PWA, QStash)
├── src/hooks            # client state (e.g., useLocalStorage)
├── scripts              # utilities like process-dictionary
├── supabase             # edge functions, config, migrations
└── public               # assets, icons, manifest
```

## Local requirements

- Bun
- Supabase CLI + Docker Engine/Desktop
- mkcert (`mkcert -install` once for local HTTPS)
- hunspell (needed for `process-dictionary`)

## Dictionary

Edit `data/dictionary-es.txt` and run `bun run process-dictionary` to rebuild the Hunspell-based word list.

## Push notifications

Generate VAPID keys with `bunx web-push generate-vapid-keys --json` and copy the values into your environment before hitting `/api/subscribe` or `/api/notify`.

## Daily cron

Iterate locally with `supabase functions serve schedule-daily-challenge --env-file .env`.

### Production schedule via pg\_cron

`supabase/migrations/20251118214523_schedule_daily_challenge_cron.sql` configures `pg_net` + `pg_cron`, posts the Edge Function, and schedules it daily (12:00 UTC / 07:00 Bogotá). Para activarlo:

1. Ejecuta `supabase db push` contra el proyecto.
2. Crea los secretos de Vault que el script espera:
   - `project_url`: URL base del proyecto (e.g., `https://...supabase.co`)
   - `service_role_key`: tu `SUPABASE_SERVICE_ROLE_KEY` (sólo server-side).
3. Confirma el cron con `select jobid, jobname, schedule from cron.job;`

Pausa/ajusta el cron con `select cron.unschedule('schedule-daily-challenge');` o editando la migración.

### Edge function deploy

Deploy the Edge Function (needed so pg\_cron has something to invoke) and ensure `SUPABASE_SERVICE_ROLE_KEY` is available when deploying:

```bash
supabase functions deploy schedule-daily-challenge \
  --project-ref <project_ref> \
  --import-map supabase/functions/schedule-daily-challenge/deno.json \
  --env-file .env.production
```

Keep Supabase, Vercel, and Upstash secrets in sync. Set `START_CHALLENGE_URL` to your deployed host (e.g., `https://sabeo.vercel.app`) so QStash posts to the right API.

## Environment variables

| Variable |
| --- |
| NEXT_PUBLIC_SUPABASE_URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY |
| NEXT_PUBLIC_VAPID_PUBLIC_KEY |
| SUPABASE_SERVICE_ROLE_KEY |
| START_CHALLENGE_URL |
| VAPID_PRIVATE_KEY |
| QSTASH_TOKEN |
| QSTASH_URL |
| QSTASH_CURRENT_SIGNING_KEY |
| QSTASH_NEXT_SIGNING_KEY |
