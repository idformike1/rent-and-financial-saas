export interface Transaction {
  id: string;
  description: string;
  amount: number | any;
  transactionDate: Date | string;
  status?: 'ACTIVE' | 'VOIDED';
  account: { name: string; category?: string };
  expenseCategory?: { name: string };
  payee?: string;
  paymentMode?: 'CASH' | 'BANK';
  referenceText?: string;
  property?: { name: string };
  tenant?: { name: string };
  receiptUrl?: string;
}
