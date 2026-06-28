'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';
import type { Message } from '@/lib/api-client';
import { useSettings } from '@/hooks/useSettings';

/**
 * P2P Ephemeral Ledger Hook
 * - Directly listens to the active Socket.io session.
 * - Does NOT fetch from a local database cache (Zero-Persistence).
 * - Messages are stored exclusively in volatile React state.
 */
export function useEphemeralLedger(credentialValue: string | null) {
  const { socket, joinCredential, leaveCredential } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  // We no longer have a loading state since we don't fetch historical caches.
  const [loading] = useState(false);

  // Join/leave Socket.io room
  useEffect(() => {
    if (!credentialValue || !socket) return;

    joinCredential(credentialValue);

    return () => {
      leaveCredential(credentialValue);
    };
  }, [credentialValue, socket, joinCredential, leaveCredential]);

  const { settings, isLoaded } = useSettings();

  // Handle real-time incoming messages
  useEffect(() => {
    if (!socket || !credentialValue || !isLoaded) return;

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
      
      // Auto-copy OTP if enabled and an OTP exists
      if (settings.autoCopyOTP && message.isOTP && message.otpValue) {
        navigator.clipboard.writeText(message.otpValue).catch(e => console.error('Failed to auto-copy OTP:', e));
      }

      // Instantly announce new messages to screen readers if not in stealth mode
      if (!settings.stealthMode) {
        import('@/components/AriaLiveRegion').then(({ announceMessage }) => {
          const text = message.isOTP && message.otpValue 
            ? `New OTP received: ${message.otpValue.split('').join(' ')}` 
            : `New message received from ${message.from}`;
          announceMessage(text);
        });
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, credentialValue]);

  // Explicit function to zero out the memory array
  const wipeLedger = useCallback(() => {
    setMessages([]);
  }, []);

  // Wipe memory automatically if the credential changes or unmounts
  useEffect(() => {
    wipeLedger();
  }, [credentialValue, wipeLedger]);

  return { messages, loading, clearMessages: wipeLedger, wipeLedger };
}
