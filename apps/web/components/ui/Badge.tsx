'use client';

import { clsx } from 'clsx';

interface BadgeProps {
  variant: 'email' | 'sms' | 'active' | 'expired' | 'warning';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-body font-semibold uppercase tracking-wider',
        variant === 'email' && 'badge-email',
        variant === 'sms' && 'badge-sms',
        variant === 'active' && 'badge-active',
        variant === 'expired' && 'badge-expired',
        variant === 'warning' && 'badge-warning',
        className,
      )}
    >
      {variant === 'email' && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      )}
      {variant === 'sms' && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      )}
      {children}
    </span>
  );
}
