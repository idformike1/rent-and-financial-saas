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
          <h1 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 mb-1">
            Asset Intelligence
          </h1>
          <h2 className="text-display font-weight-display text-foreground leading-none">
            Occupant Registry
          </h2>
        </div>
        <div className="text-[10px] font-bold tabular-nums text-foreground/40 uppercase tracking-[0.15em]">
          Node_Count: {tenants.length}
        </div>
      </header>

      <TenantClient initialData={JSON.parse(JSON.stringify(tenants))} />
    </div>
  );
}
