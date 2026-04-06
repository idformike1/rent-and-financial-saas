import { Prisma } from '@prisma/client';

/**
 * GOVERNANCE CORE ALGORITHMS (AXIOM ENTERPRISE V3)
 * 
 * Stateless, deterministic functions for high-fidelity 
 * access control, taxonomy enforcement, and search ranking.
 */

/**
 * ALGORITHM: RBAC TERMINATION GUARD
 * 
 * Determines if a user account can be definitively deleted based on 
 * audit history and system role constraints.
 */
export const resolveTerminationSafety = (
  userId: string,
  sessionUserId: string,
  auditCount: number,
  role: string,
  isLastOwner: boolean
): { safe: boolean, reason?: string } => {
  if (userId === sessionUserId) {
    return { safe: false, reason: "Self-termination protocol blocked by system gravity." };
  }

  if (role === 'OWNER' && isLastOwner) {
    return { safe: false, reason: "Cannot terminate the final Sovereign Owner." };
  }

  if (auditCount > 0) {
    return { safe: false, reason: "Non-repudiation failure: User has active audit trails. Use deactivation (Kick) instead." };
  }

  return { safe: true };
};

/**
 * ALGORITHM: TAXONOMY DEPTH VALIDATOR
 */
export const validateTaxonomyDepth = (
  parentId: string | null,
  parentIsSubNode: boolean
): { valid: boolean, error?: string } => {
  if (parentId && parentIsSubNode) {
    return { 
      valid: false, 
      error: "Architecture Limit: Taxonomies are capped at 2 levels beneath the Ledger Asset." 
    };
  }
  return { valid: true };
};

/**
 * ALGORITHM: SEARCH RESULT RANKER
 */
export type SearchEntity = { 
  id: string; 
  title: string; 
  type: string; 
  href: string; 
  description?: string;
  rank?: number;
};

export const rankSearchResults = (results: SearchEntity[], query: string): SearchEntity[] => {
  const q = query.toLowerCase();
  
  return results.map(r => {
    let rank = 0;
    if (r.title.toLowerCase().startsWith(q)) rank += 10;
    if (r.title.toLowerCase().includes(q)) rank += 5;
    return { ...r, rank };
  }).sort((a, b) => (b.rank || 0) - (a.rank || 0));
};
