'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

// ─── Socket Context ───────────────────────────────────────────────────────────

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  joinCredential: (value: string) => void;
  leaveCredential: (value: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  joinCredential: () => {},
  leaveCredential: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3001';

    const socket = io(gatewayUrl, {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinCredential = (value: string) => {
    socketRef.current?.emit('join_credential', value);
  };

  const leaveCredential = (value: string) => {
    socketRef.current?.emit('leave_credential', value);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, joinCredential, leaveCredential }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
