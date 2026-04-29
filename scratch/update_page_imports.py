import os
import re

mappings = {
    "src/app/(tenant)/assets/page.tsx": [
        (r'import AssetGrid from ["\']./AssetGrid["\']', r'import AssetGrid from "@/src/components/modules/assets/AssetGrid"')
    ],
    "src/app/(tenant)/assets/[propertyId]/page.tsx": [
        (r'import PropertySovereignClient from ["\']./PropertySovereignClient["\']', r'import PropertySovereignClient from "@/src/components/modules/assets/PropertySovereignClient"')
    ],
    "src/app/(tenant)/treasury/page.tsx": [
        (r'import TreasuryGrid from ["\']./TreasuryGrid["\']', r'import TreasuryGrid from "@/src/components/modules/treasury/TreasuryGrid"')
    ],
    "src/app/(tenant)/treasury/[accountId]/page.tsx": [
        (r'import AccountTelemetryHud from ["\']./AccountTelemetryHud["\']', r'import AccountTelemetryHud from "@/src/components/modules/treasury/AccountTelemetryHud"'),
        (r'import TreasuryLedgerTable from ["\']./TreasuryLedgerTable["\']', r'import TreasuryLedgerTable from "@/src/components/modules/treasury/TreasuryLedgerTable"')
    ],
    "src/app/(tenant)/treasury/feed/page.tsx": [
        (r'import TransactionFeedClient from ["\']./TransactionFeedClient["\']', r'import TransactionFeedClient from "@/src/components/modules/treasury/TransactionFeedClient"')
    ],
    "src/app/(tenant)/treasury/payables/page.tsx": [
        (r'import ExpenseFormClient from ["\']./ExpenseFormClient["\']', r'import ExpenseFormClient from "@/src/components/modules/treasury/ExpenseFormClient"'),
        (r'import ExpensesChartClient from ["\']./ExpensesChartClient["\']', r'import ExpensesChartClient from "@/src/components/modules/treasury/ExpensesChartClient"'),
        (r'import RegistrySurveillanceClient from ["\']./RegistrySurveillanceClient["\']', r'import RegistrySurveillanceClient from "@/src/components/modules/treasury/RegistrySurveillanceClient"')
    ]
}

for filepath, reps in mappings.items():
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for pattern, repl in reps:
        new_content = re.sub(pattern, repl, new_content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
