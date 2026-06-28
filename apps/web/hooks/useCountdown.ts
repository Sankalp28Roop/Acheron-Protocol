'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Provides a real-time countdown from an ISO expiry timestamp.
 * Updates every second.
 * Returns: { remainingSeconds, percent, expired, label }
 */
export function useCountdown(expiresAt: string, ttlSeconds: number) {
  const calculateRemaining = () => {
    const now = Date.now();
    const expiry = new Date(expiresAt).getTime();
    return Math.max(0, Math.floor((expiry - now) / 1000));
  };

  const [remaining, setRemaining] = useState(calculateRemaining);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(calculateRemaining());
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [expiresAt]);

  const percent = Math.max(0, Math.min(100, (remaining / ttlSeconds) * 100));
  const expired = remaining === 0;

  const formatLabel = (secs: number): string => {
    if (secs <= 0) return 'Expired';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
    return `${s}s`;
  };

  // Color state based on remaining %
  const ringColor =
    expired
      ? '#93000a'           // error-container
      : percent < 20
      ? '#ffb77d'           // tertiary (warning)
      : '#2ddbde';          // primary (active)

  return {
    remainingSeconds: remaining,
    percent,
    expired,
    label: formatLabel(remaining),
    ringColor,
  };
}
