'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { recordAuditLog } from "@/lib/audit-logger"

import { runSecureServerAction } from "@/lib/auth-utils"

export async function fetchTeamMembers() {
  return runSecureServerAction('OWNER', async (session) => {
    const members = await prisma.user.findMany({
      where: { organizationId: session.organizationId },
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
    })

    const stats = {
      total: members.length,
      active: members.filter((m: any) => m.isActive).length,
      viewOnly: members.filter((m: any) => !m.canEdit).length
    }

    return { members, stats }
  });
}

export async function updateUserRole(userId: string, newRole: string) {
  return runSecureServerAction('OWNER', async (session) => {
    // Prevent changing own role if you are the last owner (simplified check)
    if (userId === session.userId && newRole !== 'OWNER') {
      throw new Error("Cannot demote yourself from OWNER role.")
    }

    await prisma.user.update({
      where: { 
        id: userId,
        organizationId: session.organizationId 
      },
      data: { role: newRole }
    })

    await recordAuditLog({
      action: 'ROLE_CHANGE',
      entityType: 'USER',
      entityId: userId,
      metadata: { newRole }
    })
    
    revalidatePath('/settings/team')
  });
}

export async function toggleUserActivation(userId: string, isActive: boolean) {
  return runSecureServerAction('OWNER', async (session) => {
    if (userId === session.userId) {
      throw new Error("Cannot deactivate your own account.")
    }

    await prisma.user.update({
      where: { 
        id: userId,
        organizationId: session.organizationId 
      },
      data: { isActive }
    })

    await recordAuditLog({
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
      entityType: 'USER',
      entityId: userId
    })
    
    revalidatePath('/settings/team')
  });
}

export async function toggleUserEditPermission(userId: string, canEdit: boolean) {
  return runSecureServerAction('OWNER', async (session) => {
    await prisma.user.update({
      where: { 
        id: userId,
        organizationId: session.organizationId 
      },
      data: { canEdit }
    })
    
    revalidatePath('/settings/team')
  });
}

export async function deleteUserForever(userId: string) {
  return runSecureServerAction('OWNER', async (session) => {
    if (userId === session.userId) {
      throw new Error("Self-termination protocol blocked.")
    }

    // Safety Catch: Check for existing AuditLogs or LedgerEntries
    const hasHistory = await prisma.$transaction(async (tx: any) => {
      const logsCount = await tx.auditLog.count({ where: { userId: userId } })
      return logsCount > 0
    })

    if (hasHistory) {
      throw new Error("Cannot delete user with history. Use 'Kick' (Deactivate) instead.")
    }

    await prisma.user.delete({
      where: { 
        id: userId,
        organizationId: session.organizationId 
      }
    })

    await recordAuditLog({
      action: 'DELETE',
      entityType: 'USER',
      entityId: userId
    })
    
    revalidatePath('/settings/team')
  });
}

export async function inviteMember(email: string, name: string) {
  return runSecureServerAction('OWNER', async (session) => {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error("User already exists in the system.")
    }

    const defaultPassword = "password123" 
    const passwordHash = await bcrypt.hash(defaultPassword, 10)

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'MANAGER',
        organizationId: session.organizationId,
        isActive: true,
        canEdit: true,
      }
    })

    await recordAuditLog({
      action: 'INVITE',
      entityType: 'USER',
      entityId: newUser.id,
      metadata: { email }
    })

    revalidatePath('/settings/team')
    return { success: true, user: newUser }
  });
}
