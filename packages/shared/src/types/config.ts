import { z } from 'zod';

// ─── Config Schema (shared between client and server) ──────

export const ServerConfigSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().optional().default(''),

  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  VIX_TICK_MS: z.coerce.number().min(500).default(15000),
  VIX_VOLATILITY: z.coerce.number().default(0.5),
  VIX_MEAN: z.coerce.number().default(20),

  DEMO_MODE: z.preprocess(
    (val) => val === 'true' || val === '1' || val === true,
    z.boolean(),
  ).default(false),

  DEV_TIER_OVERRIDE: z.string().optional(),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

export const ClientConfigSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:3001'),
  VITE_WS_URL: z.string().url().default('http://localhost:3001'),
});

export type ClientConfig = z.infer<typeof ClientConfigSchema>;
