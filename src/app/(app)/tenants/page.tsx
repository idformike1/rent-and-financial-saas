import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import TenantClient from "./TenantClient";

export default async function TenantRegistryPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const tenants = await prisma.tenant.findMany({
    where: {
      organizationId: session.organizationId,
      isDeleted: false,
    },
    include: {
      leases: {
        where: {
          isActive: true,
        },
        include: {
          unit: {
            include: {
              property: true
            }
          }
        }
      },
      charges: {
        where: {
          isFullyPaid: false,
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
          <h1 className="text-[11px] uppercase tracking-widest text-[#9CA3AF] font-semibold mb-1">
            Asset Intelligence
          </h1>
          <h2 className="text-2xl text-white font-medium tracking-tight">
            Occupant Registry
          </h2>
        </div>
        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          Node_Count: {tenants.length}
        </div>
      </header>

      <TenantClient initialData={JSON.parse(JSON.stringify(tenants))} />
    </div>
  );
}
