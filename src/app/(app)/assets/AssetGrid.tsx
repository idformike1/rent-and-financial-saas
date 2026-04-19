import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-utils";
import AssetClient from "./AssetClient";

export default async function AssetGrid() {
  const session = await getCurrentSession();
  if (!session) return null;

  const properties = await prisma.property.findMany({
    where: { 
      organizationId: session.organizationId 
    },
    include: {
      units: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return <AssetClient initialData={JSON.parse(JSON.stringify(properties))} />;
}
