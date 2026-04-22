// scripts/stress-test.ts
import { logPersonalExpense } from '../actions/wealth.actions';

const categories = ['Food & Dining', 'Housing', 'Utilities', 'Subscriptions', 'Transport'];
const accounts = ['Checking', 'Savings', 'Credit Card'];

async function runStressTest() {
    console.log("🚀 Starting Stress Test: Ingesting 50 transactions...");

    for (let i = 0; i < 50; i++) {
        const data = {
            amount: Math.floor(Math.random() * 500) + 10,
            categoryId: 'test-category-id',
            payee: `Vendor ${i}`,
            date: new Date(2026, 3, Math.floor(Math.random() * 20) + 1).toISOString(),
            accountId: 'test-account-id',
        };

        await logPersonalExpense(data);
    }

    console.log("✅ Stress Test Complete: 50 transactions ingested.");
}

runStressTest().catch(console.error);