import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import SessionProvider from '@/components/providers/SessionProvider'
import Toaster from '@/components/Toaster'

// ── PRIMARY SANS-SERIF: INTER ─────────────────────────────────────────────────
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

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
      className={`${inter.variable} ${ibmPlexMono.variable}`}
    >
      <body className="antialiased h-screen overflow-hidden font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SessionProvider>
            <Toaster />
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
