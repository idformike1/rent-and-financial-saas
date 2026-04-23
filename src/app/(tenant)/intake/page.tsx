"use client";
export default function IntakePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="p-8 border border-white/10 rounded-xl bg-neutral-900 w-96">
        <h1 className="text-xl mb-6">Initialize Organization</h1>
        <p className="text-sm text-neutral-400 mb-6">Your identity is verified. Now, bind your organization to the Sovereign OS.</p>
        <input className="w-full p-2 mb-4 bg-black border border-white/10" placeholder="Organization Name" />
        <button className="w-full p-2 bg-white text-black font-bold">Register Entity</button>
      </div>
    </div>
  );
}
