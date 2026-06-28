'use client';

import dynamic from 'next/dynamic';

// Load the entire interactive dashboard client-side only.
// This eliminates ALL hydration mismatches caused by:
//  - localStorage access (session tokens)
//  - TanStack Query loading states differing between SSR and client
//  - Socket.io connection state
//  - Canvas particle animations
const DashboardClient = dynamic(() => import('./DashboardClient'), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0b1326' }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Animated shield logo placeholder */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #2ddbde 0%, #005354 100%)',
            boxShadow: '0 0 32px rgba(45,219,222,0.3)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          </svg>
        </div>
        <div className="text-center">
          <p
            className="font-display font-bold text-lg"
            style={{ color: '#2ddbde', fontFamily: '"Space Grotesk", sans-serif' }}
          >
            Cloak<span style={{ color: '#dae2fd' }}>Comms</span>
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: '#8c919b', fontFamily: 'Manrope, sans-serif' }}
          >
            Initialising secure session…
          </p>
        </div>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  return <DashboardClient />;
}
