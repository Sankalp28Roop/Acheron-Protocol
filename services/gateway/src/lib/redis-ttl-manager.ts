/**
 * Redis TTL Manager
 *
 * Gateway-layer wrapper around the shared redis-config utilities.
 * Also contains the keyspace notification subscriber that triggers
 * automated Twilio number teardown when credentials expire.
 */

import type { RedisClientType } from 'redis';
import { createClient } from 'redis';
import {
  registerCredential,
  isCredentialActive,
  getCredentialEntry,
  pushMessage,
  getMessages,
  teardownCredential,
  type CredentialRedisEntry,
} from '../../../../infrastructure/db/redis-config.js';
import { releasePhoneNumber } from './twilio-client.js';

// Re-export shared utilities for convenience
export {
  registerCredential,
  isCredentialActive,
  getCredentialEntry,
  pushMessage,
  getMessages,
  teardownCredential,
  type CredentialRedisEntry,
};

// ─── Keyspace Notification Subscriber ────────────────────────────────────────

/**
 * Starts a dedicated Redis subscriber client that listens for keyspace
 * expiry events on `credential:*` keys.
 *
 * When a credential key expires, this handler:
 * 1. Looks up the SID in Postgres (passed via the teardown callback)
 * 2. Releases the Twilio number (if SMS type)
 * 3. Cleans up any residual Redis keys
 *
 * NOTE: Uses a SEPARATE client because a subscribed Redis connection
 * cannot issue regular commands.
 */
export async function startTeardownSubscriber(
  mainRedis: RedisClientType,
  options: {
    onTeardown: (credentialValue: string) => Promise<void>;
  },
): Promise<() => Promise<void>> {
  const subClient = createClient({
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  }) as RedisClientType;

  await subClient.connect();

  // Subscribe to keyspace events for all key expirations on db 0
  // Redis must have `notify-keyspace-events KEA` configured (see docker-compose)
  await subClient.subscribe('__keyevent@0__:expired', async (key: string) => {
    if (!key.startsWith('credential:')) return;

    const credentialValue = key.replace('credential:', '');
    console.log(`[TTL] Credential expired: ${credentialValue}`);

    try {
      await options.onTeardown(credentialValue);
    } catch (err) {
      console.error(`[TTL] Teardown error for ${credentialValue}:`, err);
    }
  });

  // Return a cleanup function
  return async () => {
    await subClient.unsubscribe();
    await subClient.quit();
  };
}

/**
 * Default teardown handler: releases Twilio number if the credential was SMS.
 */
export async function defaultTeardownHandler(
  credentialValue: string,
  twilioSid: string | null | undefined,
): Promise<void> {
  if (twilioSid && !twilioSid.startsWith('MOCK_')) {
    try {
      await releasePhoneNumber(twilioSid);
      console.log(`[TTL] Released Twilio number: ${credentialValue} (SID: ${twilioSid})`);
    } catch (err) {
      console.error(`[TTL] Failed to release Twilio number ${twilioSid}:`, err);
    }
  }
}
