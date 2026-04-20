-- Enable Row Level Security on core tables
ALTER TABLE "Property" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Unit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lease" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Charge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LedgerEntry" ENABLE ROW LEVEL SECURITY;

-- Create isolation policies using the 'app.current_tenant_id' session variable
-- The 'TRUE' flag in current_setting ensures it returns NULL if not set instead of throwing an error.

CREATE POLICY tenant_isolation_policy ON "Property" 
FOR ALL USING ("organizationId" = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_policy ON "Unit" 
FOR ALL USING ("organizationId" = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_policy ON "Tenant" 
FOR ALL USING ("organizationId" = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_policy ON "Lease" 
FOR ALL USING ("organizationId" = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_policy ON "Charge" 
FOR ALL USING ("organizationId" = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_policy ON "LedgerEntry" 
FOR ALL USING ("organizationId" = current_setting('app.current_tenant_id', TRUE));
