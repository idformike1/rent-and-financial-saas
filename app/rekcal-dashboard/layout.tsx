import { ReactNode } from 'react';

export default function RekcalDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F1F3] text-[#1A1A24] font-sans antialiased selection:bg-[#EBE9FE] selection:text-[#4F46E5]">
      {children}
    </div>
  );
}
