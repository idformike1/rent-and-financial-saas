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

# 1. Update SovereignTable imports
sovereign_files = [
    "src/app/(tenant)/tenants/TenantClient.tsx",
    "src/app/(tenant)/treasury/LedgerClient.tsx",
    "src/app/(tenant)/assets/AssetClient.tsx",
]

for f in sovereign_files:
    update_file(f, [
        (r"import\s+\{\s*SovereignTable\s*\}\s+from\s+['\"]@/src/components/ui/SovereignTable['\"]", r"import { DataTable } from '@/src/components/system/DataTable'"),
        (r"<SovereignTable", r"<DataTable"),
        (r"</SovereignTable>", r"</DataTable>"),
    ])

# 2. Update MercuryTable imports
mercury_files = [
    "src/app/(tenant)/tenants/[tenantId]/TenantProfileView.tsx",
    "src/components/CommandCenter/LedgerView.tsx",
]

for f in mercury_files:
    # Pattern to match import { ..., MercuryTable, THead, TBody, TR, TD, ... } from '@/src/components/finova/ui-finova'
    pattern = r"import\s+\{([^}]*)\}\s+from\s+['\"]@/src/components/finova/ui-finova['\"]"
    
    def replace_import(match):
        imports = [i.strip() for i in match.group(1).split(',')]
        table_parts = {'MercuryTable', 'THead', 'TBody', 'TR', 'TD'}
        new_finova_imports = [i for i in imports if i not in table_parts and i != '']
        existing_table_imports = [i for i in imports if i in table_parts]
        
        result = ""
        if new_finova_imports:
            result += f"import {{ {', '.join(new_finova_imports)} }} from '@/src/components/finova/ui-finova'\n"
        if existing_table_imports:
            result += f"import {{ {', '.join(existing_table_imports)} }} from '@/src/components/system/DataTable'"
        return result

    with open(f, 'r') as file:
        content = file.read()
    
    new_content = re.sub(pattern, replace_import, content)
    if new_content != content:
        with open(f, 'w') as file:
            file.write(new_content)
        print(f"Updated mercury imports in {f}")
