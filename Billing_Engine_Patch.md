# Billing Engine Patch: Meter-to-Ledger Variables

## Objective
Upgrade the BillingEngine to orchestrate variable utility charges alongside flat-rate rent accruals, utilizing sequential meter readings and automated delta calculations. 

## Status: ACTIVE
The Meter-to-Ledger pipeline has been integrated into the sovereign transaction engine.

### Architectural Updates

#### 1. Schema Expansion
- **Model**: Created the `MeterReading` model.
- **Attributes**: Supports historical sequence (`value`, `date`) and sub-meter classification (`type: 'ELECTRIC' | 'WATER'`).
- **Relation**: Strongly tied to the `Unit` model for geospatial accuracy.

#### 2. Utility Calculation Service (`calculateUtilityCharge`)
- **Delta Engine**: Automatically grabs the last `MeterReading` and calculates the difference (`Current - Previous`).
- **Rate Multiplication**: Maps the structural delta to real fiat value (e.g. Electric = $15/unit, Water = $5/unit).
- **Audit Continuation**: Immediately records the new `Current` reading into the model for the subsequent cycle.

#### 3. Multi-Entry Ledger Orchestration
- **Redesigned Signature**: `generateRentAccrual` now accepts a dynamic `charges` array.
- **Aggregated Output**: 
  - Instead of one DEBIT and one CREDIT, the engine now produces **One Master DEBIT** (Accounts Receivable) balanced against **Multiple CREDITs** (e.g., Rental Income, Electric Income, Water Income).
  - Maintains strict Zero-Sum adherence within a single `Transaction` parent.

---
**Lead Financial Engineer**  
*Mercury Alpha Engine*
