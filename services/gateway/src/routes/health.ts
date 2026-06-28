import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async (_req, reply) => {
    // Check Redis connectivity
    let redisStatus = 'ok';
    try {
      await app.redis.ping();
    } catch {
      redisStatus = 'error';
    }

    // Check Postgres connectivity
    let dbStatus = 'ok';
    try {
      await app.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    const healthy = redisStatus === 'ok' && dbStatus === 'ok';

    return reply.status(healthy ? 200 : 503).send({
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        redis: redisStatus,
        database: dbStatus,
      },
    });
  });
}
