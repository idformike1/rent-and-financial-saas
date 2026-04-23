import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");
  
  // Guard: Redirect to intake if no org is set
  if (!(session.user as any)?.organizationId) {
     redirect("/intake");
  }

  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <h1 className="text-2xl">Welcome to your Workspace</h1>
    </div>
  );
}
