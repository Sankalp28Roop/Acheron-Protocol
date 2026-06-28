import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { checkRateLimit } from '../../../../infrastructure/db/redis-config.js';

export const rateLimiterPlugin = fp(async (app: FastifyInstance) => {
  const maxTokens = Number(process.env.RATE_LIMIT_MAX ?? 60);

  app.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
    // Only apply rate limiting to /api/v1/* routes
    if (!req.url.startsWith('/api/v1/')) return;

    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      'unknown';

    const { allowed, remaining } = await checkRateLimit(app.redis, ip, maxTokens);

    reply.header('X-RateLimit-Limit', maxTokens);
    reply.header('X-RateLimit-Remaining', remaining);

    if (!allowed) {
      app.log.warn({ ip }, 'Rate limit exceeded');
      await reply.status(429).send({
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please slow down.',
      });
    }
  });

  app.log.info(`✅ Rate limiter active (${maxTokens} req/min per IP)`);
});
