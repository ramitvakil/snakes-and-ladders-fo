import { http, HttpResponse, delay } from 'msw';
import { SubscriptionTier } from '@game/shared';

const BASE = '/api';

// ── In-memory mock data ──
let currentUser = {
  id: 'user-1',
  email: 'alice@demo.com',
  displayName: 'Alice',
  tier: SubscriptionTier.MarketWarrior,
  createdAt: new Date().toISOString(),
};

const mockLeaderboard = [
  { userId: 'user-1', displayName: 'Alice', gamesPlayed: 42, gamesWon: 18, highestCapital: 250000, longestStreak: 7, totalCapitalEarned: 1200000 },
  { userId: 'user-2', displayName: 'Bob', gamesPlayed: 35, gamesWon: 12, highestCapital: 180000, longestStreak: 5, totalCapitalEarned: 850000 },
  { userId: 'user-3', displayName: 'Charlie', gamesPlayed: 28, gamesWon: 15, highestCapital: 310000, longestStreak: 9, totalCapitalEarned: 1450000 },
  { userId: 'user-4', displayName: 'Diana', gamesPlayed: 50, gamesWon: 22, highestCapital: 420000, longestStreak: 11, totalCapitalEarned: 2100000 },
  { userId: 'user-5', displayName: 'Eve', gamesPlayed: 19, gamesWon: 8, highestCapital: 150000, longestStreak: 4, totalCapitalEarned: 600000 },
];

const mockGames = [
  {
    id: 'game-1',
    mode: 'multiplayer' as const,
    status: 'in_progress' as const,
    currentTurn: 12,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    players: [
      { id: 'user-1', displayName: 'Alice', capital: 105000, position: 34, isBot: false },
      { id: 'user-2', displayName: 'Bob', capital: 92000, position: 28, isBot: false },
    ],
  },
  {
    id: 'game-2',
    mode: 'single' as const,
    status: 'finished' as const,
    currentTurn: 45,
    winnerId: 'user-1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    players: [
      { id: 'user-1', displayName: 'Alice', capital: 200000, position: 100, isBot: false },
      { id: 'bot-1', displayName: 'Bot (Adaptive)', capital: 45000, position: 67, isBot: true },
    ],
  },
];

// ── Mock JWT ──
const MOCK_TOKEN = 'mock-jwt-token.eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ1c2VyLTEiLCJlbWFpbCI6ImFsaWNlQGRlbW8uY29tIiwiZGlzcGxheU5hbWUiOiJBbGljZSIsInRpZXIiOiJNYXJrZXRXYXJyaW9yIn0.mock-signature';

// ── Handlers ──
export const handlers = [
  // ── Auth ──
  http.post(`${BASE}/auth/register`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { email: string; displayName: string; password: string };
    currentUser = {
      id: `user-${Date.now()}`,
      email: body.email,
      displayName: body.displayName,
      tier: SubscriptionTier.Apprentice,
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json({ user: currentUser, token: MOCK_TOKEN });
  }),

  http.post(`${BASE}/auth/login`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { email: string; password: string };
    currentUser = { ...currentUser, email: body.email };
    return HttpResponse.json({ user: currentUser, token: MOCK_TOKEN });
  }),

  http.get(`${BASE}/auth/me`, async () => {
    await delay(100);
    return HttpResponse.json({ user: currentUser });
  }),

  // ── Games ──
  http.get(`${BASE}/games`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    let games = mockGames;
    if (status) {
      games = games.filter((g) => g.status === status);
    }
    return HttpResponse.json({ games, total: games.length, page: 1, limit: 20 });
  }),

  http.get(`${BASE}/games/:id`, async ({ params }) => {
    await delay(150);
    const game = mockGames.find((g) => g.id === params.id);
    if (!game) return HttpResponse.json({ error: 'Game not found' }, { status: 404 });
    return HttpResponse.json({ game });
  }),

  http.post(`${BASE}/games`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { mode: string };
    const newGame = {
      id: `game-${Date.now()}`,
      mode: body.mode,
      status: 'waiting' as const,
      currentTurn: 0,
      createdAt: new Date().toISOString(),
      players: [{ id: currentUser.id, displayName: currentUser.displayName, capital: 100000, position: 1, isBot: false }],
    };
    return HttpResponse.json({ game: newGame }, { status: 201 });
  }),

  http.get(`${BASE}/games/:id/history`, async () => {
    await delay(200);
    return HttpResponse.json({
      turns: Array.from({ length: 10 }, (_, i) => ({
        id: `turn-${i}`,
        turnNumber: i + 1,
        playerId: i % 2 === 0 ? 'user-1' : 'user-2',
        command: { diceRoll: Math.ceil(Math.random() * 6) },
        result: { capitalDelta: Math.floor(Math.random() * 10000 - 3000), newPosition: Math.min(100, Math.floor(Math.random() * 100) + 1) },
      })),
    });
  }),

  // ── Players ──
  http.get(`${BASE}/players/me/stats`, async () => {
    await delay(200);
    return HttpResponse.json({
      leaderboard: mockLeaderboard[0],
      activeGames: mockGames.filter((g) => g.status === 'in_progress').length,
    });
  }),

  http.get(`${BASE}/players/leaderboard`, async () => {
    await delay(200);
    return HttpResponse.json({ leaderboard: mockLeaderboard, total: mockLeaderboard.length });
  }),

  // ── Subscription ──
  http.get(`${BASE}/subscription/tiers`, async () => {
    await delay(100);
    return HttpResponse.json({
      tiers: [
        { tier: SubscriptionTier.Apprentice, price: 0, features: ['5 games/day', 'Basic board', 'Single quests'] },
        { tier: SubscriptionTier.MarketWarrior, price: 299, features: ['Unlimited games', 'Custom boards', 'Multi-quests', 'Detailed PnL'] },
        { tier: SubscriptionTier.BillionaireGuild, price: 999, features: ['Everything in Warrior', 'Tournament access', 'Exclusive tiles', 'Priority matchmaking', 'Custom avatars'] },
      ],
    });
  }),

  http.get(`${BASE}/subscription/me`, async () => {
    await delay(100);
    return HttpResponse.json({ tier: currentUser.tier, features: ['Unlimited games', 'Custom boards', 'Multi-quests', 'Detailed PnL'] });
  }),

  http.post(`${BASE}/subscription/upgrade`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { tier: SubscriptionTier };
    currentUser = { ...currentUser, tier: body.tier };
    return HttpResponse.json({ user: currentUser, message: `Upgraded to ${body.tier}` });
  }),

  // ── Health ──
  http.get(`${BASE}/healthz`, () => HttpResponse.json({ status: 'ok' })),
  http.get(`${BASE}/readyz`, () => HttpResponse.json({ status: 'ok', db: true })),
];
