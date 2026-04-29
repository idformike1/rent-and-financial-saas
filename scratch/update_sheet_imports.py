import os
import re

def update_file(filepath, replacements):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for pattern, repl in replacements:
        new_content = re.sub(pattern, repl, new_content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# Update SovereignSheet imports
sheet_files = [
    "src/app/(tenant)/settings/audit/AuditClient.tsx",
    "src/app/(tenant)/treasury/LedgerClient.tsx",
]

for f in sheet_files:
    update_file(f, [
        (r"import\s+\{\s*SovereignSheet\s*\}\s+from\s+['\"]@/src/components/ui/SovereignSheet['\"]", r"import { SideSheet } from '@/src/components/system/SideSheet'"),
        (r"<SovereignSheet", r"<SideSheet"),
        (r"</SovereignSheet>", r"</SideSheet>"),
    ])
