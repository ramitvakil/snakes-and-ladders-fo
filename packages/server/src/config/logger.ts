import pino from 'pino';
import { env } from './env.js';

const isDev = env.NODE_ENV === 'development';

export const logger = pino({
  level: env.LOG_LEVEL,
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        // Structured JSON in production
        formatters: {
          level: (label: string) => ({ level: label }),
          bindings: (bindings: pino.Bindings) => ({
            host: bindings.hostname,
            pid: bindings.pid,
          }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }),
});

export type Logger = typeof logger;

export function createChildLogger(name: string) {
  return logger.child({ module: name });
}
