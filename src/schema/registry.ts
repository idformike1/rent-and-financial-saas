/**
 * THE SCHEMA REGISTRY (AXIOM ENTERPRISE EDITION)
 * 
 * Central registry for model-level field permissions. 
 * This ensures that the UI layer and Service layer never attempt to mutate
 * non-authorized fields during refactor operations.
 */

export const UI_REGISTRY = {
  property: {
    edit: ['name', 'address', 'status', 'description', 'propertyType'],
    view: ['id', 'createdAt', 'ledgerBalance', 'units', 'totalRevenue', 'totalExpenses']
  },
  tenant: {
    edit: ['name', 'email', 'phone', 'status', 'leaseStart', 'leaseEnd'],
    view: ['id', 'createdAt', 'balance', 'rentHistory', 'isDefaulting']
  },
  unit: {
    edit: ['unitNumber', 'type', 'category', 'marketRent', 'status'],
    view: ['id', 'propertyId', 'tenantId', 'updatedAt']
  },
  expense: {
    edit: ['amount', 'date', 'payee', 'description', 'category'],
    view: ['id', 'organizationId', 'transactionId', 'ledgerId']
  }
};

/**
 * BOUNDARY UTILITIES
 * 
 * Helper to verify field-level mutation permissions against the Unified Registry.
 */
export const isAuthorizedMutation = (model: keyof typeof UI_REGISTRY, field: string) => {
  const allowed = UI_REGISTRY[model]?.edit || [];
  return allowed.includes(field);
};
