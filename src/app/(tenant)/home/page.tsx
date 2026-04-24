import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <h1 className="text-2xl">Welcome to your Workspace</h1>
    </div>
  );
}
