import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Enable React 19 features
    reactCompiler: false,
  },
  // Task 1: Force server-side compression routines
  compress: true,
  // Proxy API calls to the Fastify gateway during development
  async rewrites() {
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${gatewayUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
