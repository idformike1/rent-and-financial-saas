import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  if (!(session?.user as any)?.isSystemAdmin) redirect("/home");

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-light mb-8">Supreme Command Center</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-white/10 rounded-xl bg-neutral-900">
          <h2 className="text-sm text-neutral-400 uppercase tracking-widest">System Health</h2>
          <p className="text-2xl mt-2 text-emerald-500">OPTIMAL</p>
        </div>
        <div className="p-6 border border-white/10 rounded-xl bg-neutral-900">
          <h2 className="text-sm text-neutral-400 uppercase tracking-widest">Active Orgs</h2>
          <p className="text-2xl mt-2 text-white">0</p>
        </div>
        <div className="p-6 border border-white/10 rounded-xl bg-neutral-900">
          <h2 className="text-sm text-neutral-400 uppercase tracking-widest">Pending Intake</h2>
          <p className="text-2xl mt-2 text-amber-500">0</p>
        </div>
      </div>
    </div>
  );
}
