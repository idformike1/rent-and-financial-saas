import pkg from 'pg';
const { Client } = pkg;
import * as dotenv from 'dotenv';
dotenv.config();

async function testConnection(name: string, url: string | undefined) {
  if (!url) {
    console.log(`❌ ${name}: SKIPPED (URL not defined)`);
    return;
  }

  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    const res = await client.query('SELECT 1');
    console.log(`✅ ${name}: SUCCESSFUL (Result: ${JSON.stringify(res.rows[0])})`);
  } catch (err: any) {
    console.log(`❌ ${name}: FAILED - ${err.message}`);
  } finally {
    await client.end();
  }
}

async function run() {
  console.log('--- CONNECTION INTEGRITY TEST ---');
  await testConnection('DATABASE_URL (Transaction)', process.env.DATABASE_URL);
  await testConnection('DIRECT_URL (Migration)', process.env.DIRECT_URL);
}

run();
