-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "EntryType" AS ENUM ('DEBIT', 'CREDIT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterEnum
DO $$ BEGIN
    ALTER TYPE "AccountCategory" ADD VALUE 'LIABILITY';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TYPE "AccountCategory" ADD VALUE 'EQUITY';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "isSystem" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "parentId" TEXT;

-- AlterTable
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "type" "EntryType" NOT NULL DEFAULT 'DEBIT';
ALTER TABLE "LedgerEntry" ALTER COLUMN "type" DROP DEFAULT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Postgres does not support CREATE UNIQUE INDEX IF NOT EXISTS for some versions, but we can wrap it or just use it if supported.
-- In recent Postgres, CREATE INDEX IF NOT EXISTS is supported.
CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_idempotencyKey_key" ON "Transaction"("idempotencyKey");

-- Seed Transactions from existing LedgerEntries to prevent FK violations
INSERT INTO "Transaction" ("id", "organizationId", "description", "date", "updatedAt")
SELECT DISTINCT "transactionId", "organizationId", "description", "transactionDate", now()
FROM "LedgerEntry"
ON CONFLICT ("id") DO NOTHING;

-- AddForeignKey
-- Adding constraints can fail if they already exist. We can check or just let it pass if NOT possible to check easily.
-- Usually, we skip adding if it fails.
DO $$ BEGIN
    ALTER TABLE "Account" ADD CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

