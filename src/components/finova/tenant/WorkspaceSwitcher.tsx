import { auth } from "@/auth";
import { WorkspaceSwitcherClient } from "./WorkspaceSwitcherClient";
import { cookies } from "next/headers";

/**
 * SOVEREIGN MODULE SWITCHER (SERVER)
 * Determines the active functional scope and available module entitlements.
 */
export async function WorkspaceSwitcher() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // 1. Detect Entitlements
  const canAccessRent = (session.user as any).canAccessRent ?? true;
  const canAccessWealth = (session.user as any).canAccessWealth ?? true;

  // 2. Detect Active Context
  const cookieStore = await cookies();
  const activeModule = (cookieStore.get('active_module_context')?.value as 'RENT' | 'WEALTH') || 
                       (canAccessRent ? 'RENT' : 'WEALTH');

  // 3. Auto-Suppression: If they only have one module, hide the UI
  if (canAccessRent && !canAccessWealth) return null;
  if (!canAccessRent && canAccessWealth) return null;
  if (!canAccessRent && !canAccessWealth) return null;

  // 4. Render the client-side switcher with module context
  return (
    <WorkspaceSwitcherClient 
      canAccessRent={canAccessRent}
      canAccessWealth={canAccessWealth}
      activeModule={activeModule}
    />
  );
}

