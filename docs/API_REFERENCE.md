# API Reference

## Base URL

- **Local:** `http://localhost:3001/api`
- **Production:** `https://snl-server.up.railway.app/api`

## Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <jwt-token>
```

---

## Health

### `GET /api/healthz`
Liveness probe.

**Response:** `200 OK`
```json
{ "status": "ok" }
```

### `GET /api/readyz`
Readiness probe (checks DB connection).

**Response:** `200 OK`
```json
{ "status": "ok", "db": true }
```

---

## Auth

### `POST /api/auth/register`
Create a new account.

**Body:**
```json
{
  "email": "alice@example.com",
  "password": "password123",
  "displayName": "Alice"
}
```

**Response:** `201 Created`
```json
{
  "user": { "id": "...", "email": "...", "displayName": "...", "tier": "Apprentice" },
  "token": "<jwt>"
}
```

### `POST /api/auth/login`
Authenticate and get a token.

**Body:**
```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": { "id": "...", "email": "...", "displayName": "...", "tier": "MarketWarrior" },
  "token": "<jwt>"
}
```

### `GET /api/auth/me` 🔒
Get current user profile.

**Response:** `200 OK`
```json
{
  "user": { "id": "...", "email": "...", "displayName": "...", "tier": "..." }
}
```

---

## Games

### `POST /api/games` 🔒
Create a new game.

**Body:**
```json
{ "mode": "single" | "multiplayer" }
```

**Response:** `201 Created`
```json
{
  "game": { "id": "...", "mode": "single", "status": "waiting", ... }
}
```

### `GET /api/games` 🔒
List games with optional filtering.

**Query Parameters:**
- `status` — Filter by status: `waiting`, `in_progress`, `finished`
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "games": [...],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

### `GET /api/games/:id` 🔒
Get game details with players and recent turns.

### `GET /api/games/:id/history` 🔒
Get full turn history for a game.

---

## Players

### `GET /api/players/me/stats` 🔒
Get current player's statistics.

**Response:** `200 OK`
```json
{
  "leaderboard": {
    "gamesPlayed": 42,
    "gamesWon": 18,
    "highestCapital": 250000,
    "longestStreak": 7,
    "totalCapitalEarned": 1200000
  },
  "activeGames": 1
}
```

### `GET /api/players/leaderboard`
Get global leaderboard.

**Query Parameters:**
- `sortBy` — `gamesWon`, `highestCapital`, `totalCapitalEarned` (default: `gamesWon`)
- `limit` — Max entries (default: 50)

---

## Subscription

### `GET /api/subscription/tiers`
List available subscription tiers.

### `GET /api/subscription/me` 🔒
Get current subscription status.

### `POST /api/subscription/upgrade` 🔒
Upgrade subscription tier.

**Body:**
```json
{ "tier": "MarketWarrior" }
```

---

## WebSocket Events

### Namespace: `/game`

**Client → Server:**
| Event | Payload | Description |
|---|---|---|
| `game:setView` | `{ view: MarketView }` | Set market view for current turn |
| `game:setConviction` | `{ level: 1-5 }` | Set conviction level |
| `game:rollDice` | `{}` | Execute dice roll & turn |
| `game:rejoin` | `{ gameId: string }` | Rejoin an in-progress game |

**Server → Client:**
| Event | Payload | Description |
|---|---|---|
| `game:started` | `GameStateSnapshot` | Game has begun |
| `game:turnResult` | `TurnResult` | Result of a turn |
| `game:ended` | `{ winnerId, finalSnapshot }` | Game finished |
| `game:playerJoined` | `{ playerId, displayName }` | Player joined game |
| `game:playerLeft` | `{ playerId, displayName }` | Player left game |
| `game:error` | `{ message }` | Error occurred |

### Namespace: `/market`

**Client → Server:**
| Event | Payload | Description |
|---|---|---|
| `market:subscribe` | `{}` | Subscribe to VIX feed |

**Server → Client:**
| Event | Payload | Description |
|---|---|---|
| `market:vixUpdate` | `VIXLevel` | VIX tick update |
| `market:questsAvailable` | `DailyQuest[]` | New quests available |
| `market:questCompleted` | `DailyQuest` | Quest completed |

### Namespace: `/lobby`

**Client → Server:**
| Event | Payload | Description |
|---|---|---|
| `lobby:createRoom` | `{ name, maxPlayers, isPrivate }` | Create a room |
| `lobby:joinRoom` | `{ roomId }` | Join a room |
| `lobby:leaveRoom` | `{ roomId }` | Leave a room |
| `lobby:addBot` | `{ roomId, difficulty }` | Add bot to room |
| `lobby:startGame` | `{ roomId }` | Start the game |
| `lobby:listRooms` | `{}` | List all open rooms |

**Server → Client:**
| Event | Payload | Description |
|---|---|---|
| `lobby:roomList` | `LobbyRoomInfo[]` | All available rooms |
| `lobby:roomCreated` | `LobbyRoomInfo` | New room created |
| `lobby:roomUpdated` | `LobbyRoomInfo` | Room updated |
| `lobby:roomRemoved` | `{ roomId }` | Room removed |
| `lobby:playerJoined` | `{ roomId, player }` | Player joined room |
| `lobby:playerLeft` | `{ roomId, playerId, displayName }` | Player left room |
| `lobby:gameStarting` | `{ gameId }` | Game starting |
| `lobby:error` | `{ message }` | Error |
