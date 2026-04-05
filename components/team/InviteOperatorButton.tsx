'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { inviteMember } from '@/actions/team.actions'
import { useRouter } from 'next/navigation'

export default function InviteOperatorButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    try {
      await inviteMember(email, name)
      setIsOpen(false)
      setEmail('')
      setName('')
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Failed to invite operator")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-4 bg-[#FF3D00] text-black border-4 border-black px-8 py-5 font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all focus:outline-none"
      >
        <Plus size={32} />
        <span className="text-xl">Invite Operator</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border-8 border-black p-8 w-full max-w-md shadow-[16px_16px_0px_0px_rgba(255,61,0,1)] relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute -top-6 -right-6 bg-black text-white p-2 border-4 border-white hover:bg-[#FF3D00] transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 border-b-4 border-black pb-2">
              Add Operator
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest block">Operational Callsign (Name)</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-4 border-black p-4 font-bold text-xl focus:bg-yellow-50 outline-none"
                  placeholder="e.g. AGENT 001"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest block">Communications Link (Email)</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-4 border-black p-4 font-bold text-xl focus:bg-yellow-50 outline-none"
                  placeholder="name@nexus.com"
                />
              </div>

              <button
                disabled={isPending}
                type="submit"
                className="w-full bg-black text-white py-6 font-black uppercase tracking-[0.2em] text-xl border-4 border-black hover:bg-card hover:text-black transition-all disabled:opacity-50"
              >
                {isPending ? "AUTHORIZING..." : "INITIATE INVITE"}
              </button>
              
              <p className="text-[10px] uppercase font-black tracking-widest text-center opacity-50">
                Default Access Key: password123
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
