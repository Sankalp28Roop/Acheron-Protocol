import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { generateEmailAddress, generateToken } from '../lib/content-sanitizer.js';
import {
  leasePhoneNumber,
  generateMockPhoneNumber,
  isTwilioConfigured,
} from '../lib/twilio-client.js';
import { registerCredential } from '../lib/redis-ttl-manager.js';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const createCredentialSchema = z.object({
  type: z.enum(['EMAIL', 'SMS']),
  ttlSeconds: z
    .number()
    .int()
    .min(Number(process.env.MIN_TTL_SECONDS ?? 300))
    .max(Number(process.env.MAX_TTL_SECONDS ?? 86400)),
  sessionToken: z.string().min(10).max(128),
  region: z.enum(['IN', 'UK', 'US']).default('IN'),
});

// ─── Route Registration ───────────────────────────────────────────────────────

export async function credentialsRoutes(app: FastifyInstance) {
  // ── POST /api/v1/credentials ───────────────────────────────────────────────
  // Generate a new disposable credential (email address or SMS number)
  app.post('/credentials', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = createCredentialSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', details: parsed.error.flatten() });
    }

    const { type, ttlSeconds, sessionToken, region } = parsed.data;

    // Resolve or create user from session token
    const user = await app.prisma.user.upsert({
      where: { sessionToken },
      update: {},
      create: { sessionToken, tier: 'FREE' },
    });

    // Enforce free tier limit
    const activeCount = await app.prisma.activeCredential.count({
      where: { userId: user.id, expiresAt: { gt: new Date() } },
    });
    const maxCredentials = Number(process.env.FREE_TIER_MAX_CREDENTIALS ?? 3);
    if (user.tier === 'FREE' && activeCount >= maxCredentials) {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Limit Reached',
        message: `Free tier allows up to ${maxCredentials} active credentials.`,
      });
    }

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    let value: string;
    let twilioSid: string | undefined;

    if (type === 'EMAIL') {
      value = generateEmailAddress();
    } else {
      // SMS: lease a Twilio number (or generate a mock if not configured)
      const webhookBase =
        process.env.GATEWAY_PUBLIC_URL ?? `http://localhost:${process.env.GATEWAY_PORT ?? 3001}`;

      if (isTwilioConfigured()) {
        const leased = await leasePhoneNumber(webhookBase, region);
        value = leased.phoneNumber;
        twilioSid = leased.sid;
      } else {
        app.log.warn('Twilio not configured — using mock phone number for development');
        const mock = generateMockPhoneNumber(region);
        value = mock.phoneNumber;
        twilioSid = mock.sid;
      }
    }

    // Persist to Postgres
    const credential = await app.prisma.activeCredential.create({
      data: {
        userId: user.id,
        type,
        value,
        twilioSid: twilioSid ?? null,
        ttlSeconds,
        expiresAt,
      },
    });

    // Register in Redis with TTL
    await registerCredential(
      app.redis,
      value,
      {
        userId: user.id,
        credId: credential.id,
        type,
        expiresAt: expiresAt.toISOString(),
      },
      ttlSeconds,
    );

    app.log.info({ credId: credential.id, type, ttlSeconds }, 'Credential created');

    return reply.status(201).send({
      id: credential.id,
      type,
      value,
      expiresAt: expiresAt.toISOString(),
      ttlSeconds,
      createdAt: credential.createdAt.toISOString(),
    });
  });

  // ── GET /api/v1/credentials ────────────────────────────────────────────────
  // List active credentials for a session
  app.get('/credentials', async (req: FastifyRequest, reply: FastifyReply) => {
    const sessionToken = (req.query as Record<string, string>)['sessionToken'];
    if (!sessionToken) {
      return reply.status(400).send({ statusCode: 400, error: 'Missing sessionToken query param' });
    }

    const user = await app.prisma.user.findUnique({ where: { sessionToken } });
    if (!user) return reply.send({ credentials: [] });

    const credentials = await app.prisma.activeCredential.findMany({
      where: { userId: user.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({
      credentials: credentials.map((c) => ({
        id: c.id,
        type: c.type,
        value: c.value,
        expiresAt: c.expiresAt.toISOString(),
        ttlSeconds: c.ttlSeconds,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  });

  // ── DELETE /api/v1/credentials/:id ────────────────────────────────────────
  // Manually revoke a credential before its TTL expires
  app.delete('/credentials/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const sessionToken = (req.query as Record<string, string>)['sessionToken'];

    if (!sessionToken) {
      return reply.status(400).send({ error: 'Missing sessionToken' });
    }

    const user = await app.prisma.user.findUnique({ where: { sessionToken } });
    if (!user) return reply.status(404).send({ error: 'Session not found' });

    const credential = await app.prisma.activeCredential.findFirst({
      where: { id, userId: user.id },
    });

    if (!credential) return reply.status(404).send({ error: 'Credential not found' });

    // Release Twilio number if SMS
    if (credential.type === 'SMS' && credential.twilioSid && !credential.twilioSid.startsWith('MOCK_')) {
      try {
        const { releasePhoneNumber } = await import('../lib/twilio-client.js');
        await releasePhoneNumber(credential.twilioSid);
      } catch (err) {
        app.log.error({ err }, 'Failed to release Twilio number on manual revoke');
      }
    }

    // Remove from Redis (immediate)
    await app.redis.del(`credential:${credential.value}`);
    await app.redis.del(`messages:${credential.value}`);

    // Mark expired in Postgres
    await app.prisma.activeCredential.update({
      where: { id },
      data: { expiresAt: new Date() },
    });

    app.log.info({ credId: id }, 'Credential manually revoked');
    return reply.status(204).send();
  });
}
