'use server'

import { cookies } from "next/headers"

/**
 * WORKSPACE ABSTRACTION ACTIONS (PHASE 4)
 * 
 * Manages the active tenant context via client-side cookies for non-destructive 
 * switching between organizational domain spaces.
 */

export async function switchWorkspaceAction(organizationId: string) {
  try {
    const cookieStore = await cookies()
    
    // Set the cookie for 30 days
    cookieStore.set('active_workspace_id', organizationId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    return { success: true }
  } catch (error) {
    console.error('[WORKSPACE_SWITCH_FATAL]', error)
    return { success: false, error: 'Failed to synchronize workspace context.' }
  }
}

export async function getActiveWorkspaceId() {
  const cookieStore = await cookies()
  return cookieStore.get('active_workspace_id')?.value || null
}
