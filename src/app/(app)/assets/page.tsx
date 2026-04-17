import { prisma } from "@/lib/prisma";
import AssetClient from "./AssetClient";
import { getCurrentSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function AssetsPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

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

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col gap-6 w-full">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
            Asset Intelligence
          </h1>
          <h2 className="text-2xl text-foreground font-medium tracking-tight">
            Property Portfolio
          </h2>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
          Nodes_Active: {properties.length}
        </div>
      </header>

      <AssetClient initialData={JSON.parse(JSON.stringify(properties))} />
    </div>
  );
}
