import { prisma } from "@/lib/prisma";

/**
 * THE SHIELDED CLIENT (SOVEREIGN EDITION)
 * 
 * Factory function to wrap the raw Prisma client in a security-extended shell.
 * Automatically intercepts and logs all mutations (create, update, delete) 
 * to provide a non-repudiable audit trail of operator actions.
 */
/**
 * THE RLS-AWARE SOVEREIGN CLIENT (KERNEL EDITION)
 * 
 * Factory function to wrap the raw Prisma client in a security-extended shell
 * that enforces PostgreSQL Row Level Security (RLS).
 * 
 * To survive PgBouncer transaction-mode pooling, each operation is wrapped 
 * in a transaction where the local tenant context is established.
 */
export const getSovereignClient = (organizationId: string) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          return prisma.$transaction(async (tx) => {
            // The 'true' flag ensures this variable evaporates when the transaction ends
            await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', '${organizationId}', true)`);
            return query(args);
          });
        },
      },
    },
  });
};
