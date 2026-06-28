/**
 * CloakComms — Local Mock Gateway
 * ─────────────────────────────────
 * A fully in-memory stand-in for the real Fastify/Redis/Postgres gateway.
 * No Docker, no Postgres, no Redis required.
 *
 * Provides:
 *  POST   /api/v1/credentials          — generate email or SMS credential
 *  GET    /api/v1/credentials          — list session credentials
 *  DELETE /api/v1/credentials/:id      — revoke credential
 *  GET    /health                      — health check
 *  Socket.io                           — real-time new_message events
 *
 * Run:  node services/gateway/mock-server.mjs
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import { Server as SocketServer } from 'socket.io';
import { randomBytes } from 'crypto';
import { createServer } from 'http';

// ─── In-memory store ──────────────────────────────────────────────────────────

const credentials = new Map();   // id → credential object
const messages = new Map();      // credentialValue → Message[]
const expiryTimers = new Map();  // id → NodeJS.Timeout

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return randomBytes(12).toString('hex');
}

function generateEmail() {
  const user = randomBytes(5).toString('hex');
  return `${user}@gmail.com`;
}

function generatePhone(region) {
  const num = Math.floor(Math.random() * 9000000000 + 1000000000);
  if (region === 'IN') return `+91${num}`;
  if (region === 'UK') return `+44${num}`;
  return `+1${num}`;
}

// ─── App ──────────────────────────────────────────────────────────────────────

const app = Fastify({ logger: { level: 'info', transport: { target: 'pino-pretty', options: { colorize: true } } } });

await app.register(cors, {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
});
await app.register(formbody);

// Attach Socket.io to a raw HTTP server wrapping Fastify
const httpServer = createServer(app.server);

// Re-use Fastify's existing server instead of creating a new one
const io = new SocketServer(app.server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('join_credential', (value) => {
    socket.join(value);
    console.log(`[Socket.io] ${socket.id} joined room: ${value}`);

    // Replay any buffered messages
    const buffered = messages.get(value) ?? [];
    for (const msg of buffered) {
      socket.emit('new_message', msg);
    }
  });

  socket.on('leave_credential', (value) => {
    socket.leave(value);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health
app.get('/health', async () => ({
  status: 'ok',
  mode: 'mock',
  uptime: process.uptime(),
  credentials: credentials.size,
}));

// List credentials for a session
app.get('/api/v1/credentials', async (req, reply) => {
  const { sessionToken } = req.query;
  if (!sessionToken) return reply.status(400).send({ message: 'sessionToken required' });

  const result = [...credentials.values()]
    .filter((c) => c.sessionToken === sessionToken && new Date(c.expiresAt) > new Date())
    .map(({ sessionToken: _st, ...rest }) => rest); // strip internal token

  return { credentials: result };
});

// Create credential
app.post('/api/v1/credentials', async (req, reply) => {
  const { type, ttlSeconds, sessionToken, region } = req.body;

  if (!type || !ttlSeconds || !sessionToken) {
    return reply.status(400).send({ message: 'type, ttlSeconds, sessionToken required' });
  }

  if (!['EMAIL', 'SMS'].includes(type)) {
    return reply.status(400).send({ message: 'type must be EMAIL or SMS' });
  }

  const id = uid();
  const value = type === 'EMAIL' ? generateEmail() : generatePhone(region);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

  const credential = {
    id,
    type,
    value,
    ttlSeconds,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    sessionToken,
  };

  credentials.set(id, credential);
  messages.set(value, []);

  // Auto-revoke on TTL
  const timer = setTimeout(() => {
    credentials.delete(id);
    messages.delete(value);
    expiryTimers.delete(id);
    io.to(value).emit('credential_expired', { id, value });
    console.log(`[Expired] credential ${id} (${value})`);
  }, ttlSeconds * 1000);

  expiryTimers.set(id, timer);

  const { sessionToken: _st, ...publicCredential } = credential;
  return reply.status(201).send(publicCredential);
});

// Delete / revoke credential
app.delete('/api/v1/credentials/:id', async (req, reply) => {
  const { id } = req.params;
  const { sessionToken } = req.query;

  const cred = credentials.get(id);
  if (!cred) return reply.status(404).send({ message: 'Credential not found' });
  if (cred.sessionToken !== sessionToken) return reply.status(403).send({ message: 'Forbidden' });

  const timer = expiryTimers.get(id);
  if (timer) clearTimeout(timer);

  credentials.delete(id);
  messages.delete(cred.value);
  expiryTimers.delete(id);

  io.to(cred.value).emit('credential_expired', { id, value: cred.value });

  return reply.status(204).send();
});

// Simulate inbound email (test endpoint — no auth required in mock)
app.post('/api/v1/webhooks/email/inbound', async (req, reply) => {
  const { recipient, sender, subject, 'body-plain': text, 'body-html': html } = req.body ?? {};

  if (!recipient) return reply.status(400).send({ message: 'recipient required' });

  const message = {
    type: 'EMAIL',
    subject: subject ?? '(no subject)',
    sender: sender ?? 'unknown@example.com',
    text: text ?? '',
    html: html ?? null,
    receivedAt: new Date().toISOString(),
    ts: Date.now(),
  };

  const inbox = messages.get(recipient) ?? [];
  inbox.unshift(message);
  messages.set(recipient, inbox.slice(0, 50)); // cap at 50

  io.to(recipient).emit('new_message', message);
  console.log(`[Email] → ${recipient} from ${sender}`);

  return { status: 'delivered' };
});

// Simulate inbound SMS (test endpoint)
app.post('/api/v1/webhooks/sms/twilio', async (req, reply) => {
  const { To, From, Body } = req.body ?? {};

  if (!To) return reply.status(400).send({ message: 'To required' });

  const message = {
    type: 'SMS',
    from: From ?? '+10000000000',
    text: Body ?? '',
    receivedAt: new Date().toISOString(),
    ts: Date.now(),
  };

  const inbox = messages.get(To) ?? [];
  inbox.unshift(message);
  messages.set(To, inbox.slice(0, 50));

  io.to(To).emit('new_message', message);
  console.log(`[SMS] → ${To} from ${From}`);

  return { status: 'delivered' };
});

// Get cached messages for a credential (REST fallback)
app.get('/api/v1/webhooks/email/messages/:value', async (req, reply) => {
  const { value } = req.params;
  return { messages: messages.get(decodeURIComponent(value)) ?? [] };
});

app.get('/api/v1/webhooks/sms/messages/:value', async (req, reply) => {
  const { value } = req.params;
  return { messages: messages.get(decodeURIComponent(value)) ?? [] };
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

const PORT = process.env.GATEWAY_PORT ?? 3001;

await app.listen({ port: Number(PORT), host: '0.0.0.0' });

console.log(`
╔══════════════════════════════════════════════╗
║  🛡️  CloakComms Mock Gateway                  ║
║  http://localhost:${PORT}                         ║
║  Socket.io   ws://localhost:${PORT}               ║
║  Mode:        IN-MEMORY (no DB required)     ║
╚══════════════════════════════════════════════╝

Test endpoints:
  curl http://localhost:${PORT}/health
  
  # Simulate email delivery:
  curl -X POST http://localhost:${PORT}/api/v1/webhooks/email/inbound \\
    -d "recipient=<your_address>@cloak.mail&sender=test@gmail.com&subject=Hello&body-plain=Your+OTP+is+123456"

  # Simulate SMS delivery:
  curl -X POST http://localhost:${PORT}/api/v1/webhooks/sms/twilio \\
    -d "To=<your_phone>&From=%2B15555550123&Body=Your+code+is+7890"
`);
