import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://simple-as-that.net'),
  title: 'Simple As That Casino — The Ultimate Provably Fair Web3 Casino',
  description: 'High stakes, zero nonsense. Play Crash, Plinko, Dice, and Coinflip with 100% SHA-256 Provably Fair verification and instant Web3 payouts on simple-as-that.net.',
  keywords: [
    'Simple As That Casino',
    'simple-as-that.net',
    'Crypto Casino',
    'Web3 Casino',
    'Provably Fair Gambling',
    'Crash Game',
    'Plinko',
    'Crypto Dice',
    'Bitcoin Casino',
    'Solana Casino',
    'USDC Casino',
    'Voss Neural Research',
  ],
  authors: [{ name: 'Simple As That Engineering Team' }],
  creator: 'Simple As That',
  publisher: 'simple-as-that.net',
  alternates: {
    canonical: 'https://simple-as-that.net',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simple-as-that.net',
    title: 'Simple As That Casino — Provably Fair Web3 Crypto Casino',
    description: 'No nonsense. Instant payouts. 100% SHA-256 provably fair mechanics.',
    siteName: 'Simple As That Casino',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="bg-[#050505] text-gray-100 min-h-screen flex flex-col antialiased selection:bg-cyan-500 selection:text-black overflow-x-hidden relative">
        {/* FLOWING NEON AURORA BACKGROUND ORBS & HIGH-TECH CYBER MATRIX GRID */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none cyber-matrix-grid">
          <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-cyan-500/25 blur-[120px] animate-orb-1" />
          <div className="absolute top-1/4 -right-36 w-[700px] h-[700px] rounded-full bg-pink-500/20 blur-[130px] animate-orb-2" />
          <div className="absolute -bottom-24 left-1/3 w-[600px] h-[600px] rounded-full bg-amber-500/18 blur-[110px] animate-orb-3" />
          <div className="absolute top-2/3 -left-20 w-[550px] h-[550px] rounded-full bg-purple-600/20 blur-[120px] animate-orb-1" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
