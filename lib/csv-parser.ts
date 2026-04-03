/**
 * AXIOM AESTHETIC CSV PARSER (Brutalist Protocol)
 * Lightweight, zero-dependency alternative to papaparse.
 */
export function axiomParseCSV(csv: string) {
  const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  return lines.slice(1).map(line => {
    // Basic CSV cell handling that respects quoted strings including commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let char of line) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || '';
    });
    return obj;
  });
}
