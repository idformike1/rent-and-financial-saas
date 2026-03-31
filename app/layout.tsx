import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Property Treasury Engine",
  description: "Enterprise-grade property management and financial reconciliation engine (Phase 2).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-slate-900 antialiased h-screen overflow-hidden bg-white`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
