import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { extractOTP } from '../lib/otp-extractor.js';
import { isCredentialActive } from '../lib/redis-ttl-manager.js';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const simulateCarrierSchema = z.object({
  sender: z.string().min(1),
  recipient: z.string().min(1),
  type: z.enum(['sms']),
  body: z.string().min(1),
});

// ─── Local High-Fidelity Simulator Route ─────────────────────────────────────
export async function simulatorRoutes(app: FastifyInstance) {
  /**
   * POST /api/v1/dev/simulate-carrier
   *
   * Ingests a mock payload, processes it via the standard internal pipelines 
   * (OTP extraction, Redis caching), and broadcasts it via WebSocket.
   */
  app.post('/dev/simulate-carrier', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = simulateCarrierSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', details: parsed.error.flatten() });
    }

    const { sender, recipient, type, body } = parsed.data;

    // ── Credential Validation ──────────────────────────────────────────────
    const active = await isCredentialActive(app.redis, recipient);
    if (!active) {
      return reply.status(404).send({ error: 'Credential not found or expired' });
    }

    // ── High-Risk Network Interceptor ─────────────────────────────────────────
    const highRiskRegex = /(HDFC|SBI|ICICI|AXIS|KOTAK|PAYTM|FACEBOOK|META|WHATSAPP|GOOGLE|APPLE)/i;
    if (highRiskRegex.test(sender) || highRiskRegex.test(body)) {
      app.log.warn({ from: '[HIGH_RISK_NETWORK]' }, 'Simulator: High-Risk Network Interceptor triggered — dropped');
      return reply.status(403).send({ error: 'Payload discarded by High-Risk Interceptor' });
    }

    // ── OTP Extraction Middleware ────────────────────────────────────────────
    const extractedOtp = extractOTP(body);

    // ── Build Message Payload ────────────────────────────────────────────────
    const messagePayload = {
      type: 'SMS' as const,
      from: sender,
      text: body,
      messageSid: `SIM_${Date.now()}`,
      receivedAt: new Date().toISOString(),
      isOTP: !!extractedOtp,
      otpValue: extractedOtp,
    };

    // ── Cache in Redis (REMOVED FOR ZERO-PERSISTENCE) ───────────
    // No local database writes. Real-time ephemeral memory bridge only.

    // ── Real-time Broadcast ──────────────────────────────────────────────────
    // @ts-expect-error – fastify-socket.io runtime decoration
    app.io.to(recipient).emit('new_message', messagePayload);

    app.log.info({ recipient, sender }, 'Simulator: mock payload injected successfully');

    return reply.status(200).send({ success: true, payload: messagePayload });
  });
}
