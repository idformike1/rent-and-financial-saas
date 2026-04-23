"use client";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await signIn("credentials", { 
        email, 
        password, 
        redirect: false 
      });
      
      console.log("[FLOW MAP 6: DISPATCH] SignIn Result:", res);
      
      if (res?.error) {
         toast.error(`Access Denied: ${res.error}`);
         setLoading(false);
         return;
      }

      // Fetch fresh session to determine role-based routing
      const session = await getSession();
      const user = session?.user as any;

      if (user?.isSystemAdmin) {
        toast.success("Welcome, Administrator.");
        router.push("/admin");
      } else {
        toast.success("Authentication successful.");
        router.push("/home");
      }
      
      router.refresh();
    } catch (err) {
      toast.error("An unexpected authentication error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white selection:bg-emerald-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[20%] h-[20%] bg-blue-500/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500 text-black font-bold text-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-8">
            S
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white mb-2">Sovereign OS</h1>
          <p className="text-neutral-500 text-sm font-light uppercase tracking-widest">Initialize Session</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Email Identity</label>
            <input 
              className="w-full h-12 px-4 rounded-xl bg-black border border-white/5 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all duration-300"
              placeholder="admin@sovereign.os"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Access Key</label>
            <input 
              className="w-full h-12 px-4 rounded-xl bg-black border border-white/5 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all duration-300"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            className="w-full h-12 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed pt-1"
            disabled={loading}
          >
            {loading ? "AUTHENTICATING..." : "INITIATE PROTOCOL"}
          </button>
        </form>
      </div>
    </div>
  );
}
