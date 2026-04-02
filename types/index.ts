import { MaintenanceStatus, ChargeType, AccountCategory, AuditActionType } from '@prisma/client'

// ----------------------------------------------------------------------------
// API Response Types
// ----------------------------------------------------------------------------
export interface SystemResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: "VALIDATION_ERROR" | "DB_LOCKED" | "UNAUTHORIZED" | "STATE_CONFLICT";
}

// ----------------------------------------------------------------------------
// Payload Types
// ----------------------------------------------------------------------------
export interface PaymentSubmissionPayload {
  tenantId: string;
  amountPaid: number; 
  transactionDate: string; // ISO date
  paymentMode: 'CASH' | 'BANK';
  referenceText: string;
}

// ----------------------------------------------------------------------------
// Model DTOs
// ----------------------------------------------------------------------------
export interface TenantDTO {
  id: string;
  name: string;
}

export interface ChargeDTO {
  id: string;
  tenantId: string;
  leaseId: string;
  type: ChargeType;
  amount: number;         // Represented as number for frontend math
  amountPaid: number;
  dueDate: Date;
  isFullyPaid: boolean;
}

export interface PaymentDrawerProps {
  tenant: TenantDTO;
  activeCharges: ChargeDTO[];
  onSuccess: () => void;
}
