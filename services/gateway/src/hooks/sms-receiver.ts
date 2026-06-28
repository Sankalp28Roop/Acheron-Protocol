import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { validateTwilioSignature } from '../../lib/twilio-client.js';
import { isCredentialActive } from '../../lib/redis-ttl-manager.js';
import { isSenderBlocked } from '../../lib/sender-filter.js';
import { safeSmsLog } from '../../lib/log-sanitizer.js';
import { extractOTP } from '../../lib/otp-extractor.js';

// ─── Inbound SMS Webhook (Twilio) ─────────────────────────────────────────────

export async function smsWebhookRoutes(app: FastifyInstance) {
  /**
   * POST /api/v1/webhooks/sms/twilio
   *
   * Twilio inbound SMS webhook. Twilio sends POST with URL-encoded form body.
   *
   * Processing pipeline:
   * 1. Validate X-Twilio-Signature header (reject spoofed payloads)
   * 2. Look up `To` number in Redis credential index
   * 3. Check sender (`From`) against block list → silent drop
   * 4. Push plaintext message to Redis messages list
   * 5. Broadcast via Socket.io to credential room
   */
  app.post('/webhooks/sms/twilio', async (req: FastifyRequest, reply: FastifyReply) => {
    // ── Twilio Signature Verification ────────────────────────────────────────
    const twilioSignature = req.headers['x-twilio-signature'] as string | undefined;
    const requestUrl = `${req.protocol}://${req.hostname}${req.url}`;
    const body = req.body as Record<string, string>;

    if (!twilioSignature) {
      app.log.warn('SMS webhook: missing X-Twilio-Signature header');
      return reply.status(403).send({ error: 'Forbidden: Missing signature' });
    }

    const isValid = validateTwilioSignature(twilioSignature, requestUrl, body);
    if (!isValid) {
      app.log.warn({ requestUrl }, 'SMS webhook: invalid Twilio signature — possible spoofed request');
      return reply.status(403).send({ error: 'Forbidden: Invalid signature' });
    }

    // ── Extract Fields ────────────────────────────────────────────────────────
    const to = body['To'] ?? '';
    const from = body['From'] ?? '';
    const messageSid = body['MessageSid'] ?? '';
    const messageBody = body['Body'] ?? '';  // Used only for broadcast, never logged

    if (!to || !from) {
      return reply.status(400).send({ error: 'Missing To/From fields' });
    }

    // ── Credential Validation ──────────────────────────────────────────────
    const active = await isCredentialActive(app.redis, to);
    if (!active) {
      app.log.info({ to }, 'SMS webhook: credential expired or not found');
      // Return 200 — Twilio expects 2xx or it will retry
      return reply.status(200).send('<Response/>');
    }

    // ── Sender Block Check ────────────────────────────────────────────────────
    if (isSenderBlocked(from)) {
      app.log.info({ from: '[BLOCKED_SENDER]' }, 'SMS webhook: sender blocked — dropped');
      return reply.status(200).send('<Response/>');
    }

    // ── High-Risk Network Interceptor ─────────────────────────────────────────
    // Silently discard payloads from known high-risk domestic financial institutions or social networks.
    const highRiskRegex = /(HDFC|SBI|ICICI|AXIS|KOTAK|PAYTM|FACEBOOK|META|WHATSAPP|GOOGLE|APPLE)/i;
    if (highRiskRegex.test(from) || highRiskRegex.test(messageBody)) {
      app.log.warn({ from: '[HIGH_RISK_NETWORK]' }, 'SMS webhook: High-Risk Network Interceptor triggered — dropped');
      return reply.status(200).send('<Response/>');
    }

    // ── OTP Extraction Middleware ────────────────────────────────────────────
    const extractedOtp = extractOTP(messageBody);

    // ── Build Message Payload ────────────────────────────────────────────────
    const messagePayload = {
      type: 'SMS' as const,
      from,
      text: messageBody,        // Raw text content — safe for WebSocket broadcast
      messageSid,
      receivedAt: new Date().toISOString(),
      isOTP: !!extractedOtp,
      otpValue: extractedOtp,
    };

    // ── Cache in Redis (REMOVED FOR ZERO-PERSISTENCE) ───────────
    // No local database writes. Real-time ephemeral memory bridge only.

    // ── Real-time Broadcast ──────────────────────────────────────────────────
    // @ts-expect-error – fastify-socket.io runtime decoration
    app.io.to(to).emit('new_message', messagePayload);

    // ── Secure Logging (NO Body content) ────────────────────────────────────
    app.log.info(safeSmsLog({ to, from, messageSid }));

    // Respond with empty TwiML (no auto-reply)
    return reply.header('Content-Type', 'text/xml').status(200).send('<Response/>');
  });
}
