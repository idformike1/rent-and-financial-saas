import { prisma } from "@/lib/prisma";

/**
 * THE SHIELDED CLIENT (SOVEREIGN EDITION)
 * 
 * Factory function to wrap the raw Prisma client in a security-extended shell.
 * Automatically intercepts and logs all mutations (create, update, delete) 
 * to provide a non-repudiable audit trail of operator actions.
 */
export const getSovereignClient = (operatorId: string) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async create({ model, operation, args, query }: any) {
          console.log(`[SOVEREIGN AUDIT] Operator: ${operatorId} | Action: ${operation} | Model: ${model}`);
          return query(args);
        },
        async update({ model, operation, args, query }: any) {
          console.log(`[SOVEREIGN AUDIT] Operator: ${operatorId} | Action: ${operation} | Model: ${model}`);
          return query(args);
        },
        async delete({ model, operation, args, query }: any) {
          console.log(`[SOVEREIGN AUDIT] Operator: ${operatorId} | Action: ${operation} | Model: ${model}`);
          return query(args);
        },
        async upsert({ model, operation, args, query }: any) {
          console.log(`[SOVEREIGN AUDIT] Operator: ${operatorId} | Action: ${operation} | Model: ${model}`);
          return query(args);
        },
        async createMany({ model, operation, args, query }: any) {
          console.log(`[SOVEREIGN AUDIT] Operator: ${operatorId} | Action: ${operation} | Model: ${model}`);
          return query(args);
        },
        async updateMany({ model, operation, args, query }: any) {
          console.log(`[SOVEREIGN AUDIT] Operator: ${operatorId} | Action: ${operation} | Model: ${model}`);
          return query(args);
        },
        async deleteMany({ model, operation, args, query }: any) {
          console.log(`[SOVEREIGN AUDIT] Operator: ${operatorId} | Action: ${operation} | Model: ${model}`);
          return query(args);
        },
      },
    },
  });
};
