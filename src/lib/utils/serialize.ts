import { Prisma } from '@prisma/client';

/**
 * HIGH-PERFORMANCE SERIALIZER (AXIOM V2)
 * 
 * Recursively traverses data structures to prepare them for Server-to-Client 
 * boundary crossing. Replaces the CPU-heavy JSON.parse(JSON.stringify()) 
 * pattern with a surgical type-aware conversion.
 * 
 * - Prisma.Decimal -> Number
 * - Date -> ISO String
 */
export function serializeData<T>(data: T): T {
  // 1. Primitive & Null Guard
  if (data === null || data === undefined || typeof data !== 'object') {
    return data;
  }

  // 2. Array Materialization
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item)) as unknown as T;
  }

  // 3. Date Object Normalization
  if (data instanceof Date) {
    return data.toISOString() as unknown as T;
  }

  // 4. Prisma Decimal Precision Guard
  if (Prisma.Decimal.isDecimal(data)) {
    return (data as Prisma.Decimal).toNumber() as unknown as T;
  }

  // 5. Recursive Object Traversal
  const result: any = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = serializeData(value);
  }

  return result as T;
}
