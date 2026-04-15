export default function TreasuryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 w-full h-full animate-in fade-in duration-500">
      {children}
    </div>
  );
}
