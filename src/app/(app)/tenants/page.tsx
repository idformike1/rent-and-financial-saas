import { prisma } from "@/lib/prisma";
import TenantClient from "./TenantClient";

export default async function TenantRegistryPage() {
  const tenants = await prisma.tenant.findMany({
    include: {
      leases: {
        where: {
          isActive: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6 w-full">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
            Human Directory
          </h1>
          <h2 className="text-2xl text-zinc-100 font-medium tracking-tight">
            Occupant Registry
          </h2>
        </div>
        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          Node_Count: {tenants.length}
        </div>
      </header>

      <TenantClient initialData={tenants as any} />
    </div>
  );
}
