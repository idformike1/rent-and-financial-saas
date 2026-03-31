'use client'

import { Download } from 'lucide-react'

export default function ExportCsvButton({ data }: { data: any[] }) {
  const handleExport = () => {
    if (data.length === 0) return;
    
    // Get headers
    const headers = Object.keys(data[0]).join(',');
    
    // Get rows
    const rows = data.map(row => 
      Object.values(row)
        .map(value => typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value)
        .join(',')
    ).join('\n');

    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `master_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <button 
      onClick={handleExport}
      className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
    >
      <Download className="w-4 h-4 mr-2 text-slate-500" />
      Export to CSV
    </button>
  )
}
