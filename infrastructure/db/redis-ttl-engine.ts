import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

/**
 * Stores a credential in Redis with a strict native EX expiration boundary.
 */
export async function cacheCredential(id: string, value: string, ttlSeconds: number) {
  // Store the mapping from ID -> Value
  await redisClient.set(`credential:${id}`, value, {
    EX: ttlSeconds,
  });
  
  // Store the mapping from Value -> ID (for reverse lookups on inbound webhooks)
  await redisClient.set(`value:${value}`, id, {
    EX: ttlSeconds,
  });
}

/**
 * Validates if a credential value still exists (has not expired).
 */
export async function validateCredentialExistence(value: string): Promise<boolean> {
  const exists = await redisClient.exists(`value:${value}`);
  return exists === 1;
}

/**
 * Revokes a credential immediately before its natural TTL.
 */
export async function revokeCredential(id: string) {
  const value = await redisClient.get(`credential:${id}`);
  if (value) {
    await redisClient.del(`value:${value}`);
  }
  await redisClient.del(`credential:${id}`);
}
