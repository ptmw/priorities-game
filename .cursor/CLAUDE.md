# Priorities Game - Project Context

## Overview
This is a multiplayer web-based version of the Hasbro card game "Priorities". Players rank opinion-splitting items and try to guess each other's rankings.

## Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Real-time, Auth)
- **Deployment**: Vercel
- **State Management**: Zustand

## Development Approach
This project follows a CTO-guided development workflow:
- Strategic decisions and architecture are discussed with the CTO (via Claude chat)
- Implementation is delegated to Cursor following detailed execution plans
- Code is reviewed and iterated based on CTO feedback

## Project Phases
- ✅ **Phase 1**: Single-player prototype (tap-to-swap UI, scoring, 200 cards)
- 🚧 **Phase 2**: Multiplayer (Supabase, real-time rooms, roles, mid-game joining)
- 📋 **Phase 3**: Polish, custom decks, user accounts

## Current Status
Phase 2 (Multiplayer) is deployed and working. Room-based gameplay with real-time sync is functional.

## Key Design Decisions
- Anonymous play (no auth required for basic gameplay)
- Cooperative scoring (Players vs Game, race to 10)
- Mid-game joining enabled (spectators for current round)
- Mobile-first tap interface (no drag-and-drop)
- 4-letter room codes (easy to share verbally)

## Development Commands
Use slash commands for consistent workflow:
- `/explore` - Analyze before building
- `/create-plan` - Generate execution plan
- `/execute` - Implement the plan
- `/review` - Code review

## Important Notes
- Keep single-player mode working (don't break it)
- Always use TypeScript strictly (no `any` types)
- Test with multiple browser tabs for multiplayer
- Supabase env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
