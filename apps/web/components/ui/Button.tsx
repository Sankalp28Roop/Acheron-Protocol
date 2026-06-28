'use client';

import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'relative inline-flex items-center justify-center gap-2 font-body font-semibold rounded-md',
        'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Sizes
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-7 py-3.5 text-base',
        // Variants
        variant === 'primary' && [
          'gradient-primary text-on-primary',
          'hover:brightness-110 hover:shadow-glow-sm active:scale-[0.97]',
          'shadow-glow-sm',
        ],
        variant === 'secondary' && [
          'glass text-primary border border-outline-variant/20',
          'hover:border-outline-variant/50 hover:shadow-glow-sm',
        ],
        variant === 'danger' && [
          'bg-error-container/30 text-error border border-error/20',
          'hover:bg-error-container/50',
        ],
        variant === 'ghost' && [
          'text-on-surface-variant hover:text-on-surface hover:bg-surface-highest/50',
        ],
        className,
      )}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </span>
      )}
      <span className={clsx(loading && 'invisible')}>{children}</span>
    </button>
  );
}
