import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  // 1. Verify the session via our Vault Gateway
  const session = await auth();

  // 2. Unauthenticated: Redirect to login gate
  if (!session) {
    redirect("/login");
  }

  // 3. Superadmin: Redirect to system command center
  if ((session.user as any)?.isSystemAdmin) {
    redirect("/admin");
  }

  // 4. Standard User: Redirect to their workspace silo
  redirect("/home");
}
