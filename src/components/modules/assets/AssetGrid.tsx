import AssetClient from "./AssetClient";

interface AssetGridProps {
  initialProperties: any[];
  role: string;
}

/**
 * ASSET GRID (SOVEREIGN UI COMPONENT)
 * 
 * Receives pre-fetched property data from the Page layer.
 * Enforces strict Client/Server boundary.
 */
export default function AssetGrid({ initialProperties, role }: AssetGridProps) {
  return <AssetClient initialData={initialProperties} role={role} />;
}
