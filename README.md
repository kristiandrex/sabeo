# Sabeo

A word-guessing game inspired by Wordle with random notifications like BeReal. Players attempt to guess a secret word within six tries, with each word consisting of five or six letters. After each guess, players receive color-coded feedback:

- 🟩 Green: Correct letter in the right position
- 🟨 Yellow: Correct letter in the wrong position
- ⬜ Gray: Letter not in the word

## Features

- ✅ Random notifications (PWA)
- ✅ Global and daily rankings
- ✅ Daily challenges
- ✅ Social authentication
- ✅ Mobile-first design
- ✅ Real-time updates
- ✅ Push notifications
- ⬜ Daily streak tracking (coming soon)

## Architecture

![Architecture diagram](https://github.com/user-attachments/assets/fe168d49-b049-4719-9b85-b15de2b4f0fe)

## Tech Stack

### Core

- Next.js
- TypeScript
- Supabase
- Tailwind CSS
- Radix UI
- PWA

### Key Dependencies

- React
- Web Push
- Sonner
- Lucide Icons
- React Confetti

## Development

### Prerequisites

- `Bun` ([Bun docs](https://bun.com/docs))
- `Supabase CLI` (install via Homebrew following the [official guide for Linux](https://supabase.com/docs/guides/local-development/cli/getting-started); e.g., `brew install supabase/tap/supabase`, then run commands with `supabase ...`)
- `Docker Engine` or `Docker Desktop` (required for the Supabase local stack; see [Docker Engine install docs](https://docs.docker.com/engine/install/) and [Docker Desktop install docs, including Linux support](https://docs.docker.com/desktop/))
- `mkcert` ([FiloSottile/mkcert](https://github.com/FiloSottile/mkcert))
- `hunspell` ([Hunspell project](https://github.com/hunspell/hunspell))

### Local HTTPS

- Run `mkcert -install` once to trust the local certificate authority before using `next dev --experimental-https`.

### Project Structure

```
sabeo/
├── src/
│   ├── app/         # Next.js app router
│   ├── components/  # React components
│   └── lib/         # Utility functions
├── supabase/        # Backend configuration
└── public/          # Static assets
```

### Security

- Google OAuth
- JWT token management
- Push notification encryption (VAPID)
- Row Level Security
- Custom authentication callbacks

### Generating VAPID Keys

Sabeo relies on VAPID for push notification encryption. Use the [web-push CLI](https://github.com/web-push-libs/web-push) to rotate the key pair:

1. Run `bunx web-push generate-vapid-keys --json` from the project root to create a new public/private key pair.
2. Copy the printed `publicKey` and `privateKey` values into `.env` as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`.

### QStash & Cron Environment Variables

Configura estas variables en `.env.local`, en los secretos de Supabase Functions y en el entorno de producción (Vercel) antes de habilitar el cron diario:

- `QSTASH_TOKEN`: token de API de QStash para crear schedules desde la función `schedule-daily-challenge`.
- `QSTASH_URL`: endpoint base de la API (por defecto `https://qstash.upstash.io`).
- `QSTASH_CURRENT_SIGNING_KEY` y `QSTASH_NEXT_SIGNING_KEY`: claves que entrega Upstash para verificar `upstash-signature`.
- `START_CHALLENGE_INTERNAL_KEY`: llave interna que se enviará en el header `x-internal-key` para autorizar `/api/qstash/start-challenge`.
- `SUPABASE_FUNCTION_SECRET`: secreto para validar que el cron de Supabase es quien invoca la función edge.

Mantén estos valores sincronizados entre local, Supabase y producción para evitar fallos al crear o ejecutar schedules.

### Despliegue del cron en Supabase

Cuando estés listo para habilitar el cron diario, ejecuta (ajusta `project-ref`, cron y archivo de entorno según tu setup):

```bash
supabase secrets set --project-ref <project_ref> SUPABASE_FUNCTION_SECRET=... START_CHALLENGE_INTERNAL_KEY=... QSTASH_TOKEN=... QSTASH_URL=... NEXT_PUBLIC_APP_URL=...

supabase functions deploy schedule-daily-challenge \
  --project-ref <project_ref> \
  --import-map supabase/functions/schedule-daily-challenge/deno.json \
  --env-file .env.production \
  --schedule "0 12 * * *"
```

- Usa una hora de cron anterior a las 08:00 BOG (ej. 12:00 UTC ≈ 07:00 BOG) para que la función tenga tiempo de programar el horario aleatorio del día.
- Si necesitas deshabilitar temporalmente el cron, puedes ejecutar `supabase functions delete schedule-daily-challenge --project-ref <project_ref>` o pausar el schedule desde el dashboard de Upstash.
