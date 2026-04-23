import * as dotenv from 'dotenv';
dotenv.config();

function verify() {
  const vars = ['AUTH_SECRET', 'DATABASE_URL', 'DIRECT_URL'];
  const missing = [];

  console.log('--- ENVIRONMENT SYNC DIAGNOSTIC ---');
  vars.forEach(v => {
    const exists = process.env[v] !== undefined;
    console.log(`${v}: ${exists ? '✅ DEFINED' : '❌ UNDEFINED'}`);
    if (!exists) missing.push(v);
  });

  if (missing.length > 0) {
    console.log(`\n🚨 CRITICAL: Missing variables: ${missing.join(', ')}`);
  } else {
    console.log('\n✨ ALL CORE VARIABLES DETECTED.');
  }
}

verify();
