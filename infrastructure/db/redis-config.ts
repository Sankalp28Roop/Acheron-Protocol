import { createClient, type RedisClientType } from 'redis';

// ─── Connection Factory ────────────────────────────────────────────────────────

let _client: RedisClientType | null = null;

/**
 * Returns a singleton Redis client. Creates and connects on first call.
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (_client && _client.isReady) return _client;

  const client = createClient({
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    },
  }) as RedisClientType;

  client.on('error', (err) => {
    console.error('[Redis] Client error:', err.message);
  });

  await client.connect();
  _client = client;
  return client;
}

// ─── TTL Manager Helpers ──────────────────────────────────────────────────────

/**
 * Key patterns for Redis data structures.
 */
export const RedisKeys = {
  credential: (value: string) => `credential:${value}`,
  messages: (value: string) => `messages:${value}`,
  rateLimit: (ip: string) => `ratelimit:${ip}`,
} as const;

export interface CredentialRedisEntry {
  userId: string;
  credId: string;
  type: 'EMAIL' | 'SMS';
  expiresAt: string; // ISO string
}

/**
 * Registers a credential in Redis with an explicit TTL.
 * Sets both the credential index hash and initialises the messages list expiry.
 */
export async function registerCredential(
  redis: RedisClientType,
  value: string,
  entry: CredentialRedisEntry,
  ttlSeconds: number,
): Promise<void> {
  const credKey = RedisKeys.credential(value);
  const msgKey = RedisKeys.messages(value);

  // Store ownership hash
  await redis.hSet(credKey, {
    userId: entry.userId,
    credId: entry.credId,
    type: entry.type,
    expiresAt: entry.expiresAt,
  });
  await redis.expire(credKey, ttlSeconds);

  // Pre-seed the messages list key with a sentinel so EXPIREAT can be set
  // The actual list is populated by inbound webhook handlers
  await redis.expire(msgKey, ttlSeconds);
}

/**
 * Checks whether a credential is still active (Redis key exists).
 */
export async function isCredentialActive(
  redis: RedisClientType,
  value: string,
): Promise<boolean> {
  return (await redis.exists(RedisKeys.credential(value))) === 1;
}

/**
 * Fetches the credential entry from Redis.
 */
export async function getCredentialEntry(
  redis: RedisClientType,
  value: string,
): Promise<CredentialRedisEntry | null> {
  const data = await redis.hGetAll(RedisKeys.credential(value));
  if (!data.userId) return null;
  return data as unknown as CredentialRedisEntry;
}

/**
 * Pushes an inbound message to the ephemeral list and syncs its TTL
 * to match the parent credential's remaining TTL.
 */
export async function pushMessage(
  redis: RedisClientType,
  value: string,
  message: Record<string, unknown>,
): Promise<void> {
  const msgKey = RedisKeys.messages(value);
  const credKey = RedisKeys.credential(value);

  // Get remaining TTL from the credential key to sync message list
  const remainingTtl = await redis.ttl(credKey);
  if (remainingTtl <= 0) {
    // Credential expired — do not push
    return;
  }

  await redis.lPush(msgKey, JSON.stringify({ ...message, ts: Date.now() }));
  // Keep the message list capped at 100 messages per credential
  await redis.lTrim(msgKey, 0, 99);
  // Sync expiry with parent credential
  await redis.expire(msgKey, remainingTtl);
}

/**
 * Retrieves cached messages for a credential (most-recent first).
 */
export async function getMessages(
  redis: RedisClientType,
  value: string,
  limit = 50,
): Promise<Record<string, unknown>[]> {
  const raw = await redis.lRange(RedisKeys.messages(value), 0, limit - 1);
  return raw.map((item) => {
    try {
      return JSON.parse(item);
    } catch {
      return { raw: item };
    }
  });
}

/**
 * Deletes all Redis keys associated with a credential (teardown).
 */
export async function teardownCredential(
  redis: RedisClientType,
  value: string,
): Promise<void> {
  await redis.del(RedisKeys.credential(value), RedisKeys.messages(value));
}

// ─── Token Bucket Rate Limiter ────────────────────────────────────────────────

/**
 * Checks and decrements the rate limit bucket for a given IP.
 * Returns true if the request is allowed, false if rate-limited.
 *
 * Token bucket: 60 tokens / 60 seconds per IP.
 */
export async function checkRateLimit(
  redis: RedisClientType,
  ip: string,
  maxTokens = 60,
  windowSeconds = 60,
): Promise<{ allowed: boolean; remaining: number }> {
  const key = RedisKeys.rateLimit(ip);

  // Use a Lua script for atomic check-and-decrement
  const luaScript = `
    local current = redis.call('GET', KEYS[1])
    if current == false then
      redis.call('SET', KEYS[1], ARGV[1] - 1, 'EX', ARGV[2])
      return ARGV[1] - 1
    end
    local count = tonumber(current)
    if count <= 0 then
      return -1
    end
    redis.call('DECR', KEYS[1])
    return count - 1
  `;

  const result = await redis.eval(luaScript, {
    keys: [key],
    arguments: [String(maxTokens), String(windowSeconds)],
  });

  const remaining = Number(result);
  return { allowed: remaining >= 0, remaining: Math.max(0, remaining) };
}
