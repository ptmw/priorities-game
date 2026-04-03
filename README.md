# Priorities Game

Playful ranking game where you rank items, then try to recreate your ranking from memory.

## Features

- **Drag-and-Drop Interface** - Touch-friendly reordering for mobile and desktop
- **Single Player** - Battle against the game to 10 points
- **Multiplayer** - 2-10 players, real-time sync via Supabase
- **200 Cards** - Pop culture, food, tech, activities, lifestyle
- **Mobile Optimized** - Fits on iPhone screen, smooth animations

## Tech Stack

- Next.js 14 + React 18 + TypeScript
- Tailwind CSS 4
- @dnd-kit (drag-and-drop)
- Zustand (state management)
- Supabase (multiplayer backend)

## ⚠️ Security Notice

**IMPORTANT:** If you previously cloned this repository, the `.env.local` file with Supabase credentials was accidentally committed to git history. These credentials have been removed and should be rotated.

**Action Required:**
1. If you're deploying this project, create new Supabase credentials
2. Never commit `.env.local` or any file containing secrets to git
3. Use `.env.example` as a template for local development

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Get these values from your [Supabase project settings](https://app.supabase.com).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Game Flow

1. **Ranking Phase** - Drag 5 cards to rank from "Love it" to "Hate it"
2. **Guessing Phase** - Recreate your ranking from memory
3. **Scoring** - 1 point per correct position
4. **Win** - First to 10 points wins

## Environment Variables (Production)

For production deployment (Vercel, etc.), set these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Never commit these values to git.** The `.env.local` file is in `.gitignore` to prevent accidental commits.

## Project Structure

```
components/
  game/
    RankingArea.tsx      # Main drag-drop interface
    SortableCard.tsx     # Draggable card component
  multiplayer/           # Multiplayer components
lib/
  game-logic.ts          # Scoring and comparison
  game-state.ts          # Zustand store (single player)
  multiplayer-state.ts   # Zustand store (multiplayer)
  cards-data.ts          # 200 card deck
```

## Build

```bash
npm run build
npm start
```

## Deploy

Deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/priorities-game)
