# Operations Runbook

## Local Development

### Start Everything
```bash
docker compose up -d          # PostgreSQL + Redis
pnpm db:migrate               # Run migrations
pnpm db:seed                  # Seed sample data
pnpm dev                      # Start dev servers
```

### Reset Database
```bash
pnpm --filter @game/server exec prisma migrate reset --force
pnpm db:seed
```

### Run Tests
```bash
docker compose -f docker-compose.test.yml up -d   # Ephemeral test DB
pnpm test
docker compose -f docker-compose.test.yml down
```

### Full-Stack Docker
```bash
docker compose -f docker-compose.yml -f docker-compose.full.yml up --build
# Client: http://localhost:5173
# Server: http://localhost:3001
```

---

## Production Deployment

### Prerequisites
- Railway account with project created
- Cloudflare Pages project connected to repo
- GitHub Secrets configured:
  - `RAILWAY_TOKEN`
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

### Railway Environment Variables
```
NODE_ENV=production
PORT=3001
DATABASE_URL=<railway-postgres-url>
REDIS_URL=<railway-redis-url>
JWT_SECRET=<strong-random-secret>
VIX_TICK_MS=15000
VIX_VOLATILITY=0.5
VIX_MEAN=20
CORS_ORIGIN=https://snl-fo-client.pages.dev
```

### Deploy Manually
```bash
# Server
railway up

# Client
pnpm --filter @game/client build
npx wrangler pages deploy packages/client/dist --project-name snl-fo-client
```

### Deploy via CI
Push to `main` branch. GitHub Actions will:
1. Lint → Test → Build
2. Deploy server to Railway
3. Deploy client to Cloudflare Pages

---

## Monitoring & Debugging

### Health Checks
```bash
curl https://snl-server.up.railway.app/api/healthz
curl https://snl-server.up.railway.app/api/readyz
```

### Logs
- **Railway:** Dashboard → Deployments → Logs
- **Server:** Uses Pino structured JSON logging in production

### Common Issues

#### WebSocket Connection Fails
- Check CORS_ORIGIN includes the client domain
- Verify Railway supports WebSocket (TCP, not just HTTP)
- Check `transports: ['websocket', 'polling']` in client

#### Database Connection Error
- Verify DATABASE_URL is correct
- Check Railway PostgreSQL add-on is running
- Run `pnpm db:migrate` if migrations are pending

#### Redis Connection Error
- Verify REDIS_URL is correct
- Redis is optional for single-instance — server starts without it (falls back to in-memory adapter)

#### Prisma Client Not Generated
```bash
pnpm --filter @game/server exec prisma generate
```

#### Client Shows Blank Page
- Check browser console for errors
- Verify VITE_API_URL and VITE_WS_URL are set correctly for production
- Ensure Cloudflare Pages SPA routing is configured (falls back to index.html)

---

## Database Operations

### Prisma Studio (Visual DB Browser)
```bash
pnpm --filter @game/server exec prisma studio
```

### Create Migration
```bash
pnpm --filter @game/server exec prisma migrate dev --name <description>
```

### Deploy Migrations (Production)
```bash
pnpm --filter @game/server exec prisma migrate deploy
```

### Backup (Railway PostgreSQL)
```bash
pg_dump <DATABASE_URL> > backup_$(date +%Y%m%d).sql
```

---

## Performance Tuning

### VIX Simulation
- `VIX_TICK_MS`: Lower = more real-time feel, higher = less CPU. Default 15s.
- `VIX_VOLATILITY`: Higher = more dramatic swings. Default 0.5.
- `VIX_MEAN`: Long-term average VIX level. Default 20.

### Socket.IO
- Connection state recovery: 2 minutes (configurable in server index.ts)
- Redis adapter handles multi-instance. For single instance, Redis is optional.

### PostgreSQL
- Slow query logging enabled in dev (>100ms)
- Index on `Leaderboard.gamesWon` and `Game.status` for common queries
