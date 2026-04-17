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
          <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
             <LayoutTemplate size={14} />
          </div>
          <span className="font-bold text-white tracking-tight">{prop.name}</span>
        </div>
      ),
      align: "left" 
    },
    { 
      header: "Physical Coordinates", 
      accessor: (prop: Property) => (
        <div className="flex items-center gap-2 text-white/40">
           <MapPin size={12} />
           <span className="truncate max-w-[240px]">{prop.address}</span>
        </div>
      ),
      align: "left" 
    },
    { 
      header: "Node Capacity", 
      accessor: (prop: Property) => (
        <div className="flex items-center gap-2 justify-end">
           <BarChart3 size={12} className="text-white/20" />
           <span className="font-mono text-white/60">{prop.units.length} Units</span>
        </div>
      ),
      align: "right" 
    },
    {
      header: "",
      accessor: (prop: Property) => (
        <Link 
          href={`/assets/${prop.id}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-white/[0.04] border border-white/5 text-[11px] font-bold text-white/60 hover:text-white hover:bg-brand hover:border-brand/40 transition-all uppercase tracking-wider group"
        >
          Workstation
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
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
          className="h-11 bg-brand hover:bg-brand/90 text-white rounded-[6px] text-[12px] font-bold px-6 shadow-xl shadow-brand/20 uppercase tracking-widest"
        >
          <Plus className="w-4 h-4 mr-2" />
          Deploy New Asset
        </Button>
      </div>

      <div className="bg-[#1E1E2A]/20 border border-white/5 rounded-[12px] overflow-hidden backdrop-blur-sm shadow-2xl">
        <SovereignTable
          data={initialData}
          columns={columns}
          className="border-none bg-transparent"
        />
      </div>

      {isAddPropertyOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-6 animate-in fade-in duration-300 backdrop-blur-md">
          <div className="bg-[#0A0A0F] border border-white/10 w-full max-w-md rounded-[12px] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/[0.08] flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-[12px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand" /> Register New Asset
              </h3>
              <button 
                onClick={() => setIsAddPropertyOpen(false)} 
                className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/[0.05] rounded-full transition-all"
              >
                <Plus className="rotate-45 w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProperty} className="p-10 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest pl-1">Property Name</label>
                <input 
                  required
                  value={newPropData.name}
                  onChange={(e) => setNewPropData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-[6px] h-11 px-4 text-[14px] text-white outline-none focus:border-brand/40 transition-all font-sans" 
                  placeholder="e.g. Sovereign Heights"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest pl-1">Address Coordinates</label>
                <input 
                  required
                  value={newPropData.address}
                  onChange={(e) => setNewPropData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-[6px] h-11 px-4 text-[14px] text-white outline-none focus:border-brand/40 transition-all font-sans" 
                  placeholder="Full physical location"
                />
              </div>
              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="w-full h-12 bg-brand text-white font-bold text-[12px] uppercase tracking-widest rounded-[6px] hover:bg-brand/90 transition-all border-none shadow-lg shadow-brand/10"
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
