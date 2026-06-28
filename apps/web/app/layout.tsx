import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Acheron Link — Disposable Privacy Credentials',
  description:
    'Generate temporary, disposable email addresses and SMS phone numbers with customizable expiry lifecycles. Stay anonymous, stay private.',
  keywords: ['disposable email', 'temporary SMS', 'privacy', 'anonymous', 'burner phone'],
  robots: 'noindex, nofollow', // Privacy tool — opt out of indexing
  openGraph: {
    title: 'Acheron Link',
    description: 'Disposable privacy credentials with real-time inbox',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
