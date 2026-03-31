# SYSTEM TECH STACK & DEPENDENCIES

## Core Framework
* Framework: Next.js (App Router strictly enforced)
* Language: TypeScript (Strict mode enabled)
* Runtime: Node.js (v20+)

## Data & Backend
* Database: PostgreSQL
* ORM: Prisma (`prisma`, `@prisma/client`)
* Auth: NextAuth.js / Auth.js

## Frontend & State
* Styling: Tailwind CSS
* Icons: Lucide React (`lucide-react`)
* Forms: React Hook Form (`react-hook-form`)
* Validation: Zod (`zod`, `@hookform/resolvers`)
* Charts: Recharts (`recharts`)

## BANNED LIBRARIES
* `moment` or `moment-timezone` (Use native `Intl` or `date-fns`)
* `styled-components` or `@emotion/react` 
* `axios` (Use native `fetch` API)
* `redux`
