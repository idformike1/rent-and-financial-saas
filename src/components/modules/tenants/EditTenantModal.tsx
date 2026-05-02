'use client'

import { useState, useEffect } from 'react'
import { updateTenantDetails, softDeleteTenant } from '@/actions/tenant.actions'
import { Button, Input, Label } from '@/src/components/finova/ui-finova'
import { toast } from '@/lib/toast'
import { User, Mail, Phone, ShieldCheck, AlertTriangle } from 'lucide-react'
import { SideSheet } from '@/src/components/system/SideSheet'

interface EditTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    nationalId?: string;
  };
  onSuccess?: () => void;
}

export default function EditTenantModal({ isOpen, onClose, tenant, onSuccess }: EditTenantModalProps) {
  const [formData, setFormData] = useState({
    name: tenant.name,
    email: tenant.email || '',
    phone: tenant.phone || '',
    nationalId: tenant.nationalId || ''
  });

  // SYNC ENGINE: Ensure form reflects latest prop state when modal opens or tenant updates
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: tenant.name,
        email: tenant.email || '',
        phone: tenant.phone || '',
        nationalId: tenant.nationalId || ''
      });
    }
  }, [tenant, isOpen]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Full Name is required.");

    setIsSubmitting(true);
    try {
      const res = await updateTenantDetails(tenant.id, formData);

      if (res.success) {
        toast.success("Tenant identity updated successfully.");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to update tenant.");
      }
    } catch (error: any) {
      toast.error(error.message || "Internal engine failure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("CRITICAL: Are you sure you want to deactivate this occupant? This will restrict further fiscal actions but preserve ledger history.")) return;

    setIsDeleting(true);
    try {
      const res = await softDeleteTenant(tenant.id);
      if (res.success) {
        toast.success("Occupant deactivated successfully.");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to deactivate tenant.");
      }
    } catch (error: any) {
      toast.error(error.message || "Internal engine failure.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SideSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Identify Correction"
      size="md"
    >
        <div className="flex flex-col h-full">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand/10 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-brand" />
                    </div>
                    <p className="text-[11px] font-bold text-clinical-muted uppercase tracking-widest">Profile Management</p>
                </div>
                <h2 className="text-2xl font-bold text-white">Occupant Identity</h2>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-white/40">Full Name</Label>
                    <div className="relative">
                        <Input 
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="pl-10 h-12 bg-white/[0.02] border-white/10"
                            placeholder="e.g. Tony Stark"
                        />
                        <User className="absolute left-3 top-4 w-4 h-4 text-clinical-muted" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-white/40">Email Address</Label>
                        <div className="relative">
                            <Input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="pl-10 h-12 bg-white/[0.02] border-white/10"
                                placeholder="name@domain.com"
                            />
                            <Mail className="absolute left-3 top-4 w-4 h-4 text-clinical-muted" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-white/40">Phone Number</Label>
                        <div className="relative">
                            <Input 
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="pl-10 h-12 bg-white/[0.02] border-white/10"
                                placeholder="+1 (555) 000-0000"
                            />
                            <Phone className="absolute left-3 top-4 w-4 h-4 text-clinical-muted" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-white/40">National ID / Passport (Optional)</Label>
                    <Input 
                        value={formData.nationalId}
                        onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                        className="h-12 bg-white/[0.02] border-white/10"
                        placeholder="e.g. ID-882299"
                    />
                </div>

                <div className="mt-auto pt-10 flex gap-3">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        className="flex-1 h-12 uppercase font-bold" 
                        onClick={onClose}
                        disabled={isSubmitting || isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary" 
                        className="flex-1 h-12 uppercase font-bold"
                        isLoading={isSubmitting}
                        disabled={isDeleting}
                    >
                        Save Changes
                    </Button>
                </div>

                {/* DANGER ZONE */}
                <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="bg-rose-500/5 rounded-xl p-5 border border-rose-500/10">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-2 bg-rose-500/10 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-1">Danger Zone</h4>
                                <p className="text-[11px] text-clinical-muted leading-relaxed">
                                    Deactivating this occupant will mark them as inactive in the registry. 
                                    All financial history is preserved for audit purity, but no new charges can be issued.
                                </p>
                            </div>
                        </div>
                        <Button 
                            type="button"
                            variant="secondary"
                            className="w-full h-11 border-rose-500/20 text-rose-500 hover:bg-rose-500/10 uppercase font-black tracking-tighter"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            disabled={isSubmitting}
                        >
                            Deactivate Occupant
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    </SideSheet>
  )
}
