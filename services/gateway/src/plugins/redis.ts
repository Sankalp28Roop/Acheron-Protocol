import fp from 'fastify-plugin';
import { createClient, type RedisClientType } from 'redis';
import type { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    redis: RedisClientType;
  }
}

export const redisPlugin = fp(async (app: FastifyInstance) => {
  const client = createClient({
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    },
  }) as RedisClientType;

  client.on('error', (err: Error) => {
    app.log.error({ msg: 'Redis client error', error: err.message });
  });

  await client.connect();
  app.log.info('✅ Redis connected');

  app.decorate('redis', client);

  app.addHook('onClose', async () => {
    await client.quit();
    app.log.info('Redis connection closed');
  });
});
