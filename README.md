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

- `Node.js` (LTS version recommended; see the [Node.js download page](https://nodejs.org/en/download))
- `pnpm`
- `Supabase CLI` (installed via `pnpm` as a dev dependency; run CLI commands with `pnpx supabase` per the [Supabase local development guide](https://supabase.com/docs/guides/local-development))
- `Docker Engine` or `Docker Desktop` (required for the Supabase local stack; see [Docker Engine install docs](https://docs.docker.com/engine/install/) and [Docker Desktop install docs, including Linux support](https://docs.docker.com/desktop/))
- `mkcert` ([FiloSottile/mkcert](https://github.com/FiloSottile/mkcert))

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

1. Run `pnpm dlx web-push generate-vapid-keys --json` from the project root to create a new public/private key pair.
2. Copy the printed `publicKey` and `privateKey` values into `.env` as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`.
