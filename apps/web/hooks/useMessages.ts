'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';
import { messageApi, type Message } from '@/lib/api-client';

/**
 * Subscribes to real-time messages for a given credential value.
 * - Loads cached messages from Redis on mount
 * - Joins the Socket.io credential room for live updates
 * - Prepends new messages as they arrive
 */
export function useMessages(credentialValue: string | null, credentialType: 'EMAIL' | 'SMS' | null) {
  const { socket, joinCredential, leaveCredential } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cached messages on credential selection
  useEffect(() => {
    if (!credentialValue || !credentialType) {
      setMessages([]);
      return;
    }

    setLoading(true);
    const fetchMessages = credentialType === 'EMAIL'
      ? messageApi.getEmailMessages(credentialValue)
      : messageApi.getSmsMessages(credentialValue);

    fetchMessages
      .then(({ messages: cached }) => setMessages(cached))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [credentialValue, credentialType]);

  // Join/leave Socket.io room
  useEffect(() => {
    if (!credentialValue || !socket) return;

    joinCredential(credentialValue);

    return () => {
      leaveCredential(credentialValue);
    };
  }, [credentialValue, socket, joinCredential, leaveCredential]);

  // Handle real-time incoming messages
  useEffect(() => {
    if (!socket || !credentialValue) return;

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
      
      // Instantly announce new messages to screen readers
      import('@/components/AriaLiveRegion').then(({ announceMessage }) => {
        const text = message.isOTP && message.otpValue 
          ? `New OTP received: ${message.otpValue.split('').join(' ')}` 
          : `New message received from ${message.from}`;
        announceMessage(text);
      });
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, credentialValue]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, loading, clearMessages };
}
