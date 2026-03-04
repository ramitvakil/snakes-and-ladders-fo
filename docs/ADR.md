# Architecture Decision Records (ADRs)

## ADR-001: Monorepo with Turborepo + pnpm

**Status:** Accepted  
**Date:** 2025-01-01  

**Context:** Need to share types, validators, and constants between server and client while maintaining independent build/test pipelines.

**Decision:** Use pnpm workspaces with Turborepo for task orchestration. Three packages: `shared`, `server`, `client`.

**Consequences:**
- (+) Single repo, atomic commits across packages
- (+) Turborepo caches builds, parallelizes independent tasks
- (+) Shared types via `@game/shared` workspace dependency
- (-) Slightly more complex initial setup

---

## ADR-002: Zustand over React Context for State Management

**Status:** Accepted  
**Date:** 2025-01-01  

**Context:** Game state must be accessible both inside React components (UI) and outside React (Socket.IO event handlers). React Context only works inside the component tree.

**Decision:** Use Zustand 5 with vanilla stores. Socket.IO handlers call `useGameStore.getState()` directly.

**Consequences:**
- (+) State accessible anywhere (in/out of React)
- (+) Minimal boilerplate, no providers
- (+) Built-in `persist` middleware for auth
- (-) Less familiar to teams accustomed to Redux

---

## ADR-003: Socket.IO over raw WebSocket/ws

**Status:** Accepted  
**Date:** 2025-01-01  

**Context:** Need real-time bidirectional communication with rooms (game sessions), namespaces (game/market/lobby), auto-reconnection, and scalability via Redis adapter.

**Decision:** Use Socket.IO 4.8 with `@socket.io/redis-adapter` for multi-instance support.

**Consequences:**
- (+) Built-in rooms, namespaces, auto-reconnect
- (+) Redis adapter for horizontal scaling
- (+) Connection state recovery (2-minute window)
- (-) Slightly larger bundle than raw WS
- (-) Not compatible with plain WebSocket clients

---

## ADR-004: PostgreSQL + Prisma over MongoDB

**Status:** Accepted  
**Date:** 2025-01-01  

**Context:** Game data has clear relational structure (Users → Games → GamePlayers → TurnLogs). Need transactions for game state consistency.

**Decision:** PostgreSQL 16 with Prisma 6.1 ORM. JSON columns for flexible nested state (buffs, PnL history).

**Consequences:**
- (+) Strong relational integrity, ACID transactions
- (+) Prisma generates typed client from schema
- (+) JSON columns provide document-like flexibility where needed
- (-) Requires PostgreSQL instance in production

---

## ADR-005: Turn Pipeline Pattern

**Status:** Accepted  
**Date:** 2025-01-01  

**Context:** Turn processing involves 7 sequential stages with complex interdependencies. Need clear separation of concerns and testability.

**Decision:** Implement a pipeline pattern where each stage is an independent async function that receives/returns a `TurnContext`. Pipeline executor runs stages in order, supports halting.

**Consequences:**
- (+) Each stage is independently testable
- (+) Easy to add/remove/reorder stages
- (+) Halting mechanism for special cases (stun, win)
- (+) Context object provides full turn audit trail
- (-) Slightly more indirection than a single function

---

## ADR-006: VIX Simulation via Ornstein-Uhlenbeck Process

**Status:** Accepted  
**Date:** 2025-01-01  

**Context:** Need a realistic volatility index that mean-reverts (like real VIX) but is configurable for gameplay balance.

**Decision:** Implement a discrete Ornstein-Uhlenbeck process with configurable mean, speed, and volatility. Add 2% regime shift probability per tick for dramatic gameplay moments.

**Consequences:**
- (+) Mathematically grounded, realistic behavior
- (+) Configurable via env variables for tuning
- (+) Regime shifts create exciting gameplay events
- (-) Requires understanding of stochastic processes to tune

---

## ADR-007: MSW for Client-Side Mock API

**Status:** Accepted  
**Date:** 2025-01-01  

**Context:** Client development should not depend on a running server. Need realistic API responses for development, testing, and demos.

**Decision:** Use Mock Service Worker (MSW) 2.7 with browser integration. Activated via `VITE_MOCK_API=true` env variable.

**Consequences:**
- (+) Client works standalone without server
- (+) Same mock handlers for both dev and tests
- (+) Intercepts at network level (realistic)
- (-) WebSocket events not mocked by MSW (handled separately)

---

## ADR-008: Railway + Cloudflare Pages for Hosting

**Status:** Accepted  
**Date:** 2025-01-01  

**Context:** Need cost-efficient production hosting that separates server (Node.js + WebSocket) from client (static SPA).

**Decision:**
- Server: Railway (supports WebSockets, managed PostgreSQL add-on, Redis add-on)
- Client: Cloudflare Pages (free CDN, automatic builds)

**Consequences:**
- (+) Railway supports long-lived WebSocket connections
- (+) Cloudflare Pages is free for most usage, global CDN
- (+) Separation of concerns (API server vs. static hosting)
- (-) Two deployment targets to manage
- (-) Railway free tier has sleep behavior
