const fs = require('fs');

const files = [
  'src/app/(tenant)/assets/[propertyId]/PropertySovereignClient.tsx',
  'components/assets/PropertyMetricsHud.tsx',
  'src/app/(tenant)/assets/[propertyId]/UnitGrid.tsx',
  'src/app/(tenant)/assets/AssetLedgerTable.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/text-\[10px\]/g, 'text-xs');
  content = content.replace(/text-\[11px\]/g, 'text-xs');
  content = content.replace(/text-\[12px\]/g, 'text-sm');
  content = content.replace(/text-\[9px\]/g, 'text-xs');
  content = content.replace(/text-\[8px\]/g, 'text-xs');
  content = content.replace(/text-\[24px\]/g, 'text-2xl');
  content = content.replace(/text-\[32px\]/g, 'text-3xl');
  fs.writeFileSync(file, content);
});

console.log('Typography normalized.');
