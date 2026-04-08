import { auth } from "@/auth";
import { redirect } from "next/navigation";
import InsightsClient from "./InsightsClient";

export const metadata = {
  title: "Insights | Axiom Finova",
  description: "Overview of your financial health.",
};

export default async function InsightsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Since session.user might have organizationId depending on how next-auth is configured, 
  // we pass it down. If it's not present, we pass undefined and Prisma queries will fallback based on the server action logic.
  const organizationId = (session.user as any).organizationId;

  return (
    <InsightsClient organizationId={organizationId} />
  );
}
