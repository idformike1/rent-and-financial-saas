'use client'
import { FileText, Download } from 'lucide-react'

export default function ExportControls() {
  const ledgerData = [
    { id: 'TXN-001', date: '2026-04-03', amount: 15400.00, status: 'Cleared' },
    { id: 'TXN-002', date: '2026-04-03', amount: -2300.00, status: 'Pending' },
  ];

  const handleCSVExport = () => {
    if (!ledgerData.length) return;
    const headers = Object.keys(ledgerData[0]).join(',');
    const rows = ledgerData.map(obj => Object.values(obj).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'axiom_master_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex gap-4">
      <button 
        onClick={handleCSVExport} 
        className="bg-brand text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-brand/20 hover:-translate-y-1 transition-transform flex items-center uppercase tracking-widest text-[10px]"
      >
        <Download className="w-4 h-4 mr-3" /> Export CSV
      </button>
    </div>
  )
}
