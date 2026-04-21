import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import Toaster from '@/components/Toaster';
import AppShell from '@/components/AppShell';
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
  const organizations = await getUserOrganizations();
  const activeId = await getActiveWorkspaceId();

  return (
    <html lang="en" suppressHydrationWarning className={`${ibmPlexMono.variable}`}>
      <body suppressHydrationWarning className="antialiased min-h-screen bg-background text-foreground flex overflow-hidden">
        <SessionProvider>
          <Toaster />
          <AppShell organizations={organizations} activeWorkspaceId={activeId || undefined}>
            {children}
          </AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
