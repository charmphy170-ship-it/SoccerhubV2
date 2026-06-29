import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SoccerHub - Live Scores, Predictions & Community',
  description: 'The ultimate soccer hub for live scores, match predictions, player stats, and community chat. Track your favorite clubs and countries.',
  keywords: ['soccer', 'football', 'live scores', 'predictions', 'world cup', 'premier league', 'champions league'],
  openGraph: {
    title: 'SoccerHub - Live Scores & Predictions',
    description: 'Live soccer scores, predictions, and community chat',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="relative z-10">
          <Navbar />
          <main className="pt-16">{children}</main>
        </div>
      </body>
    </html>
  );
}
