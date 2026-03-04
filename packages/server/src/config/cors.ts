import type { CorsOptions } from 'cors';
import { env } from './env.js';

export function getCorsOptions(): CorsOptions {
  const origins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, healthchecks)
      if (!origin) {
        callback(null, true);
        return;
      }
      if (origins.includes('*') || origins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    maxAge: 86400, // 24h preflight cache
  };
}
