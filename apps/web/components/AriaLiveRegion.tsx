'use client';

import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useEffect, useState } from 'react';

export function AriaLiveRegion() {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    const handleAnnouncement = (event: CustomEvent<string>) => {
      const message = event.detail;
      setAnnouncements((prev) => [...prev, message]);
      
      // Cleanup after a few seconds so the DOM doesn't grow indefinitely
      setTimeout(() => {
        setAnnouncements((prev) => prev.filter((m) => m !== message));
      }, 5000);
    };

    window.addEventListener('aria-announce', handleAnnouncement as EventListener);
    return () => {
      window.removeEventListener('aria-announce', handleAnnouncement as EventListener);
    };
  }, []);

  return (
    <VisuallyHidden.Root aria-live="assertive" aria-atomic="true">
      {announcements.map((msg, i) => (
        <div key={`${i}-${msg}`}>{msg}</div>
      ))}
    </VisuallyHidden.Root>
  );
}

// Helper to trigger announcements from anywhere
export function announceMessage(message: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aria-announce', { detail: message }));
  }
}
