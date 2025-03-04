# Sabeo

A word-guessing game inspired by Wordle with random notifications like BeReal. Players attempt to guess a secret word within six tries, with each word consisting of five or six letters. After each guess, players receive color-coded feedback:

- 🟩 Green: Correct letter in the right position
- 🟨 Yellow: Correct letter in the wrong position
- ⬜ Gray: Letter not in the word

## Features

✅ Random notifications (PWA)
✅ Global and daily rankings
✅ Daily challenges
✅ Social authentication
✅ Mobile-first design
✅ Real-time updates
✅ Push notifications
⬜ Daily streak tracking (coming soon)

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

```bash
Node.js
pnpm
Supabase CLI
```

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
