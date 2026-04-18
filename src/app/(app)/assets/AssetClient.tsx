"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SovereignTable } from "@/src/components/ui/SovereignTable";
import { cn } from "@/lib/utils";
import { Plus, LayoutTemplate, MapPin, BarChart3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui-finova";
import { createProperty } from "@/actions/asset.actions";
import { toast } from "@/lib/toast";
import Link from "next/link";

interface Unit {
  id: string;
  unitNumber: string;
  marketRent: any; // Decimal
}

interface Property {
  id: string;
  name: string;
  address: string;
  units: Unit[];
}

interface AssetClientProps {
  initialData: Property[];
}

export default function AssetClient({ initialData }: AssetClientProps) {
  const router = useRouter();
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [newPropData, setNewPropData] = useState({ name: '', address: '' });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const res = await createProperty(newPropData);
    if (res.success) {
      toast.success("Asset registered successfully.");
      setIsAddPropertyOpen(false);
      setNewPropData({ name: '', address: '' });
      router.refresh();
    } else {
      toast.error(res.message || "Failed to register property.");
    }
    setIsCreating(false);
  };

  const columns: any[] = [
    { 
      header: "Asset Identifier", 
      accessor: (prop: Property) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-muted border border-border flex items-center justify-center text-foreground/40 shrink-0">
             <LayoutTemplate size={14} />
          </div>
          <span className="font-medium text-foreground tracking-clinical">{prop.name}</span>
        </div>
      ),
      align: "left" 
    },
    { 
      header: "Physical Coordinates", 
      accessor: (prop: Property) => (
        <div className="flex items-center gap-2 text-foreground/40">
           <MapPin size={12} className="opacity-40" />
           <span className="truncate max-w-[240px] text-[13px] tracking-clinical">{prop.address}</span>
        </div>
      ),
      align: "left" 
    },
    { 
      header: "Node Capacity", 
      accessor: (prop: Property) => (
        <div className="flex items-center gap-2 justify-end">
           <BarChart3 size={12} className="text-foreground/20" />
           <span className="font-mono text-[13px] text-foreground/60">{prop.units.length} Units</span>
        </div>
      ),
      align: "right" 
    },
    {
      header: "",
      accessor: (prop: Property) => (
        <Link 
          href={`/assets/${prop.id}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-secondary border border-border text-[11px] font-bold text-foreground/40 hover:text-foreground hover:bg-muted transition-all uppercase tracking-[0.15em] group"
        >
          Workstation
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform opacity-40 group-hover:opacity-100" />
        </Link>
      ),
      align: "right"
    }
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-end mb-10">
        <Button 
          onClick={() => setIsAddPropertyOpen(true)}
          className="h-9 bg-brand hover:bg-brand/90 text-white rounded-[var(--radius-sm)] text-[11px] font-bold px-5 shadow-xl shadow-brand/10 uppercase tracking-[0.15em] border-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          Deploy New Asset
        </Button>
      </div>

      <SovereignTable
        data={initialData}
        columns={columns}
        className="bg-muted/10 backdrop-blur-sm border border-border shadow-2xl"
      />

      {isAddPropertyOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-6 animate-in fade-in duration-300 backdrop-blur-md">
          <div className="bg-background border border-border w-full max-w-md rounded-[var(--radius-sm)] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.15em] flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand" /> Register New Asset
              </h3>
              <button 
                onClick={() => setIsAddPropertyOpen(false)} 
                className="w-10 h-10 flex items-center justify-center text-foreground/20 hover:text-foreground hover:bg-muted rounded-full transition-all"
              >
                <Plus className="rotate-45 w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProperty} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-foreground/40 uppercase font-bold tracking-[0.15em] pl-1">Property Name</label>
                <input 
                  required
                  value={newPropData.name}
                  onChange={(e) => setNewPropData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-muted/30 border border-border rounded-[var(--radius-sm)] h-10 px-4 text-[14px] text-foreground outline-none focus:border-brand/40 transition-all font-sans" 
                  placeholder="e.g. Sovereign Heights"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-foreground/40 uppercase font-bold tracking-[0.15em] pl-1">Address Coordinates</label>
                <input 
                  required
                  value={newPropData.address}
                  onChange={(e) => setNewPropData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-muted/30 border border-border rounded-[var(--radius-sm)] h-10 px-4 text-[14px] text-foreground outline-none focus:border-brand/40 transition-all font-sans" 
                  placeholder="Full physical location"
                />
              </div>
              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="w-full h-11 bg-brand text-white font-bold text-[11px] uppercase tracking-[0.15em] rounded-[var(--radius-sm)] hover:bg-brand/90 transition-all border-none shadow-lg shadow-brand/10"
                >
                  {isCreating ? 'Synchronizing...' : 'Execute Registration'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
