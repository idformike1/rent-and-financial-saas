import { redirect } from "next/navigation";

/**
 * WEALTH ROOT REDIRECT
 * Ensures that the /wealth context pointer is correctly materialized 
 * to the primary accounts matrix rather than falling back to /home.
 */
export default function WealthRootPage() {
  redirect("/wealth/accounts");
}
