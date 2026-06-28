import fp from 'fastify-plugin';
import fastifySocketIO from 'fastify-socket.io';
import type { FastifyInstance } from 'fastify';

export const socketPlugin = fp(async (app: FastifyInstance) => {
  await app.register(fastifySocketIO, {
    cors: {
      origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','),
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // @ts-expect-error – fastify-socket.io extends FastifyInstance at runtime
  app.io.on('connection', (socket) => {
    app.log.info({ socketId: socket.id }, 'Client connected');

    // Client joins a room keyed by credential value to receive targeted messages
    socket.on('join_credential', (credentialValue: string) => {
      void socket.join(credentialValue);
      app.log.debug({ socketId: socket.id, credentialValue }, 'Client joined credential room');
    });

    socket.on('leave_credential', (credentialValue: string) => {
      void socket.leave(credentialValue);
    });

    socket.on('disconnect', () => {
      app.log.info({ socketId: socket.id }, 'Client disconnected');
    });
  });

  app.log.info('✅ Socket.io initialised');
});
