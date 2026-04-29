import os
import re

files_to_update = [
    "src/app/(tenant)/settings/registry/RegistryCockpitClient.tsx",
    "src/app/(tenant)/settings/categories/GovernanceRegistryClient.tsx",
    "src/app/(tenant)/settings/categories/page.tsx",
    "src/app/(tenant)/tenants/[tenantId]/LedgerTerminal.tsx",
    "src/app/(tenant)/tenants/[tenantId]/TenantProfileView.tsx",
    "src/app/(tenant)/treasury/payables/RegistrySurveillanceClient.tsx",
    "src/components/CommandCenter/LedgerView.tsx",
    "src/components/CommandCenter/PaymentForm.tsx",
    "src/components/CommandCenter/UtilityForm.tsx",
    "src/components/Admin/SettingsForm.tsx",
    "src/components/Tenants/ReverseTransactionModal.tsx",
    "src/components/Tenants/AdjustLedgerModal.tsx",
    "src/components/Tenants/LogUtilityModal.tsx",
    "src/components/Tenants/EditTenantModal.tsx",
    "src/components/finova/charts/PropertyWaterfall.tsx",
    "src/components/finova/tenants/OccupantDirectory.tsx",
]

for filepath in files_to_update:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    # 1. Update the existing import to remove Card
    # Pattern to match import { ..., Card, ... } from '@/src/components/finova/ui-finova'
    pattern = r"import\s+\{([^}]*)\}\s+from\s+['\"]@/src/components/finova/ui-finova['\"]"
    
    def replace_import(match):
        imports = match.group(1).split(',')
        new_imports = [i.strip() for i in imports if i.strip() != 'Card']
        if not new_imports:
            return f"import {{ Card }} from '@/src/components/system/Card'"
        else:
            return f"import {{ {', '.join(new_imports)} }} from '@/src/components/finova/ui-finova'\nimport {{ Card }} from '@/src/components/system/Card'"

    new_content = re.sub(pattern, replace_import, content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
