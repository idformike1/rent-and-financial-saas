'use client';

import React from 'react';
import { Badge } from '@/src/components/finova/ui-finova'
import { MercuryTable, THead, TBody, TR, TD } from '@/src/components/system/DataTable'
import { Card } from '@/src/components/system/Card';

/**
 * LEDGER VIEW (COMMAND CENTER COMPONENT)
 * 
 * High-fidelity, clinical table rendering the tenant's transaction history.
 */

export function LedgerView({ entries }: { entries: any[] }) {
  return (
    <Card variant="muted" className="p-0 border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-[13px] font-bold text-white uppercase tracking-clinical">Accounts Receivable Ledger</h2>
        <p className="text-[11px] text-clinical-muted mt-1 uppercase font-bold tracking-widest">Immutable record of all financial events</p>
      </div>
      <div className="p-0">
        <MercuryTable>
          <THead>
            <TR isHeader>
              <TD isHeader>Date</TD>
              <TD isHeader>Description</TD>
              <TD isHeader>Type</TD>
              <TD isHeader className="text-right">Debit</TD>
              <TD isHeader className="text-right">Credit</TD>
            </TR>
          </THead>
          <TBody>
            {entries.length === 0 && (
              <TR>
                <TD colSpan={5}>
                  <div className="text-center text-clinical-muted py-8 text-[11px] uppercase font-bold tracking-widest">No events found in ledger</div>
                </TD>
              </TR>
            )}
            {entries.map((entry) => (
              <TR key={entry.id}>
                <TD variant="date">{new Date(entry.date).toLocaleDateString()}</TD>
                <TD>{entry.description}</TD>
                <TD>
                  <Badge variant={entry.type === 'DEBIT' ? 'danger' : 'success'}>
                    {entry.type}
                  </Badge>
                </TD>
                <TD className={`text-right font-finance ${entry.type === 'DEBIT' ? 'text-rose-400' : 'text-clinical-muted'}`}>
                  {entry.type === 'DEBIT' ? `$${Number(entry.amount).toFixed(2)}` : '-'}
                </TD>
                <TD className={`text-right font-finance ${entry.type === 'CREDIT' ? 'text-mercury-green' : 'text-clinical-muted'}`}>
                  {entry.type === 'CREDIT' ? `$${Number(entry.amount).toFixed(2)}` : '-'}
                </TD>
              </TR>
            ))}
          </TBody>
        </MercuryTable>
      </div>
    </Card>
  );
}
