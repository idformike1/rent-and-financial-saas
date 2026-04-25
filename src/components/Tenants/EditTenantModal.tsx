'use client'

import { useState } from 'react'
import { updateTenantDetails } from '@/actions/tenant.actions'
import { Card, Button, Input, Label, cn } from '@/components/ui-finova'
import { toast } from '@/lib/toast'
import { User, Mail, Phone, ShieldCheck, X } from 'lucide-react'

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-md p-6 bg-zinc-950 border border-white/10 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-clinical-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand/10 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Identify Correction</h2>
            <p className="text-xs text-clinical-muted">Update occupant's primary contact and identity information.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <div className="relative">
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10 h-10"
                placeholder="e.g. Tony Stark"
              />
              <User className="absolute left-3 top-2.5 w-4 h-4 text-clinical-muted" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email Address</Label>
              <div className="relative">
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-10"
                  placeholder="name@domain.com"
                />
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-clinical-muted" />
              </div>
            </div>
            <div>
              <Label>Phone Number</Label>
              <div className="relative">
                <Input 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10 h-10"
                  placeholder="+1 (555) 000-0000"
                />
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-clinical-muted" />
              </div>
            </div>
          </div>

          <div>
            <Label>National ID / Passport (Optional)</Label>
            <Input 
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              className="h-10"
              placeholder="e.g. ID-882299"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1 h-10" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1 h-10"
              isLoading={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
