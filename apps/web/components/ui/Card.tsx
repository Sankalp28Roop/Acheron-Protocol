'use client';

import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  onClick?: () => void;
  active?: boolean;
}

export function Card({ children, className, elevated = false, onClick, active = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-lg transition-all duration-200',
        elevated ? 'glass-high' : 'glass',
        onClick && 'cursor-pointer',
        active && 'border-primary/40 shadow-glow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}
