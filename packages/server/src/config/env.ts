import { ServerConfigSchema } from '@game/shared';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
// Also try local .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function loadEnv() {
  const raw = {
    PORT: Number(process.env.PORT ?? 3001),
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/fno_game?schema=public',
    REDIS_URL: process.env.REDIS_URL ?? '',
    JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    VIX_TICK_MS: Number(process.env.VIX_TICK_MS ?? 15000),
    VIX_VOLATILITY: Number(process.env.VIX_VOLATILITY ?? 0.5),
    VIX_MEAN: Number(process.env.VIX_MEAN ?? 20),
    DEMO_MODE: process.env.DEMO_MODE === 'true',
    LOG_LEVEL: process.env.LOG_LEVEL ?? 'debug',
    DEV_TIER_OVERRIDE: process.env.DEV_TIER_OVERRIDE || undefined,
  };

  const result = ServerConfigSchema.safeParse(raw);

  if (!result.success) {
    console.error('❌ Invalid environment configuration:');
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();

export type Env = typeof env;
