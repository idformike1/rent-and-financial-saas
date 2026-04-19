import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-utils";
import TenantClient from "./TenantClient";

export default async function TenantGrid() {
  const session = await getCurrentSession();
  if (!session) return null;

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

  return <TenantClient initialData={JSON.parse(JSON.stringify(tenants))} />;
}
