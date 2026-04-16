// prisma.config.ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // The CLI will now use the direct 5432 connection for all migrations
    url: env('DIRECT_URL'),
  },
});