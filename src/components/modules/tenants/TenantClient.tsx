"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataTable } from '@/src/components/system/DataTable';
import { Button } from "@/src/components/finova/ui-finova";
import { DollarSign, ArrowUpRight, User, Home, Mail, Phone, ExternalLink } from "lucide-react";
import PaymentDrawer from "@/src/components/finova/PaymentDrawer";
import { Badge } from "@/src/components/finova/ui-finova";
import { cn } from "@/lib/utils";

interface Tenant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  leases: {
    unit: {
      unitNumber: string;
      property: {
        name: string;
      };
    };
    rentAmount: any; 
    status: string;
    startDate: string;
    endDate: string;
  }[];
  charges: any[];
}

interface TenantClientProps {
  initialData: Tenant[];
  role?: string;
}

export default function TenantClient({ initialData, role }: TenantClientProps) {
  const router = useRouter();
  const [selectedTenantForPayment, setSelectedTenantForPayment] = useState<Tenant | null>(null);

  // --- SORTING ENGINE ---
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return initialData;

    return [...initialData].sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortConfig.key) {
        case 'name':
          aValue = (a.name || "").toLowerCase();
          bValue = (b.name || "").toLowerCase();
          break;
        case 'asset':
          aValue = (a.leases[0]?.unit?.property?.name || "").toLowerCase();
          bValue = (b.leases[0]?.unit?.property?.name || "").toLowerCase();
          break;
        case 'balance':
          aValue = a.charges.reduce((acc, c) => acc + (Number(c.amount) - Number(c.amountPaid)), 0);
          bValue = b.charges.reduce((acc, c) => acc + (Number(c.amount) - Number(c.amountPaid)), 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [initialData, sortConfig]);

  const columns: any[] = [
    { 
      header: "Occupant", 
      sortKey: "name",
      accessor: (tenant: Tenant) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-foreground/40 uppercase tracking-[0.1em]">
            {tenant.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground tracking-clinical">{tenant.name}</span>
            <span className="text-[10px] text-foreground/40 font-mono lowercase">{tenant.email || 'no-endpoint'}</span>
          </div>
        </div>
      ),
      align: "left" 
    },
    { 
      header: "Asset Deployment", 
      sortKey: "asset",
      accessor: (tenant: Tenant) => {
        const lease = tenant.leases[0];
        if (!lease) return <span className="text-zinc-700 italic text-[11px]">UNASSIGNED</span>;
        return (
          <div className="flex flex-col">
            <span className="text-foreground font-medium tracking-clinical">{lease.unit.property.name}</span>
            <span className="text-[10px] text-foreground/40 uppercase tracking-[0.15em] font-bold">Unit {lease.unit.unitNumber}</span>
          </div>
        );
      },
      align: "left" 
    },
    { 
      header: "Tenure Status", 
      accessor: (tenant: Tenant) => {
        const lease = tenant.leases[0];
        if (!lease) return <Badge variant="default" className="bg-zinc-900/50 text-zinc-500 border-zinc-800">INACTIVE</Badge>;
        return (
          <div className="flex flex-col gap-1">
              <Badge variant="success" className="w-fit scale-90 origin-left desaturate opacity-60">
                {lease.status}
              </Badge>
              <span className="text-[10px] text-foreground/20 font-mono tracking-clinicaler">
                EXP: {new Date(lease.endDate).toLocaleDateString()}
              </span>
          </div>
        );
      },
      align: "left" 
    },
    { 
      header: "Aggregate Fisc", 
      sortKey: "balance",
      accessor: (tenant: Tenant) => {
        const balance = tenant.charges.reduce((acc, c) => acc + (Number(c.amount) - Number(c.amountPaid)), 0);
        return (
          <div className="flex flex-col items-end">
            <span className={cn(
              "font-mono font-bold tracking-clinical",
              balance > 0 ? "text-destructive/80" : "text-mercury-green"
            )}>
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-foreground/40 uppercase tracking-[0.15em]">Balance Owed</span>
          </div>
        );
      },
      align: "right" 
    },
    {
      header: "Protocol",
      accessor: (tenant: Tenant) => (
        <div className="flex items-center justify-end gap-2">
           {role !== 'VIEWER' && (
             <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTenantForPayment(tenant);
              }}
              className="h-8 w-8 p-0 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20"
            >
              <DollarSign className="w-4 h-4" />
            </Button>
           )}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/tenants/${tenant.id}`);
            }}
            className="h-8 w-8 p-0 bg-secondary hover:bg-muted text-foreground/40 hover:text-foreground border border-border"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      ),
      align: "right"
    }
  ];

  const handleRowClick = (tenant: Tenant) => {
    router.push(`/tenants/${tenant.id}`);
  };

  return (
    <div className="space-y-4">
      <DataTable
        data={sortedData}
        columns={columns}
        onRowClick={handleRowClick}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

      {selectedTenantForPayment && (
        <PaymentDrawer 
          tenant={selectedTenantForPayment}
          activeCharges={selectedTenantForPayment.charges}
          isOpen={!!selectedTenantForPayment}
          onClose={() => setSelectedTenantForPayment(null)}
          onSuccess={() => {
            setSelectedTenantForPayment(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
