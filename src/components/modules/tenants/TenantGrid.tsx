import TenantClient from "./TenantClient";

interface TenantGridProps {
  initialTenants: any[];
  role: string;
}

/**
 * TENANT GRID (SOVEREIGN UI COMPONENT)
 * 
 * Receives pre-fetched tenant data from the Page layer.
 * Enforces strict Client/Server boundary.
 */
export default function TenantGrid({ initialTenants, role }: TenantGridProps) {
  return <TenantClient initialData={initialTenants} role={role} />;
}
