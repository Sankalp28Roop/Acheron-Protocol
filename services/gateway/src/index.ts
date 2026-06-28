import Fastify from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart';
import compress from '@fastify/compress';
import helmet from '@fastify/helmet';

import { redisPlugin } from './plugins/redis.js';
import { socketPlugin } from './plugins/socket-io.js';
import { prismaPlugin } from './plugins/prisma.js';
import { rateLimiterPlugin } from './plugins/rate-limiter.js';
import { credentialsRoutes } from './routes/credentials.js';
import { emailWebhookRoutes } from './hooks/email-receiver.js';
import { smsWebhookRoutes } from './hooks/sms-receiver.js';
import { healthRoutes } from './routes/health.js';
import { simulatorRoutes } from './routes/simulator.js';
import { setupCleanupHooks } from './hooks/cleanup.js';

// ─── Build App ────────────────────────────────────────────────────────────────

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
      // SECURITY: Custom serialiser redacts message body content from all logs.
      // Raw SMS/email bodies NEVER reach disk or any log sink.
      serializers: {
        req(req) {
          return {
            method: req.method,
            url: req.url,
            hostname: req.hostname,
          };
        },
      },
    },
  });

  // ── Plugins ────────────────────────────────────────────────────────────────
  await app.register(cors, {
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','),
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Task 3: Native Defensive Security Headers Configuration
  // Enforce strict local isolation rules
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameSrc: ["'self'", "sandbox:"], // Strict guardrails for secure previewer iframe
        styleSrc: ["'self'", "'unsafe-inline'"], // Accommodates dynamic Tailwind state injection
      }
    }
  });

  // Task 1: Brotli In-Memory Compression Pipeline
  await app.register(compress, {
    global: true,
    encodings: ['br', 'gzip']
  });

  await app.register(formbody);
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });

  // Core service plugins
  await app.register(redisPlugin);
  await app.register(prismaPlugin);
  await app.register(socketPlugin);
  await app.register(rateLimiterPlugin);

  // ── Routes ─────────────────────────────────────────────────────────────────
  await app.register(healthRoutes);
  await app.register(credentialsRoutes, { prefix: '/api/v1' });
  await app.register(emailWebhookRoutes, { prefix: '/api/v1' });
  await app.register(smsWebhookRoutes, { prefix: '/api/v1' });
  await app.register(simulatorRoutes, { prefix: '/api/v1' });

  // ── Hooks ──────────────────────────────────────────────────────────────────
  await setupCleanupHooks(app);

  return app;
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function start() {
  const app = await buildApp();

  const port = Number(process.env.GATEWAY_PORT ?? 3001);
  const host = process.env.GATEWAY_HOST ?? '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info(`🛡️  CloakComms Gateway running on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
