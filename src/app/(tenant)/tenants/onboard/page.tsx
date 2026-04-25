import { redirect } from "next/navigation";

export default function OnboardRedirect() {
  // Redirecting the legacy path to the new centralized onboarding wizard
  redirect('/tenant-register');
}
