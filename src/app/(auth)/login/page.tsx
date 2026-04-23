"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    
    // DEBUGGING LINE
    console.log("SIGNIN RESPONSE:", res);
    
    if (res?.error) {
       console.error("SIGNIN ERROR:", res.error);
       alert(`Access Denied: ${res.error}`);
    } else { 
       router.push("/admin"); 
       router.refresh(); 
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <form onSubmit={handleSubmit} className="p-8 border border-white/10 rounded-xl bg-neutral-900 w-96">
        <h1 className="mb-6 text-xl">Sovereign OS Login</h1>
        <input className="w-full p-2 mb-4 bg-black border border-white/10" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full p-2 mb-4 bg-black border border-white/10" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full p-2 bg-white text-black font-bold" disabled={loading}>Initialize Session</button>
      </form>
    </div>
  );
}
