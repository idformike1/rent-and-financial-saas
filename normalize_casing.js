const fs = require('fs');

const files = [
  'src/app/(tenant)/assets/[propertyId]/PropertySovereignClient.tsx',
  'components/assets/PropertyMetricsHud.tsx',
  'src/app/(tenant)/assets/[propertyId]/UnitGrid.tsx',
  'src/app/(tenant)/assets/AssetLedgerTable.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Remove uppercase class and tracking overrides from buttons and headers
  content = content.replace(/uppercase tracking-\[0\.[1-3]em\]/g, '');
  content = content.replace(/uppercase tracking-widest/g, '');
  content = content.replace(/uppercase tracking-wider/g, '');
  content = content.replace(/uppercase tracking-tight/g, '');
  content = content.replace(/uppercase tracking-clinical/g, '');
  content = content.replace(/uppercase/g, '');
  // Also clean up any double spaces that might have been created
  content = content.replace(/\s\s+/g, ' ');
  fs.writeFileSync(file, content);
});

console.log('Case normalization complete. "Quiet Confidence" restored.');
