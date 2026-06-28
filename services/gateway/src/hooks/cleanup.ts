import type { FastifyInstance } from 'fastify';

/**
 * Subscribes to Redis Keyspace Notifications (KEA) to capture key expirations
 * automatically and perform necessary cleanup.
 */
export async function setupCleanupHooks(app: FastifyInstance) {
  // We need a dedicated Redis client for subscribing since a subscribed client
  // cannot execute regular commands.
  const subscriber = app.redis.duplicate();
  await subscriber.connect();

  // Subscribe to keyspace events for expired keys
  // Configured in docker-compose as --notify-keyspace-events KEA
  const dbIndex = 0; // Default DB
  const channel = `__keyevent@${dbIndex}__:expired`;

  await subscriber.subscribe(channel, async (key) => {
    app.log.info({ key }, 'Cleanup Hook: Received Redis expiration event');

    if (key.startsWith('credential:')) {
      const id = key.replace('credential:', '');
      app.log.info({ id }, 'Cleanup Hook: Automatically cleaning up credential metadata');
      
      // We could clean up associated Postgres data here if needed,
      // but Postgres can also be managed by periodic cron or cascade deletes.
      // Since privacy policy is zero-retention, let's remove from DB immediately.
      try {
        await app.prisma.activeCredential.delete({
          where: { id },
        });
        app.log.info({ id }, 'Cleanup Hook: Removed expired credential from PostgreSQL');
      } catch (err) {
        // If it was already deleted or not found, ignore
        app.log.debug({ id }, 'Cleanup Hook: Credential not found in PostgreSQL during cleanup');
      }
    }
    
    if (key.startsWith('value:')) {
      const value = key.replace('value:', '');
      app.log.info({ value }, 'Cleanup Hook: Alerting connected clients via Socket.io');
      
      // Emit expiration event to the credential room
      // @ts-expect-error – fastify-socket.io runtime decoration
      app.io.to(value).emit('credential_expired', { value });
    }
  });

  app.log.info('🛡️ Cleanup Hooks initialized for Redis expiration events');
}
