import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import Toaster from '@/components/Toaster';
import SovereignShell from '@/components/SovereignShell';

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AXIOM 2026',
  description: 'Enterprise Sovereign Financial Engine.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${ibmPlexMono.variable}`}>
      <body className="antialiased min-h-screen bg-[#0A0A0A] text-zinc-100 flex overflow-hidden">
        <SessionProvider>
          <Toaster />
          <SovereignShell>
            {children}
          </SovereignShell>
        </SessionProvider>
      </body>
    </html>
  );
}
