const fs = require('fs');
const path = require('path');

const TARGET_DIRS = ['app', 'components'];
const EXTENSIONS = ['.tsx', '.ts'];

const REPLACEMENTS = [
  { match: /shadow-(md|lg|xl)/g, replace: 'shadow-none' },
  { match: /rounded-(xl|2xl|3xl|full)/g, replace: 'rounded-[6px]' },
  { match: /backdrop-blur-(md|xl)/g, replace: 'bg-[#14161A]' }
];

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (EXTENSIONS.includes(path.extname(fullPath))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { match, replace } of REPLACEMENTS) {
        if (match.test(content)) {
          content = content.replace(match, replace);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Purged: ${fullPath}`);
      }
    }
  }
}

TARGET_DIRS.forEach(dir => {
  if (fs.existsSync(dir)) walkDir(dir);
});
console.log("MERCURY PURGE COMPLETE.");
