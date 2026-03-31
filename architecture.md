# SYSTEM ARCHITECTURE BOUNDARIES

## 1. The React Server Component (RSC) Payload Boundary
* **Default to Server:** All components in the `app/` directory MUST be Server Components by default.
* **Client Isolation:** Push `'use client'` as far down the tree as possible. Only use it on interactive leaves.
* **No Leaks:** Never pass sensitive data from a Server Component to a Client Component as a prop.

## 2. Server Actions (The Mutation Layer)
* All database mutations must occur inside Next.js Server Actions.
* Server Actions must NEVER be defined inline inside a Client Component.
* **Return Signature:** All Server Actions must return a standardized `{ success: boolean, message: string, data?: any }` interface.

## 3. Security & Transactions
* Never execute sequential, unlinked database writes for financial data. Wrap multi-step mutations in `prisma.$transaction`.
* Every Server Action must verify the active user session before querying the database.
