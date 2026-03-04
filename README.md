# Snakes & Ladders — F&O Market Edition

A roguelite board game where market intuition matters. Navigate 100 tiles of bull runs, fat-finger errors, and VIX storms. Build conviction, manage greeks, and race to ₹2,00,000 capital.

## Architecture

```
┌────────────────────────────────────────────────┐
│                  Client (React 19)              │
│  Zustand · Tailwind CSS 4 · Framer Motion 11   │
│  Socket.IO Client · MSW (dev mocks)            │
├────────────────────────────────────────────────┤
│              WebSocket (Socket.IO 4.8)          │
│   Namespaces: /game · /market · /lobby          │
├────────────────────────────────────────────────┤
│              Server (Node.js 20 + Express)       │
│  Turn Engine · VIX Simulator · Bot AI · Prisma  │
├────────────────────────────────────────────────┤
│          PostgreSQL 16  ·  Redis 7              │
└────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### Local Development

```bash
# 1. Clone & install
pnpm install

# 2. Start databases
docker compose up -d

# 3. Run Prisma migrations & seed
pnpm db:migrate
pnpm db:seed

# 4. Start dev servers (client + server)
pnpm dev
```

Client runs on `http://localhost:5173`, server on `http://localhost:3001`.

### Environment Variables

Copy `.env.example` to `.env` and fill in values. Key variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Server port |
| `DATABASE_URL` | (required) | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis for Socket.IO adapter |
| `JWT_SECRET` | (required) | JWT signing secret |
| `VIX_TICK_MS` | `15000` | VIX simulation tick interval |
| `DEMO_MODE` | `false` | Enable demo mode (relaxed auth) |
| `VITE_MOCK_API` | `false` | Enable MSW mock API in client |

## Monorepo Structure

```
packages/
├── shared/      # Types, constants, validators, factories
├── server/      # Express + Socket.IO + Prisma + game engine
└── client/      # React SPA + Zustand + Tailwind
```

### Turborepo Tasks

| Command | Description |
|---|---|
| `pnpm dev` | Start all packages in dev mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm docker:up` | Start Docker Compose services |
| `pnpm docker:down` | Stop Docker Compose services |

## Game Mechanics

### Board
- 100-tile grid with boustrophedon layout
- **Ladders** (warps up): Short Squeeze Ramp, FII Inflow, etc.
- **Snakes** (warps down + capital loss): Fat Finger, SEBI Crackdown, etc.
- **Event tiles**: Earnings Surprise, Expiry Volatility, etc.

### Turn Flow (7-stage pipeline)
1. **ROLL** — Dice roll (1-6), stun check
2. **MOVE** — Position update with bounce-back at 100
3. **TILE_EFFECT** — Apply snake/ladder/event effects
4. **MODIFIER** — Greek modifiers (theta, gamma, vega)
5. **CONVICTION** — Market view match scoring with conviction scalar
6. **CAPITAL** — Aggregate all deltas, apply buffs
7. **HEALTH_CHECK** — Margin call & stun detection

### Greeks
- **Theta**: 0.5% capital decay per turn
- **Gamma**: 1.5× multiplier on correct view, 2× on consecutive correct
- **Vega**: Extra penalty when VIX exceeds threshold (25)

### VIX Simulation
Ornstein-Uhlenbeck mean-reverting process with 5 regimes:
- Calm (<15), Normal (<25), Elevated (<40), High (<55), Extreme (≥55)

### Subscription Tiers
- **Apprentice** (Free): 5 games/day, basic board
- **MarketWarrior** (₹299/mo): Unlimited games, custom boards, multi-quests
- **BillionaireGuild** (₹999/mo): Tournaments, exclusive tiles, priority matchmaking

## Testing

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @game/shared test
pnpm --filter @game/server test
pnpm --filter @game/client test
```

Test infrastructure:
- **Vitest** for unit & integration tests
- **MSW 2.7** for client API mocking
- **Factory functions** in `@game/shared` for consistent test data

## Deployment

### Server → Railway
### Client → Cloudflare Pages

CI/CD via GitHub Actions (`.github/workflows/ci.yml`):
- Lint → Test (with Postgres + Redis services) → Build → Deploy

### Docker (full-stack)

```bash
docker compose -f docker-compose.yml -f docker-compose.full.yml up --build
```

## License

Private — All rights reserved.
