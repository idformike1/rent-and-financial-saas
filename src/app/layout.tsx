import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/AppShell';
import Toaster from '@/components/Toaster';
import SessionProvider from '@/components/providers/SessionProvider';
import UniversalCommandPalette from '@/src/components/Command/UniversalCommandPalette';
import { getUserOrganizations, getActiveWorkspaceId } from '@/src/actions/workspace.actions';

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MERCURY ALPHA',
  description: 'Enterprise Mercury Financial Engine.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${ibmPlexMono.variable}`}>
      <body suppressHydrationWarning className="antialiased min-h-screen bg-background text-foreground overflow-hidden">
        <SessionProvider>
          <Toaster />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
