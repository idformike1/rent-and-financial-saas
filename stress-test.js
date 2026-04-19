// stress-test.js
const targetUrl = 'http://localhost:3000/login';
const totalRequests = 100;

console.log(`\n🚀 AXIOM PROTOCOL: Initiating DoS Simulation targeting ${targetUrl}`);
console.log(`Firing ${totalRequests} requests concurrently...\n`);

async function runTest() {
    let successCount = 0;
    let blockedCount = 0;
    const startTime = Date.now();

    // Create an array of 100 concurrent fetch promises
    const requests = Array.from({ length: totalRequests }).map(async (_, index) => {
        try {
            const res = await fetch(targetUrl);

            if (res.status === 200) {
                successCount++;
                console.log(`[PASS] Request ${index + 1}: 200 OK`);
            } else if (res.status === 429) {
                blockedCount++;
                console.log(`[BLOCKED] Request ${index + 1}: 429 Too Many Requests`);
            } else {
                console.log(`[ERROR] Request ${index + 1}: ${res.status}`);
            }
        } catch (error) {
            console.log(`[FAIL] Request ${index + 1}: Connection Dropped`);
        }
    });

    await Promise.all(requests);
    const duration = (Date.now() - startTime) / 1000;

    console.log(`\n🛡️  SIMULATION COMPLETE (${duration} seconds)`);
    console.log(`✅ Allowed (200): ${successCount}`);
    console.log(`🛑 Throttled (429): ${blockedCount}`);

    if (blockedCount > 0) {
        console.log(`\nVerdict: RATE LIMITER IS ACTIVE AND FUNCTIONING.`);
    } else {
        console.log(`\nVerdict: RATE LIMITER FAILED. ALL REQUESTS PASSED.`);
    }
}

runTest();
