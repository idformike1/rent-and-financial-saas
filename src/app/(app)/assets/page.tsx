import { prisma } from "@/lib/prisma";
import AssetClient from "./AssetClient";

export default async function AssetsPage() {
  const properties = await prisma.property.findMany({
    include: {
      units: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 w-full">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
            Physical Infrastructure
          </h1>
          <h2 className="text-2xl text-zinc-100 font-medium tracking-tight">
            Asset Command Center
          </h2>
        </div>
        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          Nodes_Active: {properties.length}
        </div>
      </header>

      <AssetClient initialData={JSON.parse(JSON.stringify(properties))} />
    </div>
  );
}
