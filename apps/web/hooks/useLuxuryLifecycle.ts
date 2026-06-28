import { useEffect, useState, useRef, useCallback } from 'react';
import { useCredentials, useCreateCredential } from './useCredentials';
import type { Credential } from '@/lib/api-client';

export function useLuxuryLifecycle() {
  const { data: credentials, isLoading } = useCredentials();
  const { mutate: createCredential } = useCreateCredential();
  
  const [activeCredential, setActiveCredential] = useState<Credential | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const workerRef = useRef<Worker | null>(null);

  // Auto-provisioning
  useEffect(() => {
    if (isLoading) return;

    if (!credentials || credentials.length === 0) {
      setActiveCredential(null);
    } else if (!activeCredential) {
      setActiveCredential(credentials[0] || null);
    } else {
      // Keep active credential synced if it exists in the list
      const updated = credentials.find(c => c.id === activeCredential.id);
      if (updated) {
        setActiveCredential(updated);
      } else {
        setActiveCredential(credentials[0] || null);
      }
    }
  }, [credentials, isLoading, createCredential, activeCredential]);

  // Web Worker for high-precision countdown
  useEffect(() => {
    if (!activeCredential) {
      setSecondsRemaining(0);
      return;
    }

    // Terminate existing worker if any
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    const workerCode = `
      let intervalId;
      self.onmessage = function(e) {
        const { type, expiresAt } = e.data;
        if (type === 'START') {
          if (intervalId) clearInterval(intervalId);
          const target = new Date(expiresAt).getTime();
          
          intervalId = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((target - now) / 1000));
            self.postMessage({ secondsRemaining: diff });
            if (diff === 0) clearInterval(intervalId);
          }, 1000);
          
          // Initial fire
          const now = Date.now();
          const diff = Math.max(0, Math.floor((target - now) / 1000));
          self.postMessage({ secondsRemaining: diff });
        } else if (type === 'STOP') {
          if (intervalId) clearInterval(intervalId);
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;

    worker.onmessage = (e) => {
      setSecondsRemaining(e.data.secondsRemaining);
    };

    worker.postMessage({ type: 'START', expiresAt: activeCredential.expiresAt });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [activeCredential?.expiresAt]);

  return {
    credentials,
    isLoading,
    activeCredential,
    setActiveCredential,
    secondsRemaining,
  };
}
