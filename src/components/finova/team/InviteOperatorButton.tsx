'use client'

import { useState } from 'react'
import { Plus, X, Copy, Check, Link as LinkIcon } from 'lucide-react'
import { inviteMember } from '@/actions/team.actions'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'

export default function InviteOperatorButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('MANAGER')
  const [isPending, setIsPending] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  
  const router = useRouter()

  const handleReset = () => {
    setIsOpen(false)
    setInviteUrl(null)
    setEmail('')
    setName('')
    setRole('MANAGER')
    setIsCopied(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    try {
      const res = await inviteMember(email, name, role)
      if (res.success && res.inviteUrl) {
        setInviteUrl(res.inviteUrl)
        toast.success("Security token generated.")
      }
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to invite operator")
    } finally {
      setIsPending(false)
    }
  }

  const copyToClipboard = async () => {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setIsCopied(true)
      toast.success("Link copied to clipboard.")
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy link.")
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-4 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-light)] px-8 py-5 rounded-[var(--radius-sm)] uppercase hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
      >
        <Plus size={24} />
        <span className="text-sm font-bold tracking-widest">Invite Operator</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-500">
          <div className="glass-panel p-8 w-full max-w-lg rounded-[var(--radius-sm)] relative overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300 shadow-2xl">
            <button 
              onClick={handleReset}
              className="absolute top-6 right-6 text-foreground/40 hover:bg-white/5 hover:text-foreground p-2 rounded-[var(--radius-sm)] transition-colors z-10"
            >
              <X size={20} />
            </button>

            {!inviteUrl ? (
              <>
                <h2 className="text-display font-weight-display uppercase mb-8 border-b border-white/5 pb-6 text-foreground relative z-10">
                  Add Operator
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-[0.15em] block text-foreground/40">Operational Callsign (Name)</label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[var(--radius-sm)] p-4 font-bold text-sm outline-none focus:border-[var(--primary)] transition-all placeholder:text-foreground/20"
                      placeholder="e.g. AGENT_001"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-[0.15em] block text-foreground/40">Communications Link (Email)</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[var(--radius-sm)] p-4 font-bold text-sm outline-none focus:border-[var(--primary)] transition-all placeholder:text-foreground/20"
                      placeholder="name@nexus.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-[0.15em] block text-foreground/40">Assigned Role Protection Level</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-[#0F0F15] border border-white/10 rounded-[var(--radius-sm)] p-4 font-bold text-sm outline-none focus:border-[var(--primary)] transition-all text-foreground"
                    >
                      <option value="ADMIN">ADMIN (High Privilege)</option>
                      <option value="MANAGER">MANAGER (Standard Ops)</option>
                      <option value="VIEWER">VIEWER (Read-Only)</option>
                    </select>
                  </div>

                  <button
                    disabled={isPending}
                    type="submit"
                    className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-6 rounded-[var(--radius-sm)] uppercase text-xs font-bold tracking-[0.2em] hover:bg-[var(--primary-light)] transition-all active:scale-95 disabled:opacity-50 mt-8"
                  >
                    {isPending ? "AUTHORIZING..." : "[ INITIATE INVITE ]"}
                  </button>
                </form>
              </>
            ) : (
              <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-mercury-green/10 flex items-center justify-center border border-mercury-green/20 mb-6">
                    <Check className="text-mercury-green w-8 h-8" />
                  </div>
                  <h2 className="text-display font-weight-display uppercase mb-2 text-foreground">
                    Token Generated
                  </h2>
                  <p className="text-sm text-foreground/40 max-w-[280px]">
                    This invitation link is valid indefinitely until consumed. Share it securely with the operator.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LinkIcon size={16} className="text-foreground/20" />
                    </div>
                    <input 
                      readOnly
                      value={inviteUrl}
                      className="w-full bg-white/5 border border-white/10 rounded-[var(--radius-sm)] py-5 pl-12 pr-4 text-[12px] font-mono text-foreground/60 outline-none"
                    />
                  </div>

                  <button
                    onClick={copyToClipboard}
                    className="w-full flex items-center justify-center gap-3 bg-white text-black py-5 rounded-[var(--radius-sm)] uppercase text-[10px] font-bold tracking-[0.2em] hover:bg-white/90 transition-all"
                  >
                    {isCopied ? (
                      <>
                        <Check size={16} />
                        COPIED TO CLIPBOARD
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        COPY INVITE LINK
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full py-4 text-[10px] uppercase font-bold tracking-widest text-foreground/20 hover:text-foreground/40 transition-colors"
                  >
                    Return to Registry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
