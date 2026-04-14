/**
 * BUSINESS LOGIC ENUMS (SOVEREIGN EDITION)
 * 
 * These enums reflect the architectural business states of the application.
 * By decoupling from @prisma/client, we ensure that Actions and Services 
 * can communicate through a standardized, database-agnostic interface.
 */

export enum MaintenanceStatus {
  OPERATIONAL = 'OPERATIONAL',
  UNDER_REPAIR = 'UNDER_REPAIR',
  DECOMMISSIONED = 'DECOMMISSIONED'
}

export enum PaymentMode {
  CASH = 'CASH',
  BANK = 'BANK',
  MPESA = 'MPESA',
  CHEQUE = 'CHEQUE',
  CREDIT_CARD = 'CREDIT_CARD'
}

export enum EntryStatus {
  ACTIVE = 'ACTIVE',
  VOIDED = 'VOIDED'
}

export enum AccountCategory {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export type OperationType = 'INCOME' | 'EXPENSE';
