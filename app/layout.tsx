import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'
import Toaster from '@/components/Toaster'

// ── PROJECT ARCADIA: DIRECT CDN FONT INJECTION (globals.css) ───────────────
// No static Next.js loaders used for proprietary variable fonts.

// ── MONOSPACE: IBM PLEX MONO (financial figures & tabular data) ───────────────
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Axiom Finova — Enterprise SaaS',
  description: 'Enterprise rent and financial management platform.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Font CSS variables injected at html level so all children can consume them
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ibmPlexMono.variable} font-sans`}
    >
      <body 
        className="antialiased min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300"
        suppressHydrationWarning
      >
          <SessionProvider>
            <Toaster />
            {children}
          </SessionProvider>
      </body>
    </html>
  )
}
