-- Step 1: Create the tamper-prevention function
CREATE OR REPLACE FUNCTION prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    -- Throw an exception if an attempt is made to modify or delete existing logs
    RAISE EXCEPTION '[SECURITY_FATAL] The AuditLog table is append-only. Tampering is strictly prohibited.';
    RETURN NULL; -- Row-level BEFORE triggers returning NULL skip the operation
END;
$$ LANGUAGE plpgsql;

-- Step 2: Attach the Trigger for UPDATE and DELETE (Row-Level)
DROP TRIGGER IF EXISTS enforce_append_only_mutation ON "AuditLog";
CREATE TRIGGER enforce_append_only_mutation
BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_tampering();

-- Step 3: Attach the Trigger for TRUNCATE (Statement-Level)
DROP TRIGGER IF EXISTS enforce_append_only_truncate ON "AuditLog";
CREATE TRIGGER enforce_append_only_truncate
BEFORE TRUNCATE ON "AuditLog"
FOR EACH STATEMENT EXECUTE FUNCTION prevent_audit_tampering();
