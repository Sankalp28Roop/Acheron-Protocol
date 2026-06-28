import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { extractEmailToken, sanitizeHtml, stripHtml } from '../../lib/content-sanitizer.js';
import { isCredentialActive, pushMessage } from '../../lib/redis-ttl-manager.js';
import { isSenderBlocked } from '../../lib/sender-filter.js';
import { safeEmailLog } from '../../lib/log-sanitizer.js';

// ─── Inbound Email Webhook ────────────────────────────────────────────────────

export async function emailWebhookRoutes(app: FastifyInstance) {
  /**
   * POST /api/v1/webhooks/email/inbound
   *
   * Mailgun catch-all inbound route. Receives email metadata + body via
   * multipart form-data (Mailgun's `store()` + forward webhook format).
   *
   * Processing pipeline:
   * 1. Parse recipient address → extract credential token
   * 2. Validate credential is active (Redis HEXISTS)
   * 3. Check sender against block list → silent drop if blocked
   * 4. Sanitise HTML with DOMPurify
   * 5. Cache message in Redis (TTL-synced)
   * 6. Broadcast via Socket.io to credential room
   */
  app.post('/webhooks/email/inbound', async (req: FastifyRequest, reply: FastifyReply) => {
    // Mailgun sends multipart form-data; fastify-multipart parses fields
    const body = req.body as Record<string, string>;

    const recipient = body['recipient'] ?? body['To'] ?? '';
    const sender = body['sender'] ?? body['From'] ?? '';
    const htmlBody = body['body-html'] ?? body['html'] ?? '';
    const textBody = body['body-plain'] ?? body['text'] ?? '';
    const subject = body['subject'] ?? body['Subject'] ?? '(no subject)';

    // Extract credential token from recipient address
    const token = extractEmailToken(recipient);
    if (!token) {
      app.log.warn({ recipient }, 'Email webhook: malformed recipient address');
      // Return 200 so Mailgun does not retry
      return reply.status(200).send({ ok: false, reason: 'malformed_recipient' });
    }

    const credentialValue = `${token}@${process.env.EMAIL_DOMAIN ?? 'cloak.mail'}`;

    // Check if credential is still active in Redis
    const active = await isCredentialActive(app.redis, credentialValue);
    if (!active) {
      app.log.info({ credentialValue }, 'Email webhook: credential expired or not found');
      return reply.status(200).send({ ok: false, reason: 'credential_expired' });
    }

    // Silent drop for blocked senders
    if (isSenderBlocked(sender)) {
      app.log.info({ sender: '[BLOCKED_SENDER]' }, 'Email webhook: sender blocked — dropped');
      return reply.status(200).send({ ok: true, reason: 'dropped' });
    }

    // Sanitise content
    const safeHtml = sanitizeHtml(htmlBody || textBody);
    const plainText = stripHtml(htmlBody || textBody);

    // Build message payload (safe for client broadcast)
    const messagePayload = {
      type: 'EMAIL' as const,
      subject,
      sender,
      html: safeHtml,
      text: plainText,
      receivedAt: new Date().toISOString(),
    };

    // Cache in Redis (TTL-synced to credential)
    await pushMessage(app.redis, credentialValue, messagePayload);

    // Real-time broadcast to all clients subscribed to this credential
    // @ts-expect-error – fastify-socket.io runtime decoration
    app.io.to(credentialValue).emit('new_message', messagePayload);

    // SECURITY: Log metadata only — NO content in log output
    app.log.info(safeEmailLog({ recipient, sender, credentialValue }));

    return reply.status(200).send({ ok: true });
  });

  /**
   * GET /api/v1/webhooks/email/messages/:credentialValue
   *
   * Returns cached messages for a credential (initial inbox load).
   * Used by the frontend on credential selection before Socket.io kicks in.
   */
  app.get('/webhooks/email/messages/:credentialValue', async (req: FastifyRequest, reply: FastifyReply) => {
    const { credentialValue } = req.params as { credentialValue: string };
    const { getMessages } = await import('../../lib/redis-ttl-manager.js');
    const messages = await getMessages(app.redis, credentialValue);
    return reply.send({ messages });
  });
}
