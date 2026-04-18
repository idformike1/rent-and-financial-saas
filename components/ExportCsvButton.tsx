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
      className="inline-flex items-center px-4 py-2 border border-border text-sm font-bold rounded-[var(--radius)] text-muted-foreground bg-card hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
    >
      <Download className="w-4 h-4 mr-2 text-muted-foreground" />
      Export to CSV
    </button>
  )
}
