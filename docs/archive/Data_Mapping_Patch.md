# Mercury Alpha: Data Mapping Patch (Names)
**Role:** Backend Engineer  
**Status:** Identity Parsing & Persistence Hardened

## 1. String Splitting Protocol
The `inviteMember` server action has been updated to derive first and last names from the single input string to prevent null records.

- **Logic:** deriva `firstName` from the first word and `lastName` from the remaining string (trimming whitespace).
- **Benefit:** Eliminates the "null name" bug where new users had no identity metadata.

## 2. Infrastructure Synchronization
The data metadata is now correctly persisted through the entire invitation lifecycle.

- **Schema:** Expanded `Invitation` model to include `firstName` and `lastName`.
- **Consumption:** The `consumeInvitationService` now maps these name fields from the invitation to the finalized `User` record during account materialization.

## 3. UI Performance
- **Registry Table:** Validated the `UserTable` rendering logic. It now uses a filtered concatenation of `firstName` and `lastName`, with fallback to `name` and "UNNAMED OPERATOR".

## 4. Verification
- **Build Status:** `SUCCESS` (Verified via production build).
- **Prisma Client:** Regenerated (v7.6.0) with naming metadata.

---
*Mapping protocols enforced by Antigravity Engineering.*
