'use client'

import { ThemeProvider } from 'next-themes'
import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import AppShell from "@/components/AppShell";
import SessionProvider from "@/components/providers/SessionProvider";
import Toaster from "@/components/Toaster";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased h-screen overflow-hidden`}>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <SessionProvider>
            <Toaster />
            <AppShell>
              {children}
            </AppShell>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
