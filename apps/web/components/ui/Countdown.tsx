'use client';

import { useCountdown } from '@/hooks/useCountdown';

interface CountdownRingProps {
  expiresAt: string;
  ttlSeconds: number;
  size?: number;
}

export function CountdownRing({ expiresAt, ttlSeconds, size = 56 }: CountdownRingProps) {
  const { label, percent, ringColor, expired } = useCountdown(expiresAt, ttlSeconds);

  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percent / 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(66,71,80,0.3)"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
            filter: expired ? 'none' : `drop-shadow(0 0 4px ${ringColor}88)`,
          }}
        />
      </svg>
      {/* Timer label */}
      <span
        className="relative z-10 font-mono text-center font-semibold"
        style={{
          fontSize: size < 50 ? '9px' : size < 70 ? '10px' : '12px',
          color: ringColor,
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </div>
  );
}
