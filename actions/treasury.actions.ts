'use server';

/**
 * TREASURY DOMAIN ACTIONS (MOCK/HYBRID)
 * Materializing the Segmented Ledger feeds for Operating, Deposits, and Receivables.
 */

export async function getAccountLedger(accountId: string) {
  // Simulate network
  await new Promise(res => setTimeout(res, 400));

  let balance = 0;
  let entries: any[] = [];

  const today = new Date();
  const formatD = (d: Date) => d.toISOString().split('T')[0];
  
  if (accountId === 'operating') {
    balance = 2023267.12;
    entries = [
      { id: 'tx-001', date: formatD(today), payee: 'Stripe Payout', description: 'Settlement batch #703', amount: 12450.00 },
      { id: 'tx-002', date: formatD(new Date(today.getTime() - 86400000)), payee: 'Maintenance Corp', description: 'HVAC repair for Unit #102', amount: -450.00 },
      { id: 'tx-003', date: formatD(new Date(today.getTime() - 86400000 * 2)), payee: 'ACH Transfer', description: 'Capital influx from holding', amount: 50000.00 },
      { id: 'tx-004', date: formatD(new Date(today.getTime() - 86400000 * 4)), payee: 'Acme Property Management', description: 'Management fee allocation', amount: -2100.00 },
      { id: 'tx-005', date: formatD(new Date(today.getTime() - 86400000 * 5)), payee: 'John Doe', description: 'Rent collection (Unit #4)', amount: 2400.00 },
    ];
  } else if (accountId === 'deposits') {
    balance = 450000.00;
    entries = [
      { id: 'tx-010', date: formatD(new Date(today.getTime() - 86400000 * 3)), payee: 'Sarah Connor', description: 'Security Deposit (Unit #7)', amount: 3000.00 },
      { id: 'tx-011', date: formatD(new Date(today.getTime() - 86400000 * 10)), payee: 'Kyle Reese', description: 'Security Deposit Refund', amount: -2500.00 },
      { id: 'tx-012', date: formatD(new Date(today.getTime() - 86400000 * 15)), payee: 'Miles Dyson', description: 'Security Deposit (Unit #2)', amount: 4500.00 },
    ];
  } else if (accountId === 'receivables') {
    balance = 14200.00; // Represents outstanding
    entries = [
      { id: 'tx-020', date: formatD(new Date(today.getTime() - 86400000 * 1)), payee: 'Tenant Ledger', description: 'Late fee applied (Unit #3)', amount: 150.00 },
      { id: 'tx-021', date: formatD(new Date(today.getTime() - 86400000 * 2)), payee: 'Tenant Ledger', description: 'Missed rent cycle', amount: 2400.00 },
      { id: 'tx-022', date: formatD(new Date(today.getTime() - 86400000 * 4)), payee: 'Collection Agency', description: 'Partial recovery (Unit #12)', amount: -800.00 },
    ];
  } else {
    balance = 0;
    entries = [];
  }

  return {
    success: true,
    data: {
      balance,
      entries
    }
  };
}
