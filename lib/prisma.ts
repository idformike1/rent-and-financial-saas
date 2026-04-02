import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });
  
  // Diagnostic Check for Stale Client
  if (!(client as any).property) {
    console.warn("⚠️ PRISMA CLIENT STALE: 'property' model missing at initialization!");
  } else {
    console.log("✅ PRISMA CLIENT INITIALIZED WITH PROPERTY MODEL");
  }
  
  return client;
};

const prisma = (globalThis as any).prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') (globalThis as any).prismaGlobal = prisma
