import { getSovereignClient } from "@/src/lib/db";

/**
 * TEAM QUERY SERVICE (SOVEREIGN EDITION)
 * 
 * Provides high-performance visibility into the organizational collective.
 */

/**
 * Retrieves all members associated with the organization.
 */
export async function getTeamMembersService(context: { operatorId: string, organizationId: string }) {
  const db = getSovereignClient(context.operatorId);

  const members = await db.user.findMany({
    where: { organizationId: context.organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      canEdit: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  });

  const stats = {
    total: members.length,
    active: members.filter((m: any) => m.isActive).length,
    viewOnly: members.filter((m: any) => !m.canEdit).length
  };

  return { members, stats };
}
