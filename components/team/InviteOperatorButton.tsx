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
        className="flex items-center gap-4 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-light)] px-8 py-5 rounded-[var(--radius-sm)] uppercase  hover: hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      >
        <Plus size={24} />
        <span className="text-sm">Invite Operator</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-[var(--background)]/60 z-50 flex items-center justify-center p-4 transition-all duration-500">
          <div className="glass-panel p-6 w-full max-w-md  rounded-[var(--radius-sm)] relative overflow-hidden border border-[var(--primary)]/10 animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-[var(--radius-sm)] -mr-32 -mt-32 pointer-events-none" />
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-[var(--muted)] hover:bg-[var(--card-raised)] hover:text-[var(--foreground)] p-2 rounded-[var(--radius-sm)] transition-colors z-10"
            >
              <X size={24} />
            </button>

            <h2 className="text-display font-weight-display uppercase mb-8 border-b border-[var(--border)] pb-6 text-[var(--foreground)] relative z-10">
              Add Operator
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 relative z-10">
                <label className="text-[10px] uppercase block text-[var(--muted)]">Operational Callsign (Name)</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--card)]/50 border border-[var(--border)] rounded-[var(--radius-sm)] p-4 font-bold text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] text-[var(--foreground)] transition-all"
                  placeholder="e.g. AGENT_001"
                />
              </div>

              <div className="space-y-2 relative z-10">
                <label className="text-[10px] uppercase block text-[var(--muted)]">Communications Link (Email)</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--card)]/50 border border-[var(--border)] rounded-[var(--radius-sm)] p-4 font-bold text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] text-[var(--foreground)] transition-all"
                  placeholder="name@nexus.com"
                />
              </div>

              <button
                disabled={isPending}
                type="submit"
                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-6 rounded-[var(--radius-sm)] uppercase  text-xs hover: hover:bg-[var(--primary-light)] transition-all active:scale-95 disabled:opacity-50 disabled: relative z-10 mt-8"
              >
                {isPending ? "AUTHORIZING..." : "[ INITIATE INVITE ]"}
              </button>
              
              <p className="text-[9px] uppercase text-center text-[var(--muted)] opacity-60 relative z-10">
                Default Access Key: password123
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
